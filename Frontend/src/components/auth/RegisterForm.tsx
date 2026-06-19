'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { JSX } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { useRegister } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/utils/api-error';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/lib/validation/auth-schemas';

export function RegisterForm(): JSX.Element {
  const router = useRouter();
  const register = useRegister();
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit((values) => {
    register.mutate(values, {
      onSuccess: () => {
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {register.isError ? (
        <Alert variant="error">
          {getApiErrorMessage(register.error, 'Could not create your account.')}
        </Alert>
      ) : null}

      <FormField
        label="Display name"
        autoComplete="name"
        error={errors.displayName?.message}
        {...field('displayName')}
      />
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
        autoComplete="new-password"
        error={errors.password?.message}
        {...field('password')}
      />

      <Button type="submit" isLoading={register.isPending} className="mt-2">
        Create account
      </Button>
    </form>
  );
}
