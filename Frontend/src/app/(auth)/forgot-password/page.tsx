import Link from 'next/link';
import type { JSX } from 'react';

import { AuthPanel } from '@/components/auth/AuthPanel';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Text } from '@/components/ui/Typography';

export default function ForgotPasswordPage(): JSX.Element {
  return (
    <AuthPanel
      title="Reset password"
      subtitle="We'll email you a link to set a new password."
      footer={
        <Text variant="muted">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </Text>
      }
    >
      <ForgotPasswordForm />
    </AuthPanel>
  );
}
