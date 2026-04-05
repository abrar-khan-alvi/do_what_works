import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export type Message = {
  id: string;
  sender: 'user' | 'daniel';
  text: string;
  timestamp: number;
  isProposal?: boolean;
  proposalData?: {
    hypothesis: string;
    action: string;
    metric: string;
    duration: string;
  };
};

export type Session = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

interface ChatContextType {
  sessions: Session[];
  currentSessionId: string | null;
  currentSession: Session | null;
  isLoading: boolean;
  setCurrentSessionId: (id: string | null) => void;
  createNewSession: () => Promise<string>;
  deleteSession: (id: string) => Promise<void>;
  addMessage: (sessionId: string, message: Message) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/** Map API response to internal Session shape */
const mapApiSession = (s: any): Session => ({
  id: String(s.id),
  title: s.title || 'New Conversation',
  updatedAt: new Date(s.updated_at || Date.now()).getTime(),
  messages: (s.messages || []).map((m: any, idx: number) => ({
    id: m.id || String(idx),
    sender: m.sender as 'user' | 'daniel',
    text: m.text,
    timestamp: new Date(m.timestamp).getTime(),
    isProposal: m.is_proposal,
    proposalData: m.proposal_data || undefined,
  })),
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fetchAttempted = useRef(false);

  // Fetch all sessions on mount when authenticated
  const fetchSessions = useCallback(async () => {
    if (!isAuthenticated || !localStorage.getItem('access_token')) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await api.get('/api/v1/chat/sessions/');
      const mapped = res.data.map(mapApiSession);
      setSessions(mapped);
      // Removed auto-select here, will be handled by Daniel page params
    } catch (err) {
      console.error('Failed to fetch chat sessions:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
      fetchAttempted.current = true;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !fetchAttempted.current) {
      fetchSessions();
    }
  }, [isAuthenticated, fetchSessions]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setSessions([]);
      setCurrentSessionId(null);
      fetchAttempted.current = false;
      setHasError(false);
    }
  }, [isAuthenticated]);

  const createNewSession = useCallback(async (): Promise<string> => {
    try {
      const res = await api.post('/api/v1/chat/sessions/', { title: 'New Conversation' });
      const newSession = mapApiSession(res.data);
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      return newSession.id;
    } catch (err) {
      console.error('Failed to create new session:', err);
      throw err;
    }
  }, []);

  // Auto-create a session if list is empty after load
  useEffect(() => {
    if (!isLoading && isAuthenticated && localStorage.getItem('access_token') && sessions.length === 0 && fetchAttempted.current && !hasError) {
      createNewSession().catch(() => {});
    }
  }, [isLoading, isAuthenticated, sessions.length, createNewSession, hasError]);

  const deleteSession = useCallback(async (id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (currentSessionId === id) {
        setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
    try {
      await api.delete(`/api/v1/chat/sessions/${id}/`);
    } catch { /* ignored */ }
  }, [currentSessionId]);

  const addMessage = useCallback(async (sessionId: string, message: Message) => {
    // Generate an optimistic "temp" ID for immediate rendering
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = { ...message, id: tempId };

    // 1. Optimistic Update: Add to local state immediately
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, messages: [...s.messages, optimisticMessage], updatedAt: Date.now() };
      }
      return s;
    }));

    try {
      // 2. Server Sync: Persist to database
      const res = await api.post(`/api/v1/chat/sessions/${sessionId}/messages/`, {
        sender: message.sender,
        text: message.text,
        is_proposal: message.isProposal || false,
        proposal_data: message.proposalData || null,
      });

      // Map the server response back to our internal shape
      const serverMessage: Message = {
        id: res.data.id,
        sender: res.data.sender,
        text: res.data.text,
        timestamp: new Date(res.data.timestamp).getTime(),
        isProposal: res.data.is_proposal,
        proposalData: res.data.proposal_data || undefined,
      };

      // 3. Final Sync: Replace the optimistic "temp" message with the real server-assigned message
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const updatedMessages = s.messages.map(m => (m.id === tempId ? serverMessage : m));
          return { ...s, messages: updatedMessages };
        }
        return s;
      }));
    } catch (err) {
      console.error('Failed to persist message:', err);
      // Optional: Mark the message as "Failed" in UI
    }
  }, []);

  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    const truncated = title.substring(0, 50);
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, title: truncated } : s
    ));
    try {
      await api.patch(`/api/v1/chat/sessions/${sessionId}/`, { title: truncated });
    } catch { /* ignored */ }
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  return (
    <ChatContext.Provider value={{
      sessions,
      currentSessionId,
      currentSession,
      isLoading,
      setCurrentSessionId,
      createNewSession,
      deleteSession,
      addMessage,
      updateSessionTitle,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
