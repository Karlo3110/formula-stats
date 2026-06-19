'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { JSX } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useLogin } from '@/hooks/use-auth';
import { getApiErrorCode, getApiErrorMessage } from '@/lib/utils/api-error';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth-schemas';

const ACCOUNT_NOT_ACTIVE = 'ACCOUNT_NOT_ACTIVE';

export function LoginForm(): JSX.Element {
  const router = useRouter();
  const login = useLogin();
  const {
    register: field,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => router.push('/dashboard'),
      onError: (error) => {
        if (getApiErrorCode(error) === ACCOUNT_NOT_ACTIVE) {
          const email = encodeURIComponent(getValues('email'));
          router.push(`/verify-email?email=${email}`);
        }
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {login.isError ? (
        <Alert variant="error">
          {getApiErrorMessage(login.error, 'Could not sign you in.')}
        </Alert>
      ) : null}

      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...field('email')}
      />
      <FormField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...field('password')}
      />

      <Button type="submit" isLoading={login.isPending} className="mt-2">
        Sign in
      </Button>
    </form>
  );
}
