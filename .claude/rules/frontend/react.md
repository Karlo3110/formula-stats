# React Standards

## 1. Overview
We write small, composable, strongly-typed function components. Logic lives in hooks;
components render. No class components.

## 2. Version Requirements
- React **19+**, function components and hooks only.
- TypeScript strict (`rules/02-typescript.md`).

## 3. Folder Structure
See `rules/04-file-organization.md` §4. Components are `PascalCase.tsx`; hooks are
`use-*.ts` exporting `useSomething`.

## 4. Approved Patterns
- **Function components with a typed props interface** (never `any`, never `...rest` of
  unknown shape).
- **Custom hooks** for any non-trivial logic (data, subscriptions, derived state). Keep
  components to "render the props."
- **Composition over configuration**: build complex UI from small components and
  `children`, not from giant prop matrices.
- **Lift state only as high as needed**; colocate state with the component that owns it.
- Derive state during render instead of mirroring props into `useState`.
- Stable, meaningful `key`s for lists (never the array index for dynamic lists).
- `useEffect` only for genuine synchronization with external systems; clean up
  subscriptions/timers in the return function.

## 5. Forbidden Patterns
- ❌ Class components.
- ❌ `function Component(props: any)` or untyped `{ ...rest }`.
- ❌ Business/data logic inline in components (extract to a hook).
- ❌ Mega-components (> ~150 lines / many responsibilities) — decompose.
- ❌ `useEffect` used to derive state that could be computed during render.
- ❌ Mutating state or props directly.
- ❌ Index keys on reorderable/filterable lists.

## 6. Security Requirements
- Render user content as text; `dangerouslySetInnerHTML` only with DOMPurify and review
  (`rules/05-security.md`).
- Never place secrets in client components or component state.

## 7. Performance Requirements
- `React.memo` / `useMemo` / `useCallback` on **measured** hot paths only — not by reflex.
- Avoid creating new object/array/function props every render where it causes re-renders
  of memoized children.
- Lazy-load heavy components; virtualize long lists.
- See `rules/06-performance.md` §5.

## 8. Testing Requirements
- Test components via their behavior using Testing Library (query by role/text, interact,
  assert outcomes) — not internal state. See `rules/07-testing.md`.
- Test custom hooks in isolation.

## 9. Examples
```tsx
// ❌ FORBIDDEN — logic and fetching tangled into the component
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchUsers().then(setUsers).finally(() => setLoading(false)); }, []);
  // ...
}

// ✅ REQUIRED — hook owns logic, component renders
function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: userApi.list });
}

interface UserListProps { onSelect: (id: string) => void; }

export function UserList({ onSelect }: UserListProps): JSX.Element {
  const { data: users, isLoading, error } = useUsers();
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;
  return (
    <ul>
      {users.map((user) => (
        <UserRow key={user.id} user={user} onSelect={onSelect} />
      ))}
    </ul>
  );
}
```
```tsx
// Typed, composable primitive
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
export function Button({ variant, size, isLoading = false, onClick, children }: ButtonProps): JSX.Element {
  /* ... */
}
```

## 10. Review Checklist
- [ ] Function component with a named props interface; no `any`.
- [ ] Logic extracted into hooks; component mostly renders.
- [ ] State colocated and minimal; no prop-mirroring effects.
- [ ] Stable keys; no index keys on dynamic lists.
- [ ] Memoization only where measured; effects clean up.
- [ ] User content rendered safely.
