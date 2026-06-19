import Link from 'next/link';
import type { JSX } from 'react';

import { AuthPanel } from '@/components/auth/AuthPanel';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Alert } from '@/components/ui/Alert';
import { Text } from '@/components/ui/Typography';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps): Promise<JSX.Element> {
  const { token } = await searchParams;

  return (
    <AuthPanel
      title="Set new password"
      subtitle="Choose a new password for your account."
      footer={
        <Text variant="muted">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </Text>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Alert variant="error">
          This reset link is invalid or has expired. Request a new one.
        </Alert>
      )}
    </AuthPanel>
  );
}
