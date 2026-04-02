import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessContextType {
  isSubscribed: boolean;
  expiresAt: number | null;
  daysRemaining: number;
  subscribe: () => void;
  logout: () => void;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    return localStorage.getItem('isSubscribed') === 'true';
  });

  const [expiresAt, setExpiresAt] = useState<number | null>(() => {
    const stored = localStorage.getItem('expiresAt');
    return stored ? parseInt(stored, 10) : null;
  });

  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  useEffect(() => {
    if (isSubscribed && expiresAt) {
      const now = Date.now();
      const diff = expiresAt - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, days));

      if (diff <= 0) {
        setIsSubscribed(false);
        localStorage.setItem('isSubscribed', 'false');
      }
    } else {
      setDaysRemaining(0);
    }
  }, [isSubscribed, expiresAt]);

  const subscribe = () => {
    const tenDaysFromNow = Date.now() + 10 * 24 * 60 * 60 * 1000;
    setIsSubscribed(true);
    setExpiresAt(tenDaysFromNow);
    localStorage.setItem('isSubscribed', 'true');
    localStorage.setItem('expiresAt', tenDaysFromNow.toString());
  };

  const logout = () => {
    setIsSubscribed(false);
    setExpiresAt(null);
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('expiresAt');
  };

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
