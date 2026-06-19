# Prompt: Debugging

> Prepend the Universal Preamble from `prompts/README.md`.

```
TASK: Diagnose and fix the following bug, following playbooks/bug-fix.md. Fix the ROOT
CAUSE, not the symptom.

BUG REPORT
- Observed behavior: {{what happens}}
- Expected behavior: {{what should happen}}
- Repro steps: {{steps / inputs}}
- Environment: {{where it occurs}}
- Errors/logs: {{stack traces, correlation id, screenshots}}

PROCESS
1. REPRODUCE: confirm the failure. If you can't reproduce, say what you need.
2. WRITE A FAILING TEST that captures the bug before fixing it (rules/07-testing.md).
3. LOCATE ROOT CAUSE: trace from symptom to source using the code, logs, and trace/
   correlation id (rules/observability/). State the cause explicitly and the evidence.
4. ASSESS BLAST RADIUS: what else uses this path/data?
5. FIX with the SMALLEST change that addresses the cause. Keep any necessary refactor in a
   separate commit. Add defensive handling if it was an unhandled state/input
   (rules/08-error-handling.md). Do NOT expand scope.
6. VERIFY: the failing test now passes (and failed before the fix); the surrounding suite is
   green; no regressions.
7. If data was corrupted, propose a remediation/backfill.

OUTPUT
- Reproduction confirmation.
- The regression test.
- Root-cause explanation with evidence (not a guess).
- The minimal fix (files: path + content).
- Verification notes + any data remediation.
Do NOT patch where the error surfaces if the cause is elsewhere. Do NOT silence the error.
```
