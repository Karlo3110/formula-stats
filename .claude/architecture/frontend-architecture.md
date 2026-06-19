# Frontend Architecture

## Purpose
Define how the Next.js/React frontend is structured so UI is composable, state is in the
right place, data flows predictably, and the client ships minimal JavaScript. Default to
the server; make interactivity opt-in.

## Layers & Responsibilities
```
Routes (app/)            → composition + server data fetching (Server Components)
  └ Feature components    → feature UI, composed from primitives
      └ UI primitives      → Button, Input, Modal (presentational, reusable)
Hooks                    → logic: data (TanStack Query) + behavior
State                    → server state = TanStack Query · client state = Zustand/useState
API client (lib/api)     → typed, validated calls to the backend
```

### Routes (`app/`)
- Server Components by default: fetch data on the server, compose feature components.
- Own layouts, loading/error boundaries, and route-segment config. No heavy logic here.

### Components
- **UI primitives** (`components/ui/`): presentational, typed props, no data fetching.
- **Feature components** (`components/features/<feature>/`): compose primitives + hooks for
  a capability. Decompose anything large (`rules/frontend/react.md`).

### Hooks
- All non-trivial logic lives in hooks. Components render. Data via Query hooks
  (`rules/frontend/tanstack-query.md`); behavior via custom hooks.

### State — put it in the right place
- **Server state** (anything from the backend): TanStack Query. Not Zustand, not Redux.
- **Shared client/UI state** (sidebar, wizard, theme): Zustand
  (`rules/frontend/zustand.md`).
- **Local component state**: `useState`/`useReducer`.
- **URL state** (filters, pagination, tabs): the URL/search params, so it's shareable.

### API client (`lib/api/`)
- Typed functions per resource; attach auth centrally; **validate responses with Zod**
  before returning (`rules/frontend/typescript-frontend.md`). The single boundary between
  app and backend.

## Dependency Rules
- UI primitives depend on nothing app-specific (reusable anywhere).
- Feature components may use primitives, hooks, and the API client — not other features'
  internals.
- Data fetching flows downward via props or feature hooks; lift state only as high as
  needed.
- No business logic in components or in the UI layer; it lives in hooks/services/the
  backend.

## Rendering Strategy (Decide Per Route)
- **Static / ISR** for content that's the same for everyone — fastest.
- **Server-rendered** for per-request/personalized pages.
- **Client** only for interactive leaves. Push `'use client'` to the smallest component.
See `rules/frontend/nextjs.md`.

## Example Flow
`app/dashboard/page.tsx` (Server Component) calls `getDashboardMetrics()` from `lib/api/`
(typed + Zod-validated) and renders `<DashboardView metrics=…/>`. An interactive
`<FilterBar/>` leaf is `'use client'` and uses a `useDashboardFilters` hook backed by URL
state; the list uses a `useUsers()` Query hook.

## Anti-Patterns
- ❌ `'use client'` on a whole page/layout to "make it work."
- ❌ Fetching server data in `useEffect` when a Server Component/Query hook fits.
- ❌ Server data stored in Zustand "to share it."
- ❌ Business logic and fetching tangled inside components.
- ❌ Monolithic components; prop-drilling through many layers (use composition/context).
- ❌ Asserting (`as`) API responses instead of validating.

## Cross-Cutting
- **Error handling**: error boundaries per feature region + global handler → Sentry
  (`rules/08-error-handling.md`, `rules/observability/sentry.md`).
- **Loading**: Suspense + skeletons; never blank screens.
- **Accessibility**: semantic HTML, roles, focus management, AA contrast
  (`rules/frontend/tailwind.md`).
- **Performance**: code-split, lazy-load, memoize measured hot paths
  (`rules/06-performance.md`).

## Related
`api-architecture.md`, `authentication-architecture.md`, `rules/frontend/`,
`examples/frontend/`.
