import { createContext, useContext, useState, useCallback } from 'react';
import { API } from '../api/client';

const AuthContext = createContext(null);

function readStoredAdmin() {
  try {
    return JSON.parse(localStorage.getItem('divo_admin'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(readStoredAdmin);

  const login = useCallback(async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('divo_token', data.token);
    localStorage.setItem('divo_admin', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('divo_token');
    localStorage.removeItem('divo_admin');
    setAdmin(null);
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const { data } = await API.post('/auth/change-password', { currentPassword, newPassword });
    localStorage.setItem('divo_admin', JSON.stringify(data));
    setAdmin(data);
    return data;
  }, []);

  const isAuthenticated = !!localStorage.getItem('divo_token') && !!admin;

  return (
    <AuthContext.Provider value={{ admin, login, logout, changePassword, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext) ?? { admin: null, isAuthenticated: false, login: async () => null, logout: () => {}, changePassword: async () => null };
}