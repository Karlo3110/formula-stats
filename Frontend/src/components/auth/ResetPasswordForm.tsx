'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { JSX } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useResetPassword } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/utils/api-error';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/lib/validation/auth-schemas';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps): JSX.Element {
  const router = useRouter();
  const resetPassword = useResetPassword();
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = handleSubmit((values) => {
    resetPassword.mutate(
      { token, newPassword: values.newPassword },
      { onSuccess: () => router.push('/login?reset=1') },
    );
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {resetPassword.isError ? (
        <Alert variant="error">
          {getApiErrorMessage(resetPassword.error, 'Could not reset your password.')}
        </Alert>
      ) : null}

      <FormField
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...field('newPassword')}
      />
      <FormField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...field('confirmPassword')}
      />

      <Button type="submit" isLoading={resetPassword.isPending} className="mt-2">
        Reset password
      </Button>
    </form>
  );
}
