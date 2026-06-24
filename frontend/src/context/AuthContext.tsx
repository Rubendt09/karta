import type { UserInfo } from 'src/services/authService';

import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

import { authService } from 'src/services/authService';
import { userService } from 'src/services/userService';

// ----------------------------------------------------------------------

interface AuthContextType {
  user: UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser({
      userId: data.userId,
      email: data.email,
      name: data.name,
      role: data.role,
    });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      const userData = {
        userId: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      loading,
    }),
    [user, loading, refreshUser]
  );

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
