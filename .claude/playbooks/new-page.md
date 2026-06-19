# Playbook: New Frontend Page

> Add a Next.js page that is server-first, accessible, typed, and fast.
> Read `architecture/frontend-architecture.md` and `rules/frontend/nextjs.md` first.

## 1. Plan
- [ ] Define the route, its data needs, and the rendering strategy: static/ISR (same for
      everyone), server-rendered (personalized), or client (highly interactive). Default to
      the server.
- [ ] Identify which data comes from the backend (TanStack Query / server fetch) and which
      state is local/URL.
- [ ] Sketch the component breakdown: page (composition) → feature components → primitives.
      Reuse existing `components/ui/` primitives (`rules/01-code-quality.md` §9).
- [ ] Note auth requirements (gated route?) and SEO/metadata needs.

## 2. Implement
- [ ] **`app/<route>/page.tsx`** as a **Server Component**: fetch data on the server,
      compose feature components (`examples/frontend/users/UsersPage.tsx`).
- [ ] **`loading.tsx`** (Suspense fallback) and **`error.tsx`** (error boundary) for async
      routes.
- [ ] Push `'use client'` to the smallest interactive leaves only.
- [ ] Data via **typed, Zod-validated** API client + Query hooks
      (`rules/frontend/tanstack-query.md`). Filters/pagination in **URL state**.
- [ ] Render **loading / error / empty** as real states — never a blank screen.
- [ ] Style with Tailwind tokens + `cn()`/`cva`; ensure focus states and AA contrast
      (`rules/frontend/tailwind.md`).
- [ ] Add `generateMetadata` for title/description; use `next/image`, `next/font`,
      `next/link`.
- [ ] Gate protected routes in middleware; remember the server still enforces authZ.

## 3. Test
- [ ] Behavior tests for interactive components/hooks (Testing Library).
- [ ] E2E the page's primary journey (Playwright).
- [ ] Accessibility check (keyboard nav, roles, contrast) on the happy path
      (`rules/07-testing.md`).

## 4. Document
- [ ] Note the route, its data sources, and any new shared components/hooks.

## 5. Deploy
- [ ] PR with preview deploy; run E2E against the preview
      (`architecture/deployment-architecture.md`, `rules/infrastructure/vercel.md`).
- [ ] Confirm only `NEXT_PUBLIC_` env reaches the client; check bundle size.

## 6. Verify
- [ ] Verify on the preview/prod URL across breakpoints and states.
- [ ] Check Core Web Vitals (LCP/INP/CLS) meet budget (`rules/06-performance.md`).

## Definition of Done
Server-first rendering · typed + validated data · loading/error/empty handled · accessible
+ AA contrast · metadata set · no secrets client-side · tested · Web Vitals within budget ·
verified on preview.
