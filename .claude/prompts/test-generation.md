# Prompt: Test Generation

> Prepend the Universal Preamble from `prompts/README.md`.

```
TASK: Write tests for the following code following rules/07-testing.md. Test BEHAVIOR, not
implementation. Every test must be able to fail for a real reason.

CODE UNDER TEST
{{file(s) / function / component}}

SCOPE
- Level: {{unit / integration / e2e}}
- Framework: {{Jest+Testing Library / xUnit / Playwright}}

REQUIREMENTS
1. STRUCTURE: place tests beside the code (*.spec.ts / *.e2e-spec.ts). Use describe →
   method, Arrange–Act–Assert, one logical assertion per test, behavior-stating names
   ("throws X when Y").
2. COVERAGE — include:
   - Happy path.
   - Edge cases: empty, null/undefined, boundaries, max sizes, zero/negative, unicode.
   - Error paths: invalid input rejected; downstream failures surface as typed errors.
   - Authorization: protected behavior rejects the wrong identity/role (if applicable).
3. MOCKING: mock at boundaries (network, DB in unit tests, time, randomness) — not
   everything. Inject clocks/ids for determinism. Reset mocks between tests. Use typed
   factories for fixtures (e.g., createMockUser(overrides)).
4. QUALITY: fast, isolated, deterministic (no flakiness), readable. Assert observable
   outcomes — NOT private calls/internal state (so tests survive refactors).
5. NO fake tests (expect(true).toBe(true)), no asserting the mock instead of the code.

TARGET: domain/business logic ≥ 90% meaningful coverage; prioritize money/auth/data-
integrity paths. Read the uncovered cases, not just the number.

OUTPUT
- The test file(s): path + content.
- Any shared test factory/helper introduced.
- A short note on what's covered and any gap you recommend covering at a different level.
```
