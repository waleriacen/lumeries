import { NextResponse } from 'next/server';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { createClient } from '@supabase/supabase-js';
import { getTranslation, Language } from '@/lib/translations';

// Lazy initialization to avoid build-time errors
function getBrevoClient() {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const client = new SibApiV3Sdk.TransactionalEmailsApi();
  client.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    brevoApiKey || ''
  );
  return client;
}

function getBrevoContactsApi() {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const contactApi = new SibApiV3Sdk.ContactsApi();
  contactApi.setApiKey(
    SibApiV3Sdk.ContactsApiApiKeys.apiKey,
    brevoApiKey || ''
  );
  return contactApi;
}

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const brevoClient = getBrevoClient();
    const contactApi = getBrevoContactsApi();

    const body = await request.json();
    const { email, firstName, title, names, date, coordinates, tagline, style, language } = body;

    // Get translations for the user's language
    const lang = (language as Language) || 'en';
    const t = getTranslation(lang);

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Datum ist erforderlich' },
        { status: 400 }
      );
    }

    // 1. Save lead to Supabase
    const { error: supabaseError } = await supabase
      .from('leads')
      .insert({
        email,
        first_name: firstName || '',
        poster_type: 'moon_phase',
        customization_data: {
          title,
          names,
          date,
          coordinates,
          tagline,
          style,
        },
      })
      .select()
      .single();

    if (supabaseError) {
      // If email already exists, update the record
      if (supabaseError.code === '23505') {
        const { data: existingLead } = await supabase
          .from('leads')
          .select('download_count')
          .eq('email', email)
          .single();

        await supabase
          .from('leads')
          .update({
            first_name: firstName || '',
            poster_type: 'moon_phase',
            customization_data: {
              title,
              names,
              date,
              coordinates,
              tagline,
              style,
            },
            download_count: (existingLead?.download_count || 0) + 1,
            last_download_at: new Date().toISOString(),
          })
          .eq('email', email);
      } else {
        console.error('Supabase insert error:', supabaseError);
      }
    }

    // 2. Add contact to Brevo (or update if exists)
    try {
      await contactApi.createContact({
        email,
        attributes: {
          FIRSTNAME: firstName || '',
          POSTER_TYPE: 'moon_phase',
          LAST_DOWNLOAD: new Date().toISOString(),
        },
        listIds: [2], // "Free Poster Leads" list
        updateEnabled: true,
      });
    } catch (brevoContactError: unknown) {
      console.error('Brevo contact creation error:', brevoContactError);
    }

    // 3. Generate poster download URL (links to download page with format selection)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const posterParams = new URLSearchParams({
      title: title || '',
      names: names || '',
      date: date,
      coordinates: coordinates || '',
      tagline: tagline || '',
      style: style || 'midnight',
      lang: lang,
    });
    const downloadUrl = `${baseUrl}/download?${posterParams.toString()}`;

    // 4. Send email with Brevo
    const displayName = firstName || '';

    // Format date based on language
    const dateLocales: Record<Language, string> = {
      de: 'de-DE',
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES',
    };
    const formattedDate = date
      ? new Date(date).toLocaleDateString(dateLocales[lang], { day: '2-digit', month: 'long', year: 'numeric' })
      : '';

    // Plain text email content
    const textContent = `${t.emailGreeting}${firstName ? ' ' + firstName : ''},

${t.emailIntro}

${title || ''}
${names || ''} - ${formattedDate}

${t.emailDownloadButton}:
${downloadUrl}

${t.emailPrintTip} ${t.emailPrintText}

---
${t.emailQuestions}

Lumeries
hello@lumeries.com`;

    const sendSmtpEmail = {
      sender: {
        email: 'hello@lumeries.com',
        name: 'Lumeries',
      },
      replyTo: {
        email: 'hello@lumeries.com',
        name: 'Lumeries',
      },
      to: [
        {
          email,
          name: displayName,
        },
      ],
      subject: t.emailSubject,
      textContent: textContent,
    };

    await brevoClient.sendTransacEmail(sendSmtpEmail);

    // 5. Track analytics event
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'moon_poster_freebie_signup',
        user_identifier: email,
        metadata: {
          poster_type: 'moon_phase',
          customization: { title, names, date, coordinates, tagline, style },
        },
      });
    } catch (analyticsError) {
      console.error('Analytics tracking error:', analyticsError);
    }

    return NextResponse.json({
      success: true,
      message: 'E-Mail wurde erfolgreich gesendet!',
    });
  } catch (error: unknown) {
    console.error('Error processing freebie signup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json(
      {
        error: errorMessage || 'Anfrage konnte nicht verarbeitet werden',
      },
      { status: 500 }
    );
  }
}
