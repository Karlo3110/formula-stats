# TanStack Query Standards

## 1. Overview
TanStack Query (React Query) owns **server state**: data that lives on the backend and is
fetched, cached, and synchronized. It is not for local UI state (that's `useState`/Zustand).

## 2. Version Requirements
- TanStack Query **v5+**. A single `QueryClient` provided at the app root.

## 3. Folder Structure
- Typed API client functions live in `lib/api/` (or a feature's `api/`).
- Query/mutation hooks live in `hooks/` or the feature's `hooks/`, wrapping those clients.
- Query keys are centralized per feature (a key factory), never inlined ad hoc.

## 4. Approved Patterns
- **Always go through a hook.** Components call `useUsers()`, never `useQuery` inline.
- **Query key factories** for stable, typed, hierarchical keys:
  ```ts
  export const userKeys = {
    all: ['users'] as const,
    list: (filters: UserFilters) => [...userKeys.all, 'list', filters] as const,
    detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  };
  ```
- **Validate responses** in the `queryFn` with Zod; return typed data (`rules/02-typescript.md`).
- **Mutations invalidate** the affected queries in `onSuccess` (or use optimistic updates
  with rollback in `onError`).
- Configure sensible `staleTime`/`gcTime` per query based on how fresh the data must be.
- Use `enabled` to gate dependent queries; never call hooks conditionally.
- Surface `isLoading` / `error` as real UI states (skeletons, error boundaries).

## 5. Forbidden Patterns
- ❌ `useEffect` + `fetch` + `useState` to load server data — that's what Query is for.
- ❌ Inline string query keys duplicated across files.
- ❌ Storing server data in Zustand/Redux "to share it" — Query's cache is the source.
- ❌ Asserting (`as`) on `queryFn` results instead of validating.
- ❌ Swallowing mutation errors; always handle/surface them.
- ❌ Disabling refetch globally to "stop flicker" — tune `staleTime` instead.

## 6. Security Requirements
- The API client attaches auth tokens centrally (interceptor), not per call.
- Never cache another user's data across a logout — clear the cache on auth change
  (`queryClient.clear()`).

## 7. Performance Requirements
- Tune `staleTime` to cut redundant refetches; use `placeholderData`/`keepPreviousData`
  for smooth pagination.
- Prefetch predictable navigations (`prefetchQuery`); use infinite queries for feeds.
- Deduplicate: identical keys share one in-flight request automatically — rely on it.

## 8. Testing Requirements
- Wrap hooks under test in a fresh `QueryClientProvider` with retries disabled.
- Mock the API client layer, not `fetch` internals; assert the hook's returned states.

## 9. Example
```ts
// hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user-api';
import { userKeys } from '@/lib/api/user-keys';

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userApi.list(filters),   // validates + returns User[]
    staleTime: 30_000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserDto) => userApi.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
```

## 10. Review Checklist
- [ ] Server data accessed via a Query hook, not `useEffect` + `fetch`.
- [ ] Query keys from a typed factory.
- [ ] `queryFn` validates responses with Zod.
- [ ] Mutations invalidate or optimistically update affected queries.
- [ ] `staleTime`/`gcTime` set intentionally; loading/error states surfaced.
- [ ] Cache cleared on logout; no cross-user leakage.
