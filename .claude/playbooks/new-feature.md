# Playbook: New Feature

> Build a new end-to-end capability — DB → backend → API → frontend — to standard.

## 1. Plan
- [ ] Restate the requirement in one sentence and the acceptance criteria as a checklist.
      If anything is ambiguous, **ask before building** (`README.md`: when in doubt, ask).
- [ ] Identify the feature boundary: which module(s) (backend) / feature slice (frontend).
      Organize by capability, not technical layer (`rules/04-file-organization.md`).
- [ ] Sketch the data model and the API contract first (`architecture/database-architecture.md`,
      `architecture/api-architecture.md`). Put shared request/response types in `shared/`.
- [ ] Check for existing code to reuse — patterns, components, utilities. Don't reinvent
      (`rules/01-code-quality.md` §9, Rule of Three).
- [ ] Note security, performance, and observability requirements up front, not after.
- [ ] For non-trivial work, write a short plan/ADR and get alignment.

## 2. Implement
Build inside-out, one thin vertical slice at a time:
- [ ] **Schema + migration** if needed (`playbooks/database-migration.md`).
- [ ] **Repository** — data access only, returns domain entities (`examples/backend/`).
- [ ] **Service** — business rules, transactions, typed exceptions.
- [ ] **DTOs** — validated input, shaped output. **Controller** — thin, guarded.
      (`rules/backend/nestjs.md`, `architecture/backend-architecture.md`)
- [ ] **API client + hooks** — typed, Zod-validated (`rules/frontend/tanstack-query.md`).
- [ ] **UI** — Server Component composition + client leaves; loading/error/empty states
      (`rules/frontend/`, `examples/frontend/`).
- [ ] Follow naming, typing, and size rules throughout (`rules/02`, `03`, `04`).
- [ ] Add logging/metrics for the feature's key events (`rules/09-logging-observability.md`).

## 3. Test
- [ ] Unit-test services/domain logic (happy path, edge cases, error paths, authz).
- [ ] Integration-test the controller→DB path; E2E the critical journey.
- [ ] Frontend: behavior tests for components/hooks; E2E the happy path.
- [ ] New behavior ships with tests in the same PR (`rules/07-testing.md`).

## 4. Document
- [ ] Update the OpenAPI spec; document new endpoints, params, errors.
- [ ] Update `shared/` types and any feature README/usage notes.
- [ ] If a pattern/decision changed, update the relevant `.claude/` doc + ADR.

## 5. Deploy
- [ ] Small, focused PR with what/why/testing/risk+rollback (`rules/10`).
- [ ] CI green (lint, types, tests, security scan). Migrations run as a controlled step
      before code; backward-compatible (`architecture/deployment-architecture.md`).
- [ ] Gate risky rollouts behind a feature flag.

## 6. Verify
- [ ] Exercise the feature in preview/staging, then production after release.
- [ ] Confirm telemetry: the feature emits metrics/logs and dashboards show it healthy
      (`rules/observability/monitoring-metrics.md`).
- [ ] Re-check the acceptance criteria. Done means verified, not merged.

## Definition of Done
All acceptance criteria met · layered + typed + validated · tested · documented · observable
· deployed and verified · `checklists/pr-review.md` satisfied.
