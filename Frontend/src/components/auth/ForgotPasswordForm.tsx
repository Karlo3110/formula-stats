'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { JSX } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useForgotPassword } from '@/hooks/use-auth';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/lib/validation/auth-schemas';

export function ForgotPasswordForm(): JSX.Element {
  const forgotPassword = useForgotPassword();
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit((values) => {
    forgotPassword.mutate(values.email);
  });

  if (forgotPassword.isSuccess) {
    return (
      <Alert variant="success">
        If an account exists for that email, a password reset link is on its way.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...field('email')}
      />
      <Button type="submit" isLoading={forgotPassword.isPending} className="mt-2">
        Send reset link
      </Button>
    </form>
  );
}
