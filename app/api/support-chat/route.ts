import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get('message') as string;
    const email = formData.get('email') as string;
    const screenshot = formData.get('screenshot') as File | null;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return NextResponse.json({ error: 'Chat not configured' }, { status: 500 });
    }

    // Format the message
    const formattedMessage = `
🆕 Neue Support-Nachricht

📧 Email: ${email || 'Nicht angegeben'}
📝 Nachricht:
${message}

🕐 Zeit: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}
🌐 Von: lumeries.com
    `.trim();

    // Send text message first
    const textResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: formattedMessage,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!textResponse.ok) {
      const error = await textResponse.text();
      console.error('Telegram text error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // If there's a screenshot, send it as a photo
    if (screenshot && screenshot.size > 0) {
      const photoFormData = new FormData();
      photoFormData.append('chat_id', TELEGRAM_CHAT_ID);
      photoFormData.append('photo', screenshot);
      photoFormData.append('caption', `Screenshot von ${email || 'Besucher'}`);

      const photoResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
        {
          method: 'POST',
          body: photoFormData,
        }
      );

      if (!photoResponse.ok) {
        console.error('Telegram photo error:', await photoResponse.text());
        // Don't fail the whole request if just the photo fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
