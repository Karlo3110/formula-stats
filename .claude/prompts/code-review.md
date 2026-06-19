# Prompt: Code Review

> Prepend the Universal Preamble from `prompts/README.md`.

```
TASK: Review the following diff/PR against the .claude/ standards. Be specific, cite the
rule, and distinguish blocking issues from nits.

CHANGE
{{diff or description + files}}

REVIEW DIMENSIONS — check each and report findings:
1. CORRECTNESS — Does it do what it claims? Edge cases, null/undefined, off-by-one, async
   errors, race conditions.
2. SECURITY (rules/05-security.md) — Input validation at boundaries; authZ (role + resource
   ownership); no secrets in code/logs; injection/XSS; no internal leaks in errors; rate
   limiting on sensitive endpoints.
3. ARCHITECTURE (architecture/) — Layer separation (controller→service→repository); no logic
   in controllers; ORM only in repositories; dependencies point inward; no circular deps.
4. TYPING (rules/02-typescript.md) — No `any`; explicit return types; no unsafe assertions;
   strict null handling; responses validated not asserted.
5. ERROR HANDLING (rules/08) — Typed errors; no silent catches; catch unknown then narrow;
   client-safe messages.
6. PERFORMANCE (rules/06) — No N+1; lists paginated; transactions for multi-step writes;
   no obvious blocking/allocations; caching with TTL+invalidation.
7. TESTS (rules/07) — Present; assert behavior not implementation; cover edge/error/authz;
   no fake tests.
8. QUALITY (rules/01, 03, 04) — Naming reveals intent; no dead/commented/duplicated code;
   no magic literals; functions/files within size limits; single responsibility.
9. OBSERVABILITY (rules/09) — Key events logged (structured, no PII); errors reported;
   metrics where warranted.

OUTPUT FORMAT
- BLOCKING: issues that must be fixed before merge (cite the rule + file:line + the fix).
- NITS: non-blocking suggestions (prefix `nit:`).
- PRAISE: what's done well (brief).
- VERDICT: approve / request changes, with a one-line rationale.
Review for substance, not style (the linter owns style). Be kind and concrete.
```
