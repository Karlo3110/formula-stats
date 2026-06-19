# Playbook: Refactor

> Improve internal structure **without changing observable behavior**. A refactor that
> changes behavior is not a refactor — it's a feature or a bug, and it belongs in a
> separate change.

## 1. Plan
- [ ] State the goal precisely: what's wrong (duplication, god object, tight coupling,
      oversized unit, leaked layer) and what "better" looks like
      (`rules/00-engineering-principles.md`, `rules/04-file-organization.md`).
- [ ] **Confirm a behavior-preserving safety net exists.** If the code under refactor lacks
      tests, **add characterization tests first** that pin current behavior. You cannot
      safely refactor untested code.
- [ ] Scope it. Big refactors are a sequence of small, individually-safe steps, each
      committed separately. Don't mix with feature work (`rules/00` §8, §9).
- [ ] Verify the refactor is justified now — not speculative over-abstraction (Rule of
      Three, `rules/00` §6).

## 2. Implement
- [ ] Work in **small steps**; keep the test suite green after each. Commit per step
      (`rules/10-git-and-version-control.md`).
- [ ] Apply the target patterns: extract function/service/component, introduce an interface,
      invert a dependency, split a module, replace flags with discriminated unions
      (`rules/02-typescript.md` §6).
- [ ] Preserve the public contract (signatures, API, behavior). If a signature must change,
      update all call sites in the same step.
- [ ] Delete dead/commented code you're replacing — don't leave both (`rules/01` §4).
- [ ] Improve names/types as you go, but keep each change reviewable.

## 3. Test
- [ ] The **same tests pass before and after** — that's the proof behavior is unchanged.
- [ ] Tests assert behavior, not internals, so they survive the restructure
      (`rules/07-testing.md` §4). If a test breaks on a behavior-preserving change, the test
      was coupled to implementation — fix the test.
- [ ] Run the full suite + typecheck + lint.

## 4. Document
- [ ] PR clearly states: **"refactor — no behavior change,"** the motivation, and the
      before/after structure. If a pattern/decision changed, update the `.claude/` docs +
      ADR.

## 5. Deploy
- [ ] Ship as its own PR, separate from features/fixes. Standard pipeline; low-risk because
      behavior is unchanged and tests prove it.

## 6. Verify
- [ ] Confirm no behavioral or performance regression in staging/prod (same metrics, same
      outputs) (`rules/observability/monitoring-metrics.md`).

## Definition of Done
Structure improved · behavior provably unchanged (same tests green) · dead code removed ·
no mixed feature/fix changes · docs/ADR updated if patterns changed · no regression.

## Anti-Patterns
❌ Refactoring untested code with no safety net · ❌ mixing behavior changes into the refactor
· ❌ one giant unreviewable commit · ❌ speculative abstraction for a single use site.
