import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ChatMessage, generateMessageId, generateSessionId } from '@/lib/chat';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get messages for a session or create new session
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const action = searchParams.get('action');

  try {
    // Create new session
    if (action === 'create') {
      const newSessionId = generateSessionId();
      const lang = searchParams.get('lang') || 'de';

      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          id: newSessionId,
          language: lang,
          is_online: true,
        });

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }

      return NextResponse.json({
        sessionId: newSessionId,
        session: { id: newSessionId, language: lang, isOnline: true }
      });
    }

    // Get messages for existing session
    if (sessionId) {
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Messages fetch error:', messagesError);
        return NextResponse.json({ messages: [] });
      }

      const { data: session } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      // Transform to frontend format
      const formattedMessages: ChatMessage[] = (messages || []).map(msg => ({
        id: msg.id,
        sessionId: msg.session_id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at).getTime(),
      }));

      return NextResponse.json({ messages: formattedMessages, session });
    }

    return NextResponse.json({ error: 'Missing sessionId or action' }, { status: 400 });
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const content = formData.get('message') as string;
    const email = formData.get('email') as string;
    const screenshot = formData.get('screenshot') as File | null;

    if (!sessionId || !content) {
      return NextResponse.json({ error: 'Missing sessionId or message' }, { status: 400 });
    }

    // Get session
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    // Update session with email if provided
    if (email && existingSession && !existingSession.email) {
      await supabase
        .from('chat_sessions')
        .update({ email, last_activity: new Date().toISOString() })
        .eq('id', sessionId);
    } else if (existingSession) {
      await supabase
        .from('chat_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessionId);
    }

    // Create message
    const messageId = generateMessageId();
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        id: messageId,
        session_id: sessionId,
        content,
        sender: 'user',
      });

    if (insertError) {
      console.error('Message insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    const message: ChatMessage = {
      id: messageId,
      sessionId,
      content,
      sender: 'user',
      timestamp: Date.now(),
    };

    // Get message count for first message check
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    const isFirstMessage = count === 1;

    // Send to Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const lang = existingSession?.language || 'de';
      // Create short ID for easier identification (last 6 chars)
      const shortId = sessionId.slice(-6);
      const customerEmail = email || existingSession?.email || 'Anonym';

      const telegramMessage = isFirstMessage
        ? `🆕 *NEUER CHAT #${shortId}*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 ${customerEmail}\n` +
          `🌐 ${lang.toUpperCase()}\n\n` +
          `💬 ${content}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `🔑 \`${sessionId}\``
        : `💬 *#${shortId}* (${customerEmail})\n\n` +
          `${content}\n\n` +
          `🔑 \`${sessionId}\``;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'Markdown',
        }),
      });

      // Send screenshot if provided
      if (screenshot && screenshot.size > 0) {
        const photoFormData = new FormData();
        photoFormData.append('chat_id', TELEGRAM_CHAT_ID);
        photoFormData.append('photo', screenshot);
        photoFormData.append('caption', `📸 Screenshot - Session: ${sessionId}`);

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: photoFormData,
        });
      }
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
