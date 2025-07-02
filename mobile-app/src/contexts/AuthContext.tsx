import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  stageName: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isVerified: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  stageName: string;
  firstName?: string;
  lastName?: string;
  spotifyUrl?: string;
  soundcloudUrl?: string;
  instagramUrl?: string;
  securityAnswer: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const userData = await authService.getUser();
        setUser(userData);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      await SecureStore.setItemAsync('authToken', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authService.register(userData);
      await SecureStore.setItemAsync('authToken', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await SecureStore.deleteItemAsync('authToken');
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
      // Clear local state even if API call fails
      await SecureStore.deleteItemAsync('authToken');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getUser();
      setUser(userData);
    } catch (error) {
      console.log('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}