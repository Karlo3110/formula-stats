export type Role = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface SessionResponse {
  user: User;
  accessToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyEmailInput {
  email: string;
  code: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}
