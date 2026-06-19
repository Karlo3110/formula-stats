# Testing Standards

> Tests exist to let us change code with confidence. A test that doesn't increase
> confidence — or that breaks when behavior is unchanged — is a liability. We test
> **behavior**, not implementation.

---

## 1. The Testing Pyramid

```
        ╱╲      E2E / Acceptance  — few, slow, high-value user journeys
       ╱──╲     Integration       — moderate; modules + real-ish dependencies
      ╱────╲    Unit               — many, fast, isolated business logic
```

- **Unit** — the default. Pure functions, services, domain logic, in isolation.
- **Integration** — a controller through to a real (test) database; a repository against
  a real schema; module wiring.
- **E2E** — critical end-to-end flows (signup, checkout, the core happy path) through the
  real stack.

Most coverage comes from unit tests because they are fast and precise. E2E covers the
handful of journeys that must never break.

---

## 2. Test File Structure & Naming

Tests live next to the code they test.

```
modules/user/
├── user.service.ts
├── user.service.spec.ts        # unit
├── user.controller.ts
└── user.e2e-spec.ts            # end-to-end
```

- Unit/integration: `*.spec.ts`. E2E: `*.e2e-spec.ts`.
- Describe blocks name the unit and the method: `describe('UserService')` →
  `describe('findById')`.
- Test names state the expected behavior in plain language:
  `it('throws NotFoundException when the user does not exist')`.

---

## 3. The Arrange–Act–Assert Shape

```typescript
describe('UserService', () => {
  describe('findById', () => {
    it('returns the mapped user when one exists', async () => {
      // Arrange
      const stored = createMockUser({ id: 'u_1', email: 'a@b.com' });
      userRepository.findById.mockResolvedValue(stored);

      // Act
      const result = await userService.findById('u_1');

      // Assert
      expect(result).toEqual(expect.objectContaining({ id: 'u_1', email: 'a@b.com' }));
    });

    it('throws NotFoundException when the user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
```

One logical assertion per test. If a test needs three unrelated assertions, it's probably
three tests.

---

## 4. Test Behavior, Not Implementation

```typescript
// ❌ FORBIDDEN — asserts internal calls; breaks on harmless refactors
expect(service['cache'].get).toHaveBeenCalledTimes(1);

// ✅ REQUIRED — asserts the observable outcome
const result = await service.getUser('u_1');
expect(result.email).toBe('a@b.com');
```

A test should still pass after a refactor that preserves behavior. If renaming a private
method or reordering internal calls breaks a test, the test is coupled to implementation.

---

## 5. No Fake Tests

```typescript
// ❌ FORBIDDEN — proves nothing
it('should work', () => { expect(true).toBe(true); });

// ❌ FORBIDDEN — asserts the mock, not the code
it('calls the repo', () => { expect(repo.find).toBeDefined(); });
```

Every test must be able to **fail** for a real reason. If you can delete the production
code and the test still passes, the test is worthless.

---

## 6. Mocking Strategy

- **Mock at the boundary**: external services, network, time, randomness, the database
  (in unit tests). Use real collaborators within the unit under test.
- **Don't over-mock.** Mocking everything tests your mocks, not your code. If a test has
  more setup than substance, prefer an integration test with a real test DB.
- **Determinism**: inject clocks and ID/random generators so tests are reproducible;
  never assert against `Date.now()` or live randomness.
- Reset mocks between tests (`beforeEach`) so state never leaks across cases.

Provide shared, typed factories for test data (`createMockUser(overrides)`) rather than
copy-pasting fixtures.

---

## 7. What To Test

- **Happy path** — the feature does what it should.
- **Edge cases** — empty, null, boundary values, maximum sizes, unicode, zero, negative.
- **Error paths** — invalid input is rejected; downstream failures surface as typed errors.
- **Authorization** — protected operations reject the wrong identity/role.
- **Regressions** — every fixed bug gets a test that fails without the fix.

Prioritize by risk: money, auth, data integrity, and irreversible actions get the most
thorough coverage.

---

## 8. Coverage Expectations

- **Domain/business logic (services, utils): ≥ 90%.**
- **Overall project: ≥ 80% lines/branches.**
- Controllers, mappers, and glue: covered by integration/E2E rather than chasing 100%.

Coverage is a floor and a smell detector, **not a goal**. 100% coverage of trivial
getters proves nothing; 80% of the money-handling code with no edge cases is dangerous.
Read what's *uncovered*, not just the number.

---

## 9. Quality Bars For Tests

- **Fast** — unit suites run in seconds; a slow suite stops getting run.
- **Isolated** — no shared mutable state; any order passes; parallel-safe.
- **Deterministic** — no flakiness. A flaky test is a broken test; fix or delete it,
  never retry-until-green.
- **Readable** — a test is also documentation of intended behavior. Keep it clear.

---

## 10. E2E & Integration Practices

- Run against a disposable, migrated test database (Testcontainers or a dedicated test
  instance), seeded to a known state and torn down after.
- Cover real journeys, not every permutation — E2E is expensive; keep it to what matters.
- Frontend E2E (Playwright/Cypress) targets the critical user flows and accessibility of
  the happy path.

---

## 11. Tests Are Part Of "Done"

A feature without tests is not complete and will not pass review. New code ships with
tests in the same PR. CI runs the full suite; a red suite blocks merge. See
`checklists/pr-review.md`.
