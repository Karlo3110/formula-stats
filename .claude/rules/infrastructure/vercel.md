# Vercel Standards

## 1. Overview
Vercel hosts our Next.js frontend (and may host backend functions). Vercel is a full
compute platform — not just static hosting. Configuration is code; environments are
managed through Vercel, not hand-edited in the dashboard for anything reproducible.

> Platform note (current): Edge Functions are de-emphasized in favor of **Fluid Compute**
> (full Node.js, same regions/price, fewer cold starts). Middleware runs full Node.js.
> **Vercel Postgres/KV are retired** — use Marketplace databases (e.g., Neon Postgres,
> Upstash Redis). Default function timeout is 300s. `vercel.ts` (`@vercel/config`) is the
> recommended project configuration format.

## 2. Approved Patterns
- **Configuration as code** via `vercel.ts` (typed) — build command, framework, rewrites,
  redirects, headers, cron. Commit it.
- **Environment variables managed with the CLI** (`vercel env pull/add`), scoped per
  environment (Development/Preview/Production). Pull locally with `vercel env pull`.
- **`NEXT_PUBLIC_` boundary** enforced — only public values reach the client
  (`rules/05-security.md`).
- **Fluid Compute** (default) for server functions; choose region(s) near the data.
- **Preview deployments** per PR for review; **promote** a built deployment to production
  (build once, promote the same artifact). Use rolling releases for risky changes.
- **Marketplace integrations** for databases/auth/etc., which auto-provision env vars.
- Caching/ISR configured deliberately per route (`rules/frontend/nextjs.md`).
- Set security headers and cache-control through `vercel.ts` `headers`.

## 3. Forbidden Patterns
- ❌ Server-only secrets exposed via `NEXT_PUBLIC_` or referenced in client code.
- ❌ Hand-editing production env/config in the dashboard for things that should be in git.
- ❌ Long-blocking work in a request function — offload to a queue/background job/cron.
- ❌ Relying on retired primitives (Vercel Postgres/KV) in new code.
- ❌ Committing `.env*` (except `.env.example`) or pulled secrets.
- ❌ Defaulting new server code to Edge runtime when Fluid Compute (Node) fits better.

## 4. Security Requirements
- Secrets only in Vercel env (encrypted), never in the repo or client bundle.
- Verify webhook signatures in route handlers (`rules/integrations/webhooks.md`).
- Enable platform protections (WAF/Firewall, BotID) for public, abuse-prone endpoints.
- Strict CSP and security headers via config.

## 5. Performance Requirements
- Prefer static/ISR; cache aggressively where correctness allows; set explicit
  `cache-control`.
- Co-locate functions with their data region; keep client bundles lean (watch size in CI).
- Use streaming/Suspense for slow data. See `rules/06-performance.md`.

## 6. Deployment Workflow
- PR → automatic **Preview** deploy (run checks/E2E against it).
- Merge to `main` → build → deploy to Production (or promote the preview build).
- Roll back instantly by promoting the previous deployment. See `architecture/deployment-architecture.md`.

## 7. Example (`vercel.ts`)
```ts
import { routes, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  headers: [
    routes.cacheControl('/static/(.*)', { public: true, maxAge: '1 week', immutable: true }),
  ],
  crons: [{ path: '/api/jobs/cleanup', schedule: '0 3 * * *' }],
};
```

## 8. Review Checklist
- [ ] Config in `vercel.ts`, committed; env managed via CLI per environment.
- [ ] Only `NEXT_PUBLIC_` values client-side; no secrets in repo/bundle.
- [ ] Heavy work offloaded; functions co-located with data; Fluid Compute by default.
- [ ] Caching/ISR + security headers configured; webhooks verified.
- [ ] Preview-deploy checks pass before production promotion.
