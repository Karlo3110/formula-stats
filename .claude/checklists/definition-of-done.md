# Definition of Done

> Work is "done" only when every applicable box is true. "It compiles" and "it's merged"
> are not done. Done means **complete, correct, tested, documented, observable, deployed,
> and verified.**

## Functionality
- [ ] All acceptance criteria are met and demonstrated.
- [ ] Edge cases and error paths are handled, not just the happy path.
- [ ] No TODOs/stubs left in the shipped path (or they're tracked as follow-ups).

## Code Quality
- [ ] Meets `checklists/pr-review.md` (types, architecture, naming, size, no dead code).
- [ ] Matches existing patterns and the golden examples; no unjustified new patterns/deps.

## Security
- [ ] `checklists/security-review.md` satisfied for anything touching auth/data/input/money.

## Tests
- [ ] New behavior is covered by tests in the same change; they assert behavior.
- [ ] Edge/error/authz paths covered; meaningful coverage on domain logic.
- [ ] Full suite green in CI (lint, typecheck, unit, integration, E2E where relevant).

## Performance
- [ ] `checklists/performance-review.md` satisfied for data/UI-heavy or hot-path changes.
- [ ] Meets the stated performance budget.

## Accessibility (UI)
- [ ] `checklists/accessibility-review.md` satisfied for user-facing UI.

## Observability
- [ ] Key events logged (structured, no PII); errors reported to Sentry.
- [ ] Relevant metrics emitted; dashboards/alerts cover the critical failure mode.
- [ ] You can answer from telemetry alone: is it working, how fast, who/what/where on
      failure, is it used? (`rules/09-logging-observability.md` §8)

## Documentation
- [ ] OpenAPI spec, `shared/` types, and relevant `.claude/` docs/ADRs updated.
- [ ] PR description: what, why, testing, risk/rollback.

## Deployment & Verification
- [ ] Deployed via the standard pipeline; migrations run as a controlled, backward-
      compatible step (`architecture/deployment-architecture.md`).
- [ ] `checklists/pre-deployment.md` satisfied.
- [ ] Verified in the target environment (preview/staging → production).
- [ ] Telemetry confirms healthy post-release; rollback path known.

---
If any applicable box is unchecked, the work is **not done** — finish it or explicitly track
and communicate the gap.
