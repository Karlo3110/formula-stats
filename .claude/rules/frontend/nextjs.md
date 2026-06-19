# Next.js Standards

## 1. Overview
Next.js (App Router) is our frontend framework. Default to the server: render on the
server, fetch on the server, and ship the minimum JavaScript to the client. Client
interactivity is opt-in, not the baseline.

## 2. Version Requirements
- Next.js **15+** (App Router only — the `pages/` router is forbidden in new code).
- React **19+**, Node **20 LTS+** (24 LTS on Vercel).
- TypeScript strict mode per `rules/02-typescript.md`.

## 3. Folder Structure
```
src/app/
├── layout.tsx                 # Root layout (providers, html/body)
├── page.tsx                   # Home route
├── (marketing)/               # Route groups for layout isolation
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx               # Server Component by default
│   ├── loading.tsx            # Suspense fallback
│   ├── error.tsx              # Error boundary (client)
│   └── _components/           # Route-private components (underscore = not a route)
└── api/
    └── webhooks/stripe/route.ts   # Route handlers for server endpoints
```
Reusable UI lives in `src/components/`, not under `app/`. See `rules/04-file-organization.md`.

## 4. Approved Patterns
- **Server Components by default.** Add `'use client'` only when you need state, effects,
  event handlers, or browser-only APIs — and push it to the smallest leaf component.
- **Fetch data in Server Components / route handlers**, close to where it's rendered.
  Parallelize independent fetches; avoid request waterfalls.
- **Server Actions** for mutations from forms; validate input inside the action with Zod.
- `loading.tsx` + `<Suspense>` for streaming; `error.tsx` for route-level error boundaries.
- `next/image`, `next/font`, and `next/link` for assets and navigation.
- Read config via typed helpers; only `NEXT_PUBLIC_*` vars reach the client.
- Set route segment config explicitly when needed (`export const dynamic`, `revalidate`).

## 5. Forbidden Patterns
- ❌ The `pages/` router in new code.
- ❌ `'use client'` at the top of a page/layout to "make things work."
- ❌ Fetching in a client `useEffect` when a Server Component or route handler can do it.
- ❌ Importing server-only code (DB clients, secrets) into client components.
- ❌ Secrets without the `NEXT_PUBLIC_` boundary discipline (`rules/05-security.md`).
- ❌ Disabling SSR globally to dodge hydration errors — fix the root cause.

## 6. Security Requirements
- Server-only secrets never cross into client bundles; verify with bundle analysis.
- Validate every Server Action and route-handler input (`rules/05-security.md`).
- Set security headers and CSP via `next.config` / middleware.
- Authenticate/authorize in middleware and/or per route handler; default-deny.

## 7. Performance Requirements
- Targets: LCP < 2.5 s, INP < 200 ms, CLS < 0.1.
- Prefer static/ISR where possible; choose rendering strategy deliberately per route.
- Code-split heavy client components with `next/dynamic`; lazy-load below the fold.
- Keep the client bundle lean; watch size in CI. See `rules/06-performance.md`.

## 8. Testing Requirements
- Server Components and utilities: unit tests.
- Critical journeys: Playwright E2E (`rules/07-testing.md`).
- Test Server Actions as functions with validated input and error paths.

## 9. Example
```tsx
// app/dashboard/page.tsx — Server Component, data fetched on the server
import { getDashboardMetrics } from '@/lib/api/dashboard';
import { DashboardView } from './_components/DashboardView';

export default async function DashboardPage(): Promise<JSX.Element> {
  const metrics = await getDashboardMetrics();
  return <DashboardView metrics={metrics} />;
}
```
```tsx
// app/dashboard/_components/FilterBar.tsx — client only where interactivity is needed
'use client';
import { useState } from 'react';

interface FilterBarProps { onChange: (range: DateRange) => void; }

export function FilterBar({ onChange }: FilterBarProps): JSX.Element {
  const [range, setRange] = useState<DateRange>('30d');
  return /* interactive controls */;
}
```

## 10. Review Checklist
- [ ] Server Component by default; `'use client'` only where required, at the leaf.
- [ ] Data fetched on the server; no client `useEffect` fetch where avoidable.
- [ ] No server-only imports/secrets in client code.
- [ ] `loading.tsx` / `error.tsx` present for async routes.
- [ ] Inputs to Server Actions / route handlers validated.
- [ ] Images, fonts, links use Next primitives; bundle size checked.
