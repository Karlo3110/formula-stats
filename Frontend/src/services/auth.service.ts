import { httpClient } from '@/lib/http-client';
import type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SessionResponse,
  User,
  VerifyEmailInput,
} from '@/types/auth.types';

export const authService = {
  register: (input: RegisterInput): Promise<User> =>
    httpClient.post<User>('/auth/register', input),

  login: (input: LoginInput): Promise<SessionResponse> =>
    httpClient.post<SessionResponse>('/auth/login', input),

  logout: (): Promise<void> => httpClient.post<void>('/auth/logout'),

  me: (): Promise<User> => httpClient.get<User>('/auth/me'),

  verifyEmail: (input: VerifyEmailInput): Promise<User> =>
    httpClient.post<User>('/auth/verify-email', input),

  resendVerification: (email: string): Promise<void> =>
    httpClient.post<void>('/auth/resend-verification', { email }),

  forgotPassword: (email: string): Promise<void> =>
    httpClient.post<void>('/auth/forgot-password', { email }),

  resetPassword: (input: ResetPasswordInput): Promise<void> =>
    httpClient.post<void>('/auth/reset-password', input),
} as const;
