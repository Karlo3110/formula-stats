'use client';

import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { userApi } from '../api/user-api';
import { userKeys } from '../api/user-keys';
import { PaginatedUsers, User, UserFilters } from '../types/user.types';

/**
 * Server-state hooks. Components consume these — never call useQuery inline. Keys come from
 * the factory; the queryFn validates responses. `keepPreviousData` keeps the table stable
 * while paginating. See rules/frontend/tanstack-query.md.
 */
export function useUsers(filters: UserFilters): UseQueryResult<PaginatedUsers> {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userApi.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useUser(id: string): UseQueryResult<User> {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
    enabled: id.length > 0,
  });
}
