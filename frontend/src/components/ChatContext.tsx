import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  setCurrentSessionId: (id: string | null) => void;
  createNewSession: () => string;
  deleteSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('daniel_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({
          ...s,
          updatedAt: s.updatedAt || Date.now(),
          messages: (s.messages || []).map((m: any) => ({
            ...m,
            timestamp: m.timestamp || Date.now()
          }))
        }));
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
        return [];
      }
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem('daniel_current_session_id');
    if (saved && sessions.some(s => s.id === saved)) return saved;
    return sessions.length > 0 ? sessions[0].id : null;
  });

  useEffect(() => {
    localStorage.setItem('daniel_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('daniel_current_session_id', currentSessionId);
    }
  }, [currentSessionId]);

  const createNewSession = useCallback(() => {
    const newId = `session_${Math.random().toString(36).substring(7)}`;
    const newSession: Session = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    return newId;
  }, []);

  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions, createNewSession]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (currentSessionId === id) {
        setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  }, [currentSessionId]);

  const addMessage = useCallback((sessionId: string, message: Message) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: [...s.messages, message],
          updatedAt: Date.now()
        };
      }
      return s;
    }));
  }, []);

  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, title: title.substring(0, 30) };
      }
      return s;
    }));
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  return (
    <ChatContext.Provider value={{ 
      sessions, 
      currentSessionId, 
      currentSession,
      setCurrentSessionId, 
      createNewSession, 
      deleteSession, 
      addMessage,
      updateSessionTitle
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
