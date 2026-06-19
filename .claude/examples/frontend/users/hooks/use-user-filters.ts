'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { UserFilters, UserStatus } from '../types/user.types';

const DEFAULT_LIMIT = 20;

/**
 * Keeps list filters in the URL so the view is shareable, bookmarkable, and survives
 * refresh — URL state, not component state, is the right home for filters/pagination.
 * See architecture/frontend-architecture.md (State).
 */
export function useUserFilters(): {
  filters: UserFilters;
  setSearch: (search: string) => void;
  setStatus: (status: UserStatus | undefined) => void;
  setOffset: (offset: number) => void;
} {
  const router = useRouter();
  const params = useSearchParams();

  const filters = useMemo<UserFilters>(
    () => ({
      limit: DEFAULT_LIMIT,
      offset: Number(params.get('offset') ?? 0),
      status: (params.get('status') as UserStatus | null) ?? undefined,
      search: params.get('search') ?? undefined,
    }),
    [params],
  );

  const update = useCallback(
    (next: Partial<Record<'search' | 'status' | 'offset', string | undefined>>) => {
      const sp = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === '') sp.delete(key);
        else sp.set(key, value);
      }
      router.replace(`?${sp.toString()}`);
    },
    [params, router],
  );

  return {
    filters,
    setSearch: (search) => update({ search, offset: '0' }),
    setStatus: (status) => update({ status, offset: '0' }),
    setOffset: (offset) => update({ offset: String(offset) }),
  };
}
