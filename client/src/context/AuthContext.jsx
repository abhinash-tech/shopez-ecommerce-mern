import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // On app load: validate token against the real API
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');
      if (!storedToken) {
        // No token at all — definitely a guest
        setLoading(false);
        return;
      }

      try {
        // Call the real /auth/me endpoint with the stored Bearer token
        const res = await api.get('/auth/me');
        // Backend returns: { success: true, data: { user: {...} } }
        setUser(res.data.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        // Token is expired, invalid, or server is down — treat as guest
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('accessToken', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Ignore server errors — logout locally regardless
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
