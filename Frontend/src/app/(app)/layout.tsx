import type { JSX, ReactNode } from 'react';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { AppHeader } from '@/components/layout/AppHeader';

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
