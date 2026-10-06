# ScrimX - Project-Level Rules

> Extends global CLAUDE.md. These rules are specific to this project.

---

## Vercel React Best Practices

Source: [vercel-labs/agent-skills/react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)

### 1. Eliminating Waterfalls

- **Never fetch sequentially when requests are independent.** Use `Promise.all()` or parallel data loading.
- **Prefetch data at the route/layout level**, not deep inside component trees.
- **Use `<Suspense>` boundaries** to stream slow data without blocking the entire page.
- **Avoid client-side fetch chains** — if component A fetches, then passes data to component B which fetches again, restructure so both fetch in parallel on the server.
- **Colocate data requirements with routes** — fetch in `page.tsx` / `layout.tsx`, not in deeply nested children.

```typescript
// BAD - Sequential waterfall
const user = await getUser(id);
const posts = await getPosts(user.id); // waits for user

// GOOD - Parallel when independent
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
```

### 2. Bundle Size

- **Always use `next/dynamic` for heavy client components** (charts, editors, maps, date pickers).
- **Import only what you need** — prefer `import { format } from "date-fns/format"` over `import { format } from "date-fns"`.
- **Avoid barrel files** (`index.ts` re-exports) in large modules — they defeat tree-shaking.
- **Keep `"use client"` boundaries as low as possible** — wrap only the interactive leaf, not the entire page.
- **Prefer CSS/Tailwind over JS animation libraries** when possible (lighter bundle).
- **Use `@next/bundle-analyzer`** periodically to audit large dependencies.

```typescript
// BAD - Entire page is client
"use client";
export default function Page() { /* everything is client */ }

// GOOD - Only interactive parts are client
export default function Page() {
  return (
    <div>
      <ServerRenderedContent />
      <InteractiveWidget /> {/* only this is "use client" */}
    </div>
  );
}
```

### 3. Server-Side Performance

- **Default to Server Components.** Only add `"use client"` when you need interactivity (state, effects, event handlers, browser APIs).
- **Use `loading.tsx` for route-level loading states** — built-in Suspense boundary per route segment.
- **Use `generateStaticParams` for known dynamic routes** to pre-render at build time.
- **Cache expensive computations** with `unstable_cache` or React `cache()` for request deduplication.
- **Never import server-only code in client components.** Use the `server-only` package to enforce boundaries.

### 4. Client-Side Data Fetching

- **Use React Query (`@tanstack/react-query`) for all client-side data fetching** — no raw `useEffect` + `fetch`.
- **Set `staleTime` appropriately** — don't refetch on every mount if data doesn't change frequently.
- **Use `queryKey` arrays consistently** — include all parameters that affect the query result.
- **Implement optimistic updates** for mutations that should feel instant (likes, toggles, status changes).
- **Prefetch data on hover/focus** for links to pages that need data.

```typescript
// BAD
useEffect(() => { fetch("/api/data").then(r => r.json()).then(setData); }, []);

// GOOD
const { data, isLoading } = useQuery({
  queryKey: ["scrims", teamId],
  queryFn: () => scrimApi.list(teamId),
  staleTime: 30_000,
});
```

### 5. Re-render Optimization

- **Lift state up only as far as necessary** — don't put everything in a top-level context.
- **Split contexts by update frequency** — auth context (rarely changes) separate from UI state (changes often).
- **Use `React.memo()` only for components that re-render with same props frequently** — don't wrap everything.
- **Pass primitives as props when possible** instead of objects (avoids referential inequality).
- **Use `useMemo` and `useCallback` only when there's a measured performance need** — not by default.
- **Avoid creating objects/arrays inline in JSX** — they create new references every render.

```typescript
// BAD - New object every render causes child re-render
<UserCard style={{ padding: 16 }} config={{ showAvatar: true }} />

// GOOD - Stable references
const cardStyle = useMemo(() => ({ padding: 16 }), []);
const cardConfig = useMemo(() => ({ showAvatar: true }), []);
<UserCard style={cardStyle} config={cardConfig} />
```

### 6. Rendering Performance

- **Use `key` prop correctly** — never use array index as key for lists that reorder/filter/insert.
- **Virtualize long lists** (`@tanstack/react-virtual` or `react-window`) for 100+ items.
- **Debounce search inputs** — don't fire API calls on every keystroke.
- **Use CSS `content-visibility: auto`** for off-screen sections.
- **Avoid layout thrashing** — batch DOM reads and writes.

### 7. JavaScript Performance

- **Prefer `Map` over plain objects** for frequent lookups/deletions with dynamic keys.
- **Use `Set` for membership checks** instead of `array.includes()` on large arrays.
- **Avoid deep cloning** — use structural sharing or immutable update patterns.
- **Debounce/throttle expensive event handlers** (scroll, resize, input).
- **Use Web Workers** for CPU-intensive operations (parsing, sorting large datasets).

### 8. Advanced Patterns

- **Use the URL as state for shareable/bookmarkable UI** — filters, sort, pagination via `searchParams`.
- **Implement optimistic UI** for mutations — update local state immediately, reconcile on server response.
- **Use `useTransition`** for non-urgent state updates (search filtering, tab switching) to keep the UI responsive.
- **Error boundaries** at route segment level — one failing section shouldn't crash the whole page.
- **Streaming with Suspense** — wrap slow data in `<Suspense>` to show the rest of the page immediately.

```typescript
// URL as state - shareable filters
const searchParams = useSearchParams();
const filter = searchParams.get("status") ?? "all";

function setFilter(status: string): void {
  const params = new URLSearchParams(searchParams);
  params.set("status", status);
  router.push(`?${params.toString()}`);
}
```

---

## Project-Specific Conventions

### Fonts
- **Bebas Neue** (`font-display`) for gaming/display headings — always uppercase
- **Inter** (`font-sans`) for body text
- **JetBrains Mono** (`font-mono`) for data readouts and small uppercase labels

### GSAP Animations
- **Always use `fromTo()`** — never `from()` in timelines (immediateRender bug causes invisible elements)
- Target wrapper divs with class selectors, not individual interactive components

### Theme
- Dark esports aesthetic with blue accent (oklch hue 260)
- All shadcn components use dark theme defaults
- Primary: `oklch(0.623 0.214 259)` (bright blue)
- Flat, hairline-bordered panels; no background grids or blurred glow blobs

### Component Patterns
- Extract reusable components: PageHeader, EmptyState, StatCard, DashboardCard
- Separate config from components (nav-config.ts, routes.ts)
- Keep files small — split when exceeding ~100 lines
