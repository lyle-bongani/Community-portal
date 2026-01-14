'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/lib/types';
import { authApi, usersApi } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    mobileNumber: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Fetch full user profile to get profileImage (if available)
        if (userData.id) {
          fetchFullUserProfile(userData.id).catch(console.error);
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const fetchFullUserProfile = async (userId: string) => {
    try {
      const response = await usersApi.getById(userId);
      if (response.success && response.data) {
        const fullUserData = response.data as User;
        setUser(fullUserData);
        // Store user without profileImage to avoid localStorage quota issues
        const { profileImage, ...userWithoutImage } = fullUserData;
        localStorage.setItem('user', JSON.stringify(userWithoutImage));
      }
    } catch (error) {
      console.error('Failed to fetch full user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data) {
        const userData = response.data as User;
        setUser(userData);
        setIsAuthenticated(true);
        // Store user without profileImage to avoid localStorage quota issues
        const { profileImage, ...userWithoutImage } = userData;
        localStorage.setItem('user', JSON.stringify(userWithoutImage));
        if ((response as any).token) {
          localStorage.setItem('token', (response as any).token);
        }
        // Fetch full profile to get profileImage if available
        if (userData.id) {
          fetchFullUserProfile(userData.id).catch(console.error);
        }
        // Return user data for redirect logic
        return userData;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      // Extract error message from error object
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    mobileNumber: string;
  }) => {
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        const userData = response.data as User;
        setUser(userData);
        setIsAuthenticated(true);
        // Store user without profileImage to avoid localStorage quota issues
        const { profileImage, ...userWithoutImage } = userData;
        localStorage.setItem('user', JSON.stringify(userWithoutImage));
        if ((response as any).token) {
          localStorage.setItem('token', (response as any).token);
        }
        // Fetch full profile to get profileImage if available
        if (userData.id) {
          fetchFullUserProfile(userData.id).catch(console.error);
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      // Extract error message from error object
      const errorMessage = error.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const response = await usersApi.update(user.id, userData);
      if (response.success && response.data) {
        const updatedUser = response.data as User;
        setUser(updatedUser);
        // Store user without profileImage to avoid localStorage quota issues
        const { profileImage, ...userWithoutImage } = updatedUser;
        localStorage.setItem('user', JSON.stringify(userWithoutImage));
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
