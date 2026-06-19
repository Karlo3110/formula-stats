import Link from 'next/link';
import type { JSX } from 'react';

import { AuthPanel } from '@/components/auth/AuthPanel';
import { LoginForm } from '@/components/auth/LoginForm';
import { Alert } from '@/components/ui/Alert';
import { Text } from '@/components/ui/Typography';

interface LoginPageProps {
  searchParams: Promise<{ verified?: string; reset?: string }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<JSX.Element> {
  const { verified, reset } = await searchParams;

  return (
    <AuthPanel
      title="Sign in"
      subtitle="Welcome back to Formula Stats."
      footer={
        <Text variant="muted">
          No account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </Text>
      }
    >
      <div className="flex flex-col gap-4">
        {verified ? (
          <Alert variant="success">Email verified. You can sign in now.</Alert>
        ) : null}
        {reset ? (
          <Alert variant="success">Password updated. Sign in to continue.</Alert>
        ) : null}
        <LoginForm />
        <Text variant="muted" className="text-center">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Forgot your password?
          </Link>
        </Text>
      </div>
    </AuthPanel>
  );
}
