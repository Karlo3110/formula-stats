import { z } from 'zod';

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  .max(MAX_PASSWORD_LENGTH);

export const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.').max(80),
  email: z.string().email('Enter a valid email address.'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Enter the 6-digit code.'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
