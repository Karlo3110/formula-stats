# Playbook: Bug Fix

> Fix the root cause, prove it with a regression test, and don't break anything else.

## 1. Plan / Reproduce
- [ ] **Reproduce it reliably.** A bug you can't reproduce isn't understood yet. Capture
      exact steps, inputs, environment, and the observed vs. expected behavior.
- [ ] Write a **failing test** that reproduces the bug *before* fixing it. This proves the
      bug exists and locks in the fix (`rules/07-testing.md` §7).
- [ ] **Find the root cause**, not the symptom. Trace it to the source — use logs, traces,
      and the correlation id (`rules/observability/`). Don't patch where it surfaces if the
      cause is elsewhere.
- [ ] Assess blast radius: what else touches this code path / data?

## 2. Implement
- [ ] Make the **smallest change** that fixes the root cause. Resist scope creep — note
      unrelated issues separately (`rules/00-engineering-principles.md` §9).
- [ ] Keep the fix and any necessary refactor in **separate commits** (`rules/00` §8).
- [ ] Add defensive handling if the bug stemmed from an unhandled state/input
      (`rules/08-error-handling.md`).
- [ ] Don't introduce a new pattern to fix a bug; match the surrounding code.

## 3. Test
- [ ] The regression test now **passes** with the fix and **failed** without it.
- [ ] Run the surrounding suite; check edge cases the cause implies.
- [ ] If it was a data bug, verify no corrupt data remains (and plan a backfill if it does).

## 4. Document
- [ ] PR explains the **root cause**, the fix, and why it's correct — not just "fixed bug."
- [ ] Link the issue; note any data backfill or follow-up.
- [ ] If it revealed a gap in a standard, update the relevant `.claude/` doc.

## 5. Deploy
- [ ] Severity-appropriate path: routine bug → normal pipeline; production-impacting → see
      `playbooks/production-incident.md` and consider a hotfix/rollback.
- [ ] Backward-compatible; clear rollback noted (`architecture/deployment-architecture.md`).

## 6. Verify
- [ ] Confirm the fix in the environment where the bug occurred.
- [ ] Watch the relevant metric/error in Sentry/dashboards return to normal
      (`rules/observability/sentry.md`).
- [ ] Close the loop with the reporter.

## Definition of Done
Root cause fixed (not symptom) · regression test added (red→green) · no new regressions ·
cause documented · deployed and verified · any corrupt data remediated.
