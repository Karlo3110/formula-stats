# Prompt: Feature Implementation

> Prepend the Universal Preamble from `prompts/README.md`.

```
TASK: Implement the following feature to the standards in .claude/.

FEATURE
{{one-paragraph description}}

ACCEPTANCE CRITERIA
- {{criterion 1}}
- {{criterion 2}}

CONTEXT
- Affected area(s): {{backend module / frontend slice}}
- Data involved: {{entities / new schema?}}
- Auth: {{required role(s) / ownership rule}}
- Non-functional: {{performance / security / observability notes}}

PROCESS — follow playbooks/new-feature.md exactly:
1. PLAN: Restate the requirement and acceptance criteria. Propose the data model and API
   contract. List the files you will create/change and the patterns you will reuse. If
   ANYTHING is ambiguous or a decision is irreversible, ASK before coding.
2. IMPLEMENT inside-out (schema → repository → service → DTO/controller → API client/hooks →
   UI), each layer per its rules/ file and mirroring examples/. Honor:
   - No `any`; explicit return types; named types (rules/02-typescript.md).
   - Controller→Service→Repository; no logic in controllers; ORM only in repositories
     (architecture/backend-architecture.md).
   - Validate all input (DTOs/Zod); never trust the client; secrets via config only
     (rules/05-security.md).
   - Typed domain exceptions; no silent catches (rules/08-error-handling.md).
   - Transactions for multi-step writes; paginate lists; no N+1 (rules/06-performance.md).
   - Validate API responses with Zod on the frontend; server-first rendering
     (rules/frontend/).
   - Structured logging + metrics for key events (rules/09-logging-observability.md).
3. TEST: behavior-focused unit tests (happy path, edge cases, error/authz paths) beside the
   code; integration/E2E for the critical path (rules/07-testing.md).
4. DOCUMENT: update OpenAPI, shared/ types, and any docs.

OUTPUT
- A short plan first (and STOP for questions if anything is ambiguous).
- Then the implementation as complete files (path + content), matching the repo structure.
- Then the tests.
- Finally, confirm each item in checklists/pr-review.md is satisfied (or call out gaps).
```
