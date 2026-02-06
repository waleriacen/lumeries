'use client';

import { useState, useEffect, useRef } from 'react';

type ChatSession = {
  id: string;
  email: string | null;
  language: string;
  is_archived: boolean;
  created_at: string;
  last_activity: string;
  message_count?: number;
  last_message?: string;
};

type ChatMessage = {
  id: string;
  session_id: string;
  content: string;
  sender: 'user' | 'support';
  created_at: string;
};

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simple password protection
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password - in production use proper auth
    if (password === 'lumeries2024') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Falsches Passwort');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/admin/chat?action=sessions&archived=${showArchived}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for selected session
  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/chat?action=messages&sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated, showArchived]);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession);
      // Poll for new messages every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedSession);
      }, 3000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [selectedSession]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedSession) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          sessionId: selectedSession,
          content: replyText,
        }),
      });

      if (res.ok) {
        setReplyText('');
        fetchMessages(selectedSession);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Archive/Unarchive session
  const handleArchive = async (sessionId: string, archive: boolean) => {
    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: archive ? 'archive' : 'unarchive',
          sessionId,
        }),
      });

      if (res.ok) {
        fetchSessions();
        if (selectedSession === sessionId) {
          setSelectedSession(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error archiving:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min`;
    if (diffHours < 24) return `vor ${diffHours} Std`;
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE');
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Einloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Support Chat Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                showArchived
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showArchived ? 'Aktive Chats zeigen' : 'Archiv zeigen'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('adminAuth');
                setIsAuthenticated(false);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Sessions List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-900">
                {showArchived ? 'Archivierte Chats' : 'Aktive Chats'}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({sessions.length})
                </span>
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Laden...</div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {showArchived ? 'Keine archivierten Chats' : 'Keine aktiven Chats'}
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                      selectedSession === session.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-semibold">
                            {(session.email?.[0] || '?').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {session.email || 'Anonym'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.language.toUpperCase()} · #{session.id.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTime(session.last_activity)}
                      </span>
                    </div>
                    {session.last_message && (
                      <p className="text-sm text-gray-600 truncate mt-2 pl-10">
                        {session.last_message}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 pl-10">
                      <span className="text-xs text-gray-400">
                        {session.message_count} Nachrichten
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(session.id, !session.is_archived);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {session.is_archived ? 'Wiederherstellen' : 'Archivieren'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            {selectedSession ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {sessions.find((s) => s.id === selectedSession)?.email || 'Anonym'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Session: {selectedSession.slice(-6)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const session = sessions.find((s) => s.id === selectedSession);
                      if (session) {
                        handleArchive(session.id, !session.is_archived);
                      }
                    }}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    {sessions.find((s) => s.id === selectedSession)?.is_archived
                      ? 'Wiederherstellen'
                      : 'Archivieren'}
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender === 'support'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender === 'support' ? 'text-blue-200' : 'text-gray-400'
                          }`}
                        >
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                      placeholder="Antwort schreiben..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={isSending || !replyText.trim()}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? 'Sende...' : 'Senden'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>Wähle einen Chat aus der Liste</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
