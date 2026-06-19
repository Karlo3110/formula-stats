'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { JSX } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Text } from '@/components/ui/Typography';
import { useResendVerification, useVerifyEmail } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/utils/api-error';
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from '@/lib/validation/auth-schemas';

interface VerifyEmailFormProps {
  email: string;
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps): JSX.Element {
  const router = useRouter();
  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email, code: '' },
  });

  const onSubmit = handleSubmit((values) => {
    verify.mutate(values, {
      onSuccess: () => router.push('/login?verified=1'),
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {verify.isError ? (
        <Alert variant="error">
          {getApiErrorMessage(verify.error, 'Could not verify your email.')}
        </Alert>
      ) : null}
      {resend.isSuccess ? (
        <Alert variant="success">
          If that account exists, a new code is on its way.
        </Alert>
      ) : null}

      <input type="hidden" {...field('email')} />
      <Text variant="muted">
        Enter the 6-digit code we sent to {email}.
      </Text>
      <FormField
        label="Verification code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        error={errors.code?.message}
        {...field('code')}
      />

      <Button type="submit" isLoading={verify.isPending} className="mt-2">
        Verify email
      </Button>
      <Button
        type="button"
        variant="ghost"
        isLoading={resend.isPending}
        onClick={() => resend.mutate(email)}
      >
        Resend code
      </Button>
    </form>
  );
}
