# PR Review Checklist

> The author completes this **before requesting review**; the reviewer verifies it. An
> unchecked box is a blocking issue. Cite the rule when flagging.

## Scope & Hygiene
- [ ] PR is small and focused (one feature/fix); reviewable in ~20 minutes.
- [ ] Description states **what**, **why**, how **tested**, and **risk/rollback**.
- [ ] No mixed concerns (refactor + feature + fix tangled together).
- [ ] Conventional Commit title; branch named per `rules/10-git-and-version-control.md`.

## Types & Quality (`rules/01`, `02`, `03`, `04`)
- [ ] No `any`; explicit return types on all functions.
- [ ] Named types/interfaces for reused shapes; no unsafe assertions; strict null handled.
- [ ] No dead code, commented-out code, or duplicated logic.
- [ ] No magic strings/numbers; no unused imports/vars/params.
- [ ] Functions < 50 lines, files < 500, nesting ≤ 3; single responsibility.
- [ ] Names reveal intent and follow conventions; files match their primary export.

## Architecture (`architecture/`)
- [ ] Controller→Service→Repository respected; no logic in controllers; ORM only in
      repositories; dependencies point inward; no circular deps.
- [ ] Frontend: server-first; logic in hooks; state in the right layer; no business logic
      in components.

## Security (`rules/05`) — see `security-review.md` if it touches auth/data/input/money
- [ ] All input validated at the boundary; client never trusted.
- [ ] AuthN + authZ enforced server-side (role + resource ownership); default-deny.
- [ ] No secrets in code/logs; config via config module; correct `NEXT_PUBLIC_` boundary.
- [ ] No injection/XSS vectors; errors don't leak internals.

## Errors & Observability (`rules/08`, `09`)
- [ ] Typed errors; no silent catches; caught `unknown` narrowed; client-safe messages.
- [ ] Key events logged (structured, no PII/secrets); errors reported; metrics where due.

## Performance (`rules/06`) — see `performance-review.md` for hot paths
- [ ] No N+1; lists paginated; only needed fields selected.
- [ ] Multi-step writes transactional; caching has TTL + invalidation.
- [ ] No obvious blocking ops / needless re-renders.

## Tests (`rules/07`)
- [ ] New behavior has tests in this PR; they assert behavior, not internals.
- [ ] Happy path + edge cases + error/authz paths covered; no fake tests.
- [ ] CI green: lint, typecheck, tests, security scan.

## Docs
- [ ] OpenAPI / `shared/` types / relevant `.claude/` docs updated if contracts or patterns
      changed.

---
**Reviewer verdict:** approve / request changes — with a one-line rationale. Style is the
linter's job; review for substance. Be specific and kind; mark nits as `nit:`.
