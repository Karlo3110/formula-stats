'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type JSX } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { useLogout } from '@/hooks/use-auth';
import type { User } from '@/types/auth.types';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps): JSX.Element {
  const router = useRouter();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = (): void => {
    setIsOpen(false);
    logout.mutate(undefined, { onSettled: () => router.replace('/') });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Avatar name={user.displayName} />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-surface p-1 shadow-lg"
        >
          <div className="border-b border-border/60 px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">
              {user.displayName}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="mt-1 w-full rounded-sm px-3 py-2 text-left text-sm text-foreground hover:bg-elevated"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
