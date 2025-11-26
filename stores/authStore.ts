import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserPublic } from '@/types/entities/User';

interface AuthState {
  user: UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: UserPublic, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<UserPublic>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      name: 'codeblue-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
