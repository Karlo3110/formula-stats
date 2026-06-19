# Engineering Standards — Master Ruleset

This file is the entry point. An AI agent (or a developer) must read this file first, then
read the technology-specific files that apply to the current task. These rules are
**non-negotiable defaults**. Deviating requires an explicit instruction in the task.

## How to use this in a project

1. Copy the entire `ai-coding-standards/` folder into the repository root (or a `/docs/standards` folder).
2. Reference it from the project's own `CLAUDE.md` / `.cursorrules` / agent config:
   `Follow all rules in ./ai-coding-standards/. Read the files relevant to the stack before writing code.`
3. Before writing any code, the agent reads the files matching the layer being worked on.

## File map — read the ones that apply

| File | When to read |
| --- | --- |
| `core/00-principles.md` | Always. Universal engineering rules. |
| `core/01-typescript.md` | Any TypeScript file. |
| `core/02-naming-conventions.md` | Always. Naming for every layer. |
| `core/03-git-workflow.md` | Committing, branching, PRs. |
| `core/04-env-and-config.md` | Any environment variable, secret, or config. |
| `core/05-security-baseline.md` | Always. Security is mandatory by default. |
| `core/06-solid.md` | Any service, class, or non-trivial logic. |
| `frontend/react.md` | React components. |
| `frontend/nextjs.md` | Next.js apps. |
| `frontend/design-system.md` | Any UI: colors, typography, spacing, components. |
| `frontend/routing-layouts-guards.md` | Layouts, routing, route guards, auth state, utils. |
| `frontend/graphql-codegen.md` | Any frontend GraphQL operation. |
| `frontend/i18n.md` | Any user-facing text. |
| `backend/api-contract.md` | Any REST endpoint (NestJS or .NET). |
| `backend/graphql.md` | Any GraphQL work + the REST/GraphQL split. |
| `backend/websockets.md` | Any real-time feature. |
| `backend/caching-redis.md` | Any caching or ephemeral state. |
| `backend/nestjs.md` | NestJS backends. |
| `backend/dotnet.md` | .NET (ASP.NET Core) backends. |
| `database/database-standards.md` | Any schema, migration, or query. |

## Canonical stack (fixed across all projects)

- **Frontend:** React + Next.js (App Router), Tailwind CSS v4 with CSS-variable tokens,
  TanStack Query for server state, Zustand for client state, GraphQL via codegen + REST via
  a typed http client, `next-intl` for translations.
- **Backend (Node):** NestJS + Prisma + PostgreSQL, GraphQL (code-first) + REST, Redis cache.
- **Backend (.NET):** ASP.NET Core Web API + EF Core + PostgreSQL, Redis cache.
- **Auth:** self-hosted. JWT access token (short-lived) + rotating refresh token (httpOnly
  cookie), account state machine, RBAC.
- **Caching/realtime:** Redis for caching, rate limiting, ephemeral state, and the WS adapter.
- **API surfaces:** REST and GraphQL coexist with distinct jobs — see `backend/graphql.md`.
- **Database:** PostgreSQL, UUID v7 primary keys.
- **Language:** TypeScript everywhere on the JS side. `any` is forbidden.
- **OS assumption:** Development on Windows. No Unix-only shell commands.

## The rules that override everything

1. **Single responsibility.** One function, component, service, or file does one thing.
2. **No `any`.** Everything is explicitly typed. Boundaries are validated at runtime.
3. **Components are dumb.** No business logic and no API calls inside components. Logic lives in services, hooks, or utilities.
4. **Controllers and resolvers are thin.** Routing/wiring and validation only. Logic lives in shared services used by both REST and GraphQL.
5. **Reuse before you build.** If a UI element, type, or utility is needed and does not exist, create it as a reusable unit in the correct shared location — never inline a one-off.
6. **No hardcoded design values or strings.** Colors, spacing, and typography come from tokens and shared components; user-facing text comes from translations.
7. **Secure by default.** Every route, resolver, and socket is protected unless explicitly marked public. Never leak internal fields.
8. **Return only what is used.** No overfetching, no under-typing, no leaking. Select fields and columns to match what the client renders.
9. **Depend on abstractions.** Services depend on repository/cache/infra interfaces, injected via DI — never `new` infrastructure inside business logic (SOLID).
10. **Explicit over implicit.** No magic. A reader must be able to trace behavior without guessing.
11. **Right surface for the job.** REST and GraphQL each have defined uses (`backend/graphql.md`); never duplicate an operation across both.
12. **Verify before finishing.** Re-check the response against every rule in the relevant files before considering a task done.

## Pre-flight checklist (run mentally before completing any task)

- [ ] Read the rule files relevant to this layer.
- [ ] No `any`; all functions, params, and returns are typed.
- [ ] No business logic or fetch calls inside components/controllers.
- [ ] New reusable pieces placed in shared locations, not inlined.
- [ ] Design values come from tokens/components, not literals.
- [ ] Endpoint protected (or explicitly public) and input validated.
- [ ] Response DTO contains only fields the client uses.
- [ ] Files and symbols follow naming conventions.
- [ ] Env/config changes added to `.env.example` and validated at startup.
