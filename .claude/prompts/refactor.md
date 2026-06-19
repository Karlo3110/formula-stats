# Prompt: Refactor

> Prepend the Universal Preamble from `prompts/README.md`.

```
TASK: Refactor the following code following playbooks/refactor.md. Improve internal
structure with ZERO change to observable behavior.

TARGET
{{files / module}}

PROBLEM TO ADDRESS
{{e.g., god object, duplication, leaked layer, oversized function, tight coupling}}

DESIRED OUTCOME
{{what "better" looks like — be concrete}}

PROCESS
1. SAFETY NET: confirm tests pin the current behavior. If coverage is missing, WRITE
   characterization tests first — do not refactor untested code (rules/07-testing.md).
2. PLAN small, individually-safe steps. Confirm the refactor is justified now, not
   speculative (Rule of Three, rules/00-engineering-principles.md §6).
3. EXECUTE step by step, keeping tests green after each:
   - Apply target patterns: extract function/service/component, introduce interface, invert
     dependency, split module, replace flags with discriminated unions.
   - Preserve public contracts; if a signature changes, update all call sites in the step.
   - Delete the dead/replaced code — don't leave both (rules/01-code-quality.md §4).
   - Enforce size/naming/typing rules (rules/02, 03, 04).
4. VERIFY: the SAME tests pass before and after — proof behavior is unchanged. Tests must
   assert behavior, not internals.

CONSTRAINTS
- NO behavior changes. NO feature work or bug fixes mixed in (separate PR).
- NO one giant commit — small reviewable steps.

OUTPUT
- The step plan.
- Any characterization tests added first.
- The refactored files (path + content).
- Confirmation that the same tests pass before/after and nothing else changed.
```
