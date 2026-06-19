'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/use-auth-store';
import type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '@/types/auth.types';

/** Restores the session on mount by attempting a cookie-based refresh + /me. */
export function useInitAuth(): void {
  const setUser = useAuthStore((state) => state.setUser);
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    authService
      .me()
      .then((user) => setUser(user))
      .catch(() => setUnauthenticated());
  }, [setUser, setUnauthenticated]);
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (session) => setSession(session.user, session.accessToken),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
  });
}

export function useLogout() {
  const clear = useAuthStore((state) => state.clear);
  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => clear(),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: VerifyEmailInput) => authService.verifyEmail(input),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authService.resetPassword(input),
  });
}
