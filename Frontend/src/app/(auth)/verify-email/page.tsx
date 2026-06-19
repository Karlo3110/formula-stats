import Link from 'next/link';
import type { JSX } from 'react';

import { AuthPanel } from '@/components/auth/AuthPanel';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { Text } from '@/components/ui/Typography';

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps): Promise<JSX.Element> {
  const { email } = await searchParams;

  return (
    <AuthPanel
      title="Verify email"
      subtitle="Confirm your address to activate your account."
      footer={
        <Text variant="muted">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </Text>
      }
    >
      <VerifyEmailForm email={email ?? ''} />
    </AuthPanel>
  );
}
