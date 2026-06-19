# React Rules

Applies to all React code. Read with `frontend/design-system.md` and `core/01-typescript.md`.

## The core separation

| Concern | Lives in | Never in |
| --- | --- | --- |
| Rendering / layout | Components | — |
| API calls | Services (`services/`) | Components |
| Business logic / calculations | Utilities (`lib/`, `utils/`) or hooks | Components |
| Reusable stateful behavior | Hooks (`hooks/`) | Inlined in components |
| Server state (fetching/caching) | TanStack Query inside hooks | Components |
| Client/UI state | Local state or Zustand | — |

A component receives data and callbacks, and renders. It does not know how data is fetched
or how a value is computed.

## Component rules

- Function components only. Explicit typed props.
- Props type named `<Component>Props`, declared in the same file.
- No default exports for components except where a framework requires it.
- A component over 150 lines is split. Extract subcomponents and hooks.
- No inline complex logic in JSX. Compute values in named functions or variables above the
  return.
- No business conditions inline; extract predicates (see `core/00-principles.md`).

```tsx
type UserCardProps = {
  user: User;
  onSelect: (userId: string) => void;
};

export function UserCard({ user, onSelect }: UserCardProps): JSX.Element {
  const displayName = formatDisplayName(user);

  return (
    <button type="button" onClick={() => onSelect(user.id)}>
      <Heading level={3}>{displayName}</Heading>
      <Text variant="muted">{user.email}</Text>
    </button>
  );
}
```

## Data fetching

Components never call `fetch`. A hook wraps a service call with TanStack Query:

```ts
// services/user.service.ts
import { httpClient } from "@/lib/http-client";
import type { User } from "@/types/user.types";

export async function fetchUserById(userId: string): Promise<User> {
  return httpClient.get<User>(`/users/${userId}`);
}
```

```ts
// hooks/useUser.ts
import { useQuery } from "@tanstack/react-query";
import { fetchUserById } from "@/services/user.service";
import type { User } from "@/types/user.types";

export function useUser(userId: string) {
  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
  });
}
```

The component consumes the hook and renders states (loading, error, data). It still
contains no fetch logic.

## State

- Prefer local `useState`/`useReducer` for state owned by one component subtree.
- Use Zustand for cross-cutting client state (e.g. UI preferences, a sidebar's open state).
- Use TanStack Query for anything that comes from the server. Do not duplicate server data
  into client state.
- Never store derived values in state; compute them during render.

## Reusability rule (the "if it doesn't exist, build it" rule)

When a UI element is needed and no shared component exists:
1. Build it as a reusable component under `components/` (see design-system for primitives).
2. Type its props.
3. Use it. Do not inline a bespoke version.

A repeated pattern (used twice) is immediately extracted into a shared component.

## Forms

- Use a typed form library (React Hook Form) with a zod resolver.
- Validation schema is shared with the type via `z.infer`.
- Submission calls a service through a handler; the component does not contain the API call.

## Accessibility (minimum)

- Interactive elements are real buttons/links, not click handlers on `div`s.
- All inputs have associated labels.
- Images have `alt`. Icons that convey meaning have accessible labels.
- Keyboard navigation works; focus states are visible.

## Performance (only when measured)

- Do not pre-optimize with `memo`/`useMemo`/`useCallback` everywhere. Add them when a real
  render problem is identified.
- Stable keys for lists (never the array index for dynamic lists).
