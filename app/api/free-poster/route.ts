import { NextResponse } from 'next/server';
import * as SibApiV3Sdk from '@getbrevo/brevo';
import { createClient } from '@supabase/supabase-js';

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
    const { email, firstName, title, subtitle, date, location, coordinates } = body;

    // Validate required fields
    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Email and first name are required' },
        { status: 400 }
      );
    }

    // 1. Save lead to Supabase
    const { data: leadData, error: supabaseError } = await supabase
      .from('leads')
      .insert({
        email,
        first_name: firstName,
        poster_type: 'star_map',
        customization_data: {
          title,
          subtitle,
          date,
          location,
          coordinates,
        },
      })
      .select()
      .single();

    if (supabaseError) {
      // If email already exists, update the record
      if (supabaseError.code === '23505') {
        // First get current download_count, then increment
        const { data: existingLead } = await supabase
          .from('leads')
          .select('download_count')
          .eq('email', email)
          .single();

        const { error: updateError } = await supabase
          .from('leads')
          .update({
            first_name: firstName,
            customization_data: {
              title,
              subtitle,
              date,
              location,
              coordinates,
            },
            download_count: (existingLead?.download_count || 0) + 1,
            last_download_at: new Date().toISOString(),
          })
          .eq('email', email);

        if (updateError) {
          console.error('Supabase update error:', updateError);
        }
      } else {
        console.error('Supabase insert error:', supabaseError);
      }
    }

    // 2. Add contact to Brevo (or update if exists)
    try {
      await contactApi.createContact({
        email,
        attributes: {
          FIRSTNAME: firstName,
          POSTER_TYPE: 'star_map',
          LAST_DOWNLOAD: new Date().toISOString(),
        },
        listIds: [2], // Add to "Free Poster Leads" list (create this in Brevo dashboard)
        updateEnabled: true, // Update if contact already exists
      });
    } catch (brevoContactError: any) {
      console.error('Brevo contact creation error:', brevoContactError);
      // Continue even if contact creation fails
    }

    // 3. Generate poster URL (for now, we'll use a placeholder)
    // In production, you would generate a PDF here and upload to Vercel Blob or S3
    const posterUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/generate-pdf?type=star_map&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}&date=${date}&location=${encodeURIComponent(location)}&coordinates=${encodeURIComponent(coordinates || '')}`;

    // 4. Send email with Brevo
    const sendSmtpEmail = {
      sender: {
        email: 'hello@lumeries.com',
        name: 'Lumeries',
      },
      to: [
        {
          email,
          name: firstName,
        },
      ],
      subject: '🎉 Your Free Custom Star Map is Ready!',
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #7C3AED; font-size: 28px; margin-bottom: 10px; }
    .button { display: inline-block; background: linear-gradient(to right, #2563EB, #7C3AED); color: white; padding: 14px 32px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .features { background: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .feature-item { margin: 10px 0; padding-left: 25px; position: relative; }
    .feature-item:before { content: "✓"; position: absolute; left: 0; color: #10B981; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 14px; color: #6B7280; }
  </style>
</head>
<body>
  <h1>Hi ${firstName}! 🌟</h1>

  <p>Thank you for creating your custom star map! Your personalized poster is ready for download.</p>

  <div style="text-align: center;">
    <a href="${posterUrl}" class="button">📥 Download Your Poster</a>
  </div>

  <div class="features">
    <h3 style="margin-top: 0;">What's Included:</h3>
    <div class="feature-item">High-resolution PDF (300 DPI, print-ready)</div>
    <div class="feature-item">PNG file for digital use</div>
    <div class="feature-item">3 sizes: 8x10, 11x14, 16x20 inches</div>
  </div>

  <h3>How to Print:</h3>
  <p>Take the PDF to any print shop (Costco, Staples, FedEx, or your local printer) or print at home on high-quality paper!</p>

  <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">

  <h3>💝 Love your poster?</h3>
  <p>Discover our premium collection with even more customization options:</p>
  <ul>
    <li><strong>Custom Spotify Song Posters</strong> - Your favorite song as art</li>
    <li><strong>Coordinates Posters</strong> - Mark your special place</li>
    <li><strong>Premium Star Maps</strong> - Advanced designs with color options</li>
  </ul>

  <div style="text-align: center;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/custom-posters" class="button">Explore Premium Designs</a>
  </div>

  <div class="footer">
    <p>Questions? Just reply to this email - we're here to help!</p>
    <p style="font-size: 12px;">You're receiving this because you requested a free star map from Lumeries. If you don't want to receive occasional special offers, <a href="{{unsubscribe}}">unsubscribe here</a>.</p>
  </div>
</body>
</html>
      `,
    };

    await brevoClient.sendTransacEmail(sendSmtpEmail);

    // 5. Track analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'free_poster_download',
      user_identifier: email,
      metadata: {
        poster_type: 'star_map',
        customization: { title, subtitle, date, location, coordinates },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Poster sent successfully!',
    });
  } catch (error: any) {
    console.error('Error processing free poster request:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process request',
        details: error.response?.body || error.toString(),
      },
      { status: 500 }
    );
  }
}
