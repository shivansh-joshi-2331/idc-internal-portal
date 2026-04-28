import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: 'ADMIN' | 'EMPLOYEE';
  department: string;
  jobTitle: string;
  avatarGradient: string;
  bio?: string;
  skills?: string[];
  funFact?: string;
  socialLinks?: { linkedin?: string; behance?: string; twitter?: string };
  joinedAt?: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdmin: false,
      login: (token, user) => {
        set({ user, token, isAdmin: user.role === 'ADMIN' });
      },
      logout: () => {
        set({ user: null, token: null, isAdmin: false });
        window.location.href = '/login';
      },
      updateUser: (data) => {
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null }));
      },
    }),
    {
      name: 'idc-auth-store', // Saves to local storage
    }
  )
);
