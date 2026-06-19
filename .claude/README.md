# Engineering Operating System

> **Authority**: This directory is the engineering source of truth for the repository.
> All work — human or AI-generated — MUST comply. When code and these documents
> disagree, these documents win. When in doubt, ask.

This system exists so that **any engineer or AI agent can work in this repository
with complete consistency**, producing code that a senior engineer who has never
seen the codebase before can understand, extend, and trust.

---

## How To Use This System

| You are… | Start here |
|----------|------------|
| A new engineer onboarding | `rules/00-engineering-principles.md`, then your stack's file in `rules/` |
| An AI agent implementing a task | The matching file in `playbooks/`, then relevant `rules/` |
| Reviewing a pull request | `checklists/pr-review.md` |
| Designing a system | The matching file in `architecture/` |
| Writing new code | The golden example in `examples/` for your stack |
| Unsure how to phrase a task to an AI | `prompts/` |

**Reading order for a brand-new contributor:**
1. `rules/00-engineering-principles.md`
2. `rules/01-code-quality.md`
3. `rules/02-typescript.md`
4. `rules/03-naming-conventions.md`
5. `rules/04-file-organization.md`
6. The technology files in `rules/` relevant to your task
7. The golden example in `examples/` for your stack

---

## Directory Map

```
.claude/
├── README.md                  # You are here — the index and entry point
├── rules/                     # Enforceable standards (the "law")
│   ├── 00-engineering-principles.md
│   ├── 01-code-quality.md
│   ├── 02-typescript.md
│   ├── 03-naming-conventions.md
│   ├── 04-file-organization.md
│   ├── 05-security.md
│   ├── 06-performance.md
│   ├── 07-testing.md
│   ├── 08-error-handling.md
│   ├── 09-logging-observability.md
│   ├── 10-git-and-version-control.md
│   ├── frontend/              # Next.js, React, TypeScript, Tailwind, TanStack Query, Zustand
│   ├── backend/               # NestJS, .NET / ASP.NET Core, Entity Framework
│   ├── data/                  # PostgreSQL, Redis
│   ├── infrastructure/        # Docker, Kubernetes, Vercel, AWS
│   ├── integrations/          # Stripe, OpenAI, Resend, Auth providers, Webhooks
│   └── observability/         # Logging, Monitoring & Metrics, Sentry
├── architecture/              # System design standards (the "blueprints")
│   ├── frontend-architecture.md
│   ├── backend-architecture.md
│   ├── api-architecture.md
│   ├── database-architecture.md
│   ├── event-architecture.md
│   ├── authentication-architecture.md
│   ├── payment-architecture.md
│   └── deployment-architecture.md
├── examples/                  # Production-ready golden code (the "reference build")
│   ├── backend/               # A complete NestJS feature module
│   └── frontend/              # A complete Next.js feature slice
├── playbooks/                 # Step-by-step procedures (the "runbooks")
├── prompts/                   # Reusable AI task templates
└── checklists/                # Pre-flight and review gates
```

---

## The Non-Negotiables (Read This Even If You Read Nothing Else)

1. **No `any`. Ever.** Strong typing is mandatory. See `rules/02-typescript.md`.
2. **Explicit return types** on every function.
3. **Controller → Service → Repository.** No business logic in controllers, no raw
   SQL in services. See `architecture/backend-architecture.md`.
4. **Never trust input.** Validate everything at the boundary. See `rules/05-security.md`.
5. **No secrets in code.** Config flows through a config module only. See `rules/05-security.md`.
6. **Errors are typed and handled.** No silent catches. See `rules/08-error-handling.md`.
7. **Multi-step writes are transactional.** See `rules/data/` and `architecture/database-architecture.md`.
8. **Small units.** Functions < 50 lines, classes < 300 lines, files < 500 lines.
9. **Tests are part of "done."** See `rules/07-testing.md`.
10. **Follow the structure.** Never create files outside the defined layout without
    explicit approval. See `rules/04-file-organization.md`.

---

## Core Philosophy

Every standard in this system optimizes, in priority order, for:

**Simplicity → Readability → Maintainability → Scalability → Security → Performance → Testability → Explicitness.**

We prefer boring, obvious code over clever code. We prefer explicit dependencies over
hidden magic. We prefer deleting code over adding it. We build for the engineer who
inherits this in five years, not for the one writing it today.

---

## Document Conventions

- ✅ marks an approved pattern. ❌ marks a forbidden one. Both appear side by side so
  the contrast is unambiguous.
- "MUST" / "MUST NOT" are hard requirements enforced in review.
- "SHOULD" / "SHOULD NOT" are strong defaults; deviation requires a written reason in the PR.
- "MAY" denotes genuine discretion.

---

## Changing These Standards

These documents are versioned with the code. To change a standard:
1. Open a PR that edits the relevant file(s) here.
2. Explain the motivation and the migration impact in the PR description.
3. Get sign-off from a maintainer.
4. Update any affected golden examples in `examples/` in the same PR.

Standards that aren't kept current become lies. Treat drift between these docs and the
code as a bug.
