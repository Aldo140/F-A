
import { useState, useEffect, useCallback } from 'react';
import { AUTO_LOCK_TIMEOUT } from './constants';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => 
    sessionStorage.getItem('is_auth') === 'true'
  );
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const login = useCallback(() => {
    setIsAuthenticated(true);
    sessionStorage.setItem('is_auth', 'true');
    setLastActivity(Date.now());
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('is_auth');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const resetActivity = () => setLastActivity(Date.now());
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(e => window.addEventListener(e, resetActivity));
    
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > AUTO_LOCK_TIMEOUT) {
        logout();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      events.forEach(e => window.removeEventListener(e, resetActivity));
    };
  }, [isAuthenticated, lastActivity, logout]);

  return { isAuthenticated, login, logout };
};
