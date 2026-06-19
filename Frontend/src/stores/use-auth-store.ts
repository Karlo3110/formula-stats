import { create } from 'zustand';

import { setAccessToken } from '@/lib/auth-session';
import type { User } from '@/types/auth.types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  setSession: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
  setUnauthenticated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  setSession: (user, accessToken): void => {
    setAccessToken(accessToken);
    set({ status: 'authenticated', user });
  },
  setUser: (user): void => set({ status: 'authenticated', user }),
  clear: (): void => {
    setAccessToken(null);
    set({ status: 'unauthenticated', user: null });
  },
  setUnauthenticated: (): void => set({ status: 'unauthenticated', user: null }),
}));
