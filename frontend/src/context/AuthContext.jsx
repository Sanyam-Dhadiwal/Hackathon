import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAccessToken, setAuthCallbacks } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessTokenState, setAccessTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync token with apiClient
  const updateAuth = useCallback((newUser, newToken) => {
    setUser(newUser);
    setAccessTokenState(newToken);
    setAccessToken(newToken);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessTokenState(null);
    setAccessToken(null);
  }, []);

  // Register listener with apiClient for automatic background refreshes
  useEffect(() => {
    setAuthCallbacks({
      onTokenRefreshed: (refreshedUser, newToken) => {
        updateAuth(refreshedUser, newToken);
      },
      onAuthFailure: () => {
        clearAuth();
      }
    });
  }, [updateAuth, clearAuth]);

  // On application startup, attempt silent refresh using HttpOnly cookie
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const res = await fetch('/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            updateAuth(data.user, data.access_token);
          }
        } else {
          if (isMounted) clearAuth();
        }
      } catch (err) {
        if (isMounted) clearAuth();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, [updateAuth, clearAuth]);

  const login = async (email, password) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    updateAuth(data.user, data.access_token);
    return data;
  };

  const register = async (name, email, password) => {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Registration failed');
    }

    updateAuth(data.user, data.access_token);
    return data;
  };

  const logout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
    }
  };

  const value = {
    user,
    accessToken: accessTokenState,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
