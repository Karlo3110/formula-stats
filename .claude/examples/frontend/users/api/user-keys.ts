import { UserFilters } from '../types/user.types';

/**
 * Query key factory — stable, typed, hierarchical keys. Centralizing keys makes targeted
 * cache invalidation safe and greppable. Never inline ad-hoc string keys.
 * See rules/frontend/tanstack-query.md §4.
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
