import { create } from 'zustand';
import { api } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialChecking: boolean;
  error: string | null;

  registerUser: (data: { name: string; email: string; password: string }) => Promise<void>;
  loginUser: (data: { email: string; password: string }) => Promise<void>;
  logoutUser: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialChecking: true,
  error: null,

  registerUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', data);
      const user = response.data.user;
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      throw err;
    }
  },

  loginUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', data);
      const user = response.data.user;
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  logoutUser: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    set({ isInitialChecking: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, isAuthenticated: true, isInitialChecking: false });
    } catch (e) {
      set({ user: null, isAuthenticated: false, isInitialChecking: false });
    }
  },

  clearError: () => set({ error: null }),
}));
