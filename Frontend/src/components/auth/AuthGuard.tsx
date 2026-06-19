'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type JSX, type ReactNode } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/use-auth-store';

/**
 * Client-side gate for the authenticated area. The backend independently
 * authorizes every request; hiding routes here is UX, not the security boundary
 * (.claude/rules/frontend/routing-layouts-guards.md).
 */
export function AuthGuard({ children }: { children: ReactNode }): JSX.Element {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
