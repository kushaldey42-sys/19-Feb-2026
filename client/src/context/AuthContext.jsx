import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Safely parse JSON, handling empty or non-JSON responses
  const safeParseJson = async (res) => {
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        // If backend didn't send JSON, likely server/proxy issue
        if (!data.message) {
          throw new Error('Unable to reach auth service. Is the backend running on http://localhost:5000?');
        }
        throw new Error(data.message || 'Login failed');
      }
      setUser(data.user);
      return data;
    } catch (err) {
      // Normalize network / parse errors into a user-friendly message
      throw new Error(err.message || 'Login failed');
    }
  };

  const signup = async (fullName, email, password, confirmPassword) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        if (!data.message) {
          throw new Error('Unable to reach auth service. Is the backend running on http://localhost:5000?');
        }
        throw new Error(data.message || 'Signup failed');
      }
      setUser(data.user);
      return data;
    } catch (err) {
      throw new Error(err.message || 'Signup failed');
    }
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
