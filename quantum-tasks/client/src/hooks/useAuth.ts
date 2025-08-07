import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('light');
  const queryClient = useQueryClient();

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('quantum-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  // Check if user is logged in on mount (Demo mode)
  useEffect(() => {
    const token = localStorage.getItem('quantum_token');
    if (token === 'demo-token') {
      // Demo user
      setUser({
        id: 'demo-user-id',
        name: 'Usuário Demo',
        email: 'admin@quantumtasks.com',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    setIsLoading(false);
  }, []);



  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // Demo login - accept specific credentials
      if (credentials.email === 'admin@quantumtasks.com' && credentials.password === 'admin123') {
        const demoUser = {
          id: 'demo-user-id',
          name: 'Usuário Demo',
          email: 'admin@quantumtasks.com',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        localStorage.setItem('quantum_token', 'demo-token');
        setUser(demoUser);
        queryClient.clear();
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Credenciais inválidas. Use: admin@quantumtasks.com / admin123' 
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/auth/register', credentials);
      
      if (response.token) {
        localStorage.setItem('quantum_token', response.token);
        setUser(response.user);
        
        // Clear all cached queries on register
        queryClient.clear();
        
        return { success: true };
      }
      
      return { success: false, error: 'No token received' };
    } catch (error: any) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error?.message || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  const logout = useCallback(() => {
    localStorage.removeItem('quantum_token');
    setUser(null);
    queryClient.clear();
    
    // Optional: Call logout endpoint to invalidate token on server
    apiRequest('POST', '/api/auth/logout').catch(() => {
      // Ignore errors on logout endpoint
    });
  }, [queryClient]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const response = await apiRequest('PUT', '/api/auth/profile', data);
      setUser(response);
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error?.message || 'Update failed' 
      };
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('quantum-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    theme,
    toggleTheme,
  };
}