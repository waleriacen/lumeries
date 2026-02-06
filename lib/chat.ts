// Chat types and utilities
export type ChatMessage = {
  id: string;
  sessionId: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: number;
  screenshot?: string; // Base64 or URL
};

export type ChatSession = {
  id: string;
  email?: string;
  language: string;
  createdAt: number;
  lastActivity: number;
  isOnline: boolean;
};

// Generate unique session ID
export function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Generate message ID
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
