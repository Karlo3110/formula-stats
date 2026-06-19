import Link from 'next/link';
import type { JSX } from 'react';

import { AuthPanel } from '@/components/auth/AuthPanel';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Text } from '@/components/ui/Typography';

export default function RegisterPage(): JSX.Element {
  return (
    <AuthPanel
      title="Create account"
      subtitle="Start tracking Formula 1 stats."
      footer={
        <Text variant="muted">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </Text>
      }
    >
      <RegisterForm />
    </AuthPanel>
  );
}
