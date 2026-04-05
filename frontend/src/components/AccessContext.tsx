import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface AccessContextType {
  isSubscribed: boolean;
  expiresAt: number | null;
  daysRemaining: number;
  subscribe: () => Promise<void>;
  logout: () => void;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const initialized = useRef(false);

  const applySubscriptionData = useCallback((data: any) => {
    const active = data.is_valid ?? false;
    const exp = data.expires_at ? new Date(data.expires_at).getTime() : null;
    const days = data.days_remaining ?? 0;
    setIsSubscribed(active);
    setExpiresAt(exp);
    setDaysRemaining(days);
  }, []);

  // Fetch subscription status when authenticated
  useEffect(() => {
    if (!isAuthenticated || initialized.current) return;
    initialized.current = true;
    api.get('/api/v1/auth/subscription/')
      .then(res => applySubscriptionData(res.data))
      .catch(() => {
        setIsSubscribed(false);
        setExpiresAt(null);
        setDaysRemaining(0);
      });
  }, [isAuthenticated, applySubscriptionData]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setIsSubscribed(false);
      setExpiresAt(null);
      setDaysRemaining(0);
      initialized.current = false;
    }
  }, [isAuthenticated]);

  const subscribe = useCallback(async () => {
    const res = await api.post('/api/v1/auth/subscription/activate/');
    applySubscriptionData(res.data);
  }, [applySubscriptionData]);

  const logout = useCallback(() => {
    setIsSubscribed(false);
    setExpiresAt(null);
    setDaysRemaining(0);
  }, []);

  return (
    <AccessContext.Provider value={{ isSubscribed, expiresAt, daysRemaining, subscribe, logout }}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (context === undefined) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return context;
};
