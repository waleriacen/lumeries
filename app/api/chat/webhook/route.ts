import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateMessageId } from '@/lib/chat';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Telegram Webhook - receives replies from you
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    // Only process message replies
    if (!update.message?.text) {
      return NextResponse.json({ ok: true });
    }

    const text = update.message.text;
    const replyTo = update.message.reply_to_message;

    // Extract session ID from the reply
    let sessionId: string | null = null;

    if (replyTo?.text) {
      // Match various formats: "Session: chat_xxx", "Session chat_xxx", "`chat_xxx`", or just "chat_xxx"
      const match = replyTo.text.match(/Session:?\s*`?(chat_[a-z0-9_]+)`?/i) ||
                    replyTo.text.match(/`(chat_[a-z0-9_]+)`/) ||
                    replyTo.text.match(/(chat_[a-z0-9_]+)/i);
      if (match) {
        sessionId = match[1];
      }
    }

    if (replyTo?.caption) {
      const match = replyTo.caption.match(/Session: (chat_[a-z0-9_]+)/i);
      if (match) {
        sessionId = match[1];
      }
    }

    if (!sessionId) {
      // Try to extract from the message text itself (if user copies session ID)
      const directMatch = text.match(/(chat_[a-z0-9_]+)/i);
      if (directMatch) {
        // Check if it's just the session ID being referenced, extract the actual reply
        const parts = text.split(directMatch[1]);
        if (parts.length > 1 && parts[1].trim()) {
          sessionId = directMatch[1];
        }
      }

      if (!sessionId) {
        // Send help message back to Telegram
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: update.message.chat.id,
            text: '⚠️ Bitte antworte direkt auf eine Nachricht (Reply), damit ich weiß, zu welchem Chat die Antwort gehört.',
          }),
        });
        return NextResponse.json({ ok: true });
      }
    }

    // Get the reply content (remove session ID if it was included in the message)
    let replyContent = text.replace(sessionId, '').trim();
    if (!replyContent) {
      replyContent = text;
    }

    // Add support message to chat
    const messageId = generateMessageId();
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        id: messageId,
        session_id: sessionId,
        content: replyContent,
        sender: 'support',
      });

    if (insertError) {
      console.error('Message insert error:', insertError);
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: update.message.chat.id,
          text: `❌ Fehler: Session ${sessionId} nicht gefunden oder abgelaufen.`,
          reply_to_message_id: update.message.message_id,
        }),
      });
      return NextResponse.json({ ok: true });
    }

    // Confirm in Telegram
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: update.message.chat.id,
        text: `✅ Antwort gesendet an Session ${sessionId}`,
        reply_to_message_id: update.message.message_id,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return ok to Telegram
  }
}

// GET - For webhook verification
export async function GET() {
  return NextResponse.json({ status: 'Webhook active' });
}
