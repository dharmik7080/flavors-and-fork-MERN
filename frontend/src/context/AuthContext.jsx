import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('/api/auth/fetchsession');
        if (response.data.loggedIn && response.data.user) {
          setUser(response.data.user);
        } else {
          // Fallback check to localStorage to allow local mock login/testing
          const localUser = localStorage.getItem('flavorsAndForkUser');
          if (localUser) {
            setUser(JSON.parse(localUser));
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (userData) => {
    try {
      const response = await axios.post('/api/auth/savesession', { user: userData });
      if (response.data.status === 'success') {
        setUser(userData);
        localStorage.setItem('flavorsAndForkUser', JSON.stringify(userData));
        return true;
      }
    } catch (err) {
      console.error('Login session save failed:', err);
    }
    return false;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/deletesession');
    } catch (err) {
      console.error('Logout session deletion failed:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('flavorsAndForkUser');
    }
  };

  const requireAuth = (actionCallback, actionData = null, navigate) => {
    if (user && (user._id || user.id)) {
      actionCallback();
      return true;
    } else {
      if (actionData) {
        sessionStorage.setItem('pendingAction', JSON.stringify({
          ...actionData,
          pathname: window.location.pathname
        }));
      }
      if (navigate) {
        navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      } else {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
