'use client';

import type { JSX, ReactNode } from 'react';

import { useInitAuth } from '@/hooks/use-auth';

/** Restores the session once on app load (cookie refresh + /me). */
export function AuthInitializer({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  useInitAuth();
  return <>{children}</>;
}
