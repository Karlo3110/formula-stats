'use client';

import { useRouter } from 'next/navigation';
import type { JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import { useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/use-auth-store';

export function AppHeader(): JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const handleLogout = (): void => {
    logout.mutate(undefined, { onSettled: () => router.replace('/login') });
  };

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Heading level={3} display className="text-primary">
        Formula Stats
      </Heading>
      <div className="flex items-center gap-4">
        {user ? <Text variant="muted">{user.displayName}</Text> : null}
        <Button
          variant="secondary"
          size="sm"
          isLoading={logout.isPending}
          onClick={handleLogout}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
