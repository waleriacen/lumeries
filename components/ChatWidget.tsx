'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/lib/chat';

type Language = 'de' | 'en' | 'fr' | 'es';

const translations: Record<Language, {
  title: string;
  online: string;
  responseTime: string;
  placeholder: string;
  emailPlaceholder: string;
  send: string;
  sending: string;
  addScreenshot: string;
  screenshotAdded: string;
  removeScreenshot: string;
  welcomeMessage: string;
  close: string;
  you: string;
  support: string;
}> = {
  de: {
    title: 'Live Support',
    online: 'Online',
    responseTime: 'Wir antworten in der Regel innerhalb von Minuten',
    placeholder: 'Schreibe eine Nachricht...',
    emailPlaceholder: 'Deine E-Mail (für Antworten)',
    send: 'Senden',
    sending: 'Sende...',
    addScreenshot: 'Bild anhängen',
    screenshotAdded: 'Bild angehängt',
    removeScreenshot: 'Entfernen',
    welcomeMessage: 'Hallo! 👋 Wie können wir dir helfen? Beschreibe dein Problem oder deine Frage und wir melden uns so schnell wie möglich.',
    close: 'Schließen',
    you: 'Du',
    support: 'Support',
  },
  en: {
    title: 'Live Support',
    online: 'Online',
    responseTime: 'We typically respond within minutes',
    placeholder: 'Type a message...',
    emailPlaceholder: 'Your email (for replies)',
    send: 'Send',
    sending: 'Sending...',
    addScreenshot: 'Attach image',
    screenshotAdded: 'Image attached',
    removeScreenshot: 'Remove',
    welcomeMessage: 'Hello! 👋 How can we help you? Describe your issue or question and we\'ll get back to you as soon as possible.',
    close: 'Close',
    you: 'You',
    support: 'Support',
  },
  fr: {
    title: 'Support en direct',
    online: 'En ligne',
    responseTime: 'Nous répondons généralement en quelques minutes',
    placeholder: 'Écrivez un message...',
    emailPlaceholder: 'Votre email (pour les réponses)',
    send: 'Envoyer',
    sending: 'Envoi...',
    addScreenshot: 'Joindre image',
    screenshotAdded: 'Image jointe',
    removeScreenshot: 'Supprimer',
    welcomeMessage: 'Bonjour! 👋 Comment pouvons-nous vous aider? Décrivez votre problème ou question et nous vous répondrons dès que possible.',
    close: 'Fermer',
    you: 'Vous',
    support: 'Support',
  },
  es: {
    title: 'Soporte en vivo',
    online: 'En línea',
    responseTime: 'Normalmente respondemos en minutos',
    placeholder: 'Escribe un mensaje...',
    emailPlaceholder: 'Tu email (para respuestas)',
    send: 'Enviar',
    sending: 'Enviando...',
    addScreenshot: 'Adjuntar imagen',
    screenshotAdded: 'Imagen adjunta',
    removeScreenshot: 'Eliminar',
    welcomeMessage: '¡Hola! 👋 ¿Cómo podemos ayudarte? Describe tu problema o pregunta y te responderemos lo antes posible.',
    close: 'Cerrar',
    you: 'Tú',
    support: 'Soporte',
  },
};

export default function ChatWidget({ lang = 'de' }: { lang?: Language }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [email, setEmail] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = translations[lang] || translations.de;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create or restore session
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    const storedEmail = localStorage.getItem('chatEmail');

    if (storedEmail) {
      setEmail(storedEmail);
    }

    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Load existing messages
      fetchMessages(storedSessionId);
    }
  }, []);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (isOpen && sessionId) {
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(sessionId);
      }, 3000); // Poll every 3 seconds

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [isOpen, sessionId]);

  // Check for new messages even when closed
  useEffect(() => {
    if (!isOpen && sessionId) {
      const checkInterval = setInterval(async () => {
        const response = await fetch(`/api/chat?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          const currentMessageCount = messages.length;
          if (data.messages.length > currentMessageCount) {
            setHasNewMessage(true);
          }
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(checkInterval);
    }
  }, [isOpen, sessionId, messages.length]);

  const fetchMessages = useCallback(async (sid: string) => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sid}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const createSession = async () => {
    try {
      const response = await fetch(`/api/chat?action=create&lang=${lang}`);
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        localStorage.setItem('chatSessionId', data.sessionId);
        return data.sessionId;
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
    return null;
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);

    try {
      // Create session if needed
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = await createSession();
        if (!currentSessionId) {
          setIsLoading(false);
          return;
        }
      }

      // Save email to localStorage
      if (email) {
        localStorage.setItem('chatEmail', email);
      }

      const formData = new FormData();
      formData.append('sessionId', currentSessionId);
      formData.append('message', inputMessage);
      formData.append('email', email);
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setInputMessage('');
        setScreenshot(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setScreenshot(file);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(lang === 'en' ? 'en-US' : 'de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        aria-label="Open support chat"
      >
        {hasNewMessage && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        )}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[350px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}>
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">{t.title}</p>
                <div className="flex items-center gap-1 text-sm text-blue-100">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  {t.online}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* Welcome message if no messages */}
            {messages.length === 0 && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" />
                  </svg>
                </div>
                <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[80%]">
                  <p className="text-gray-700 text-sm">{t.welcomeMessage}</p>
                  <p className="text-xs text-gray-400 mt-2">{t.responseTime}</p>
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-gray-300' : 'bg-blue-600'
                }`}>
                  {msg.sender === 'user' ? (
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" />
                    </svg>
                  )}
                </div>
                <div className={`rounded-lg p-3 shadow-sm max-w-[80%] ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-700 rounded-tl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Email input (only show if no messages yet) */}
          {messages.length === 0 && (
            <div className="px-4 py-2 border-t bg-white">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            {/* Screenshot preview */}
            {screenshot && (
              <div className="flex items-center gap-2 p-2 mb-2 bg-blue-50 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="flex-1 text-sm text-blue-800 truncate">{t.screenshotAdded}</span>
                <button
                  onClick={() => setScreenshot(null)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {t.removeScreenshot}
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 transition"
                title={t.addScreenshot}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={t.placeholder}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
