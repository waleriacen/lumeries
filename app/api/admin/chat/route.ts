import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateMessageId } from '@/lib/chat';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch sessions or messages
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    // Get all sessions
    if (action === 'sessions') {
      const showArchived = searchParams.get('archived') === 'true';

      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('is_archived', showArchived)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ sessions: [] });
      }

      // Get message count and last message for each session
      const sessionsWithStats = await Promise.all(
        (sessions || []).map(async (session) => {
          const { data: messages } = await supabase
            .from('chat_messages')
            .select('content, sender')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);

          return {
            ...session,
            message_count: count || 0,
            last_message: messages?.[0]?.content || null,
          };
        })
      );

      return NextResponse.json({ sessions: sessionsWithStats });
    }

    // Get messages for a session
    if (action === 'messages') {
      const sessionId = searchParams.get('sessionId');

      if (!sessionId) {
        return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
      }

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ messages: [] });
      }

      return NextResponse.json({ messages: messages || [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send reply or archive/unarchive
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, content } = body;

    // Send reply
    if (action === 'reply') {
      if (!sessionId || !content) {
        return NextResponse.json({ error: 'Missing sessionId or content' }, { status: 400 });
      }

      const messageId = generateMessageId();
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          session_id: sessionId,
          content,
          sender: 'support',
        });

      if (insertError) {
        console.error('Error inserting message:', insertError);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
      }

      // Update session last_activity
      await supabase
        .from('chat_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessionId);

      return NextResponse.json({ success: true, messageId });
    }

    // Archive session
    if (action === 'archive') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
      }

      const { error } = await supabase
        .from('chat_sessions')
        .update({ is_archived: true })
        .eq('id', sessionId);

      if (error) {
        console.error('Error archiving session:', error);
        return NextResponse.json({ error: 'Failed to archive' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // Unarchive session
    if (action === 'unarchive') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
      }

      const { error } = await supabase
        .from('chat_sessions')
        .update({ is_archived: false })
        .eq('id', sessionId);

      if (error) {
        console.error('Error unarchiving session:', error);
        return NextResponse.json({ error: 'Failed to unarchive' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
