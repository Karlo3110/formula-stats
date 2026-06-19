# Core Principles

Universal rules. They apply to every file in every language. Technology files add detail;
they never relax these.

## 1. Single responsibility

Every function, component, service, class, and file does exactly one thing.

- A function that fetches **and** transforms **and** renders is three functions.
- If you cannot describe what a unit does in one sentence without "and", split it.

## 2. Size limits (hard stops, not suggestions)

| Unit | Limit | Action when exceeded |
| --- | --- | --- |
| Function | 40 lines | Extract named helper functions. |
| React component | 150 lines | Split into smaller components or extract hooks. |
| File | 300 lines | Split by responsibility into multiple files. |
| Function parameters | 3 positional | Use a single typed options object. |
| Nesting depth | 3 levels | Use early returns / extract functions. |

## 3. Reuse before you build

When a UI element, type, constant, or utility is needed and does not already exist:

- **Do** create it as a named, reusable unit in the correct shared location.
- **Do not** inline a one-off copy.

Decision rule: if a piece of logic or UI could plausibly be needed in a second place,
it goes in a shared location now (`components/`, `lib/`, `utils/`, `hooks/`, `types/`).

## 4. Explicit over implicit

- No magic strings or numbers. Name them as typed constants.
- No hidden side effects. A function's name and signature must predict its behavior.
- No reliance on implicit type coercion or truthiness for non-boolean values.

```ts
// Bad
if (user.role) { ... }
const timeout = 30000;

// Good
const DEFAULT_TIMEOUT_MS = 30_000;
if (user.role === Role.Admin) { ... }
```

## 5. No over-engineering

- Do not add an abstraction until there are at least two concrete uses.
- Do not add a library for something the standard library or a 10-line utility solves.
- Do not build configuration for a case that does not exist yet.

Balance with rule 3: reuse is required, speculative abstraction is forbidden. The line is
**two concrete uses**.

## 6. Move logic out of the inline path

Calculations, transformations, and non-trivial conditions become named functions.

```ts
// Bad
const isEligible = user.age >= 18 && user.country === "US" && !user.isBanned;

// Good
function isEligibleForOffer(user: User): boolean {
  return user.age >= 18 && user.country === "US" && !user.isBanned;
}
```

## 7. Self-documenting code

- Naming and structure explain intent. See `02-naming-conventions.md`.
- Comments explain **why**, never **what**. If a comment restates the code, delete it.
- No commented-out code in commits.

## 8. Fail fast and loud

- Validate inputs at the boundary (API edge, form submit) and reject invalid data immediately.
- Never silently swallow errors. Either handle them meaningfully or propagate them.
- No empty `catch` blocks.

## 9. Return only what is used

- Functions return the narrowest type the caller needs.
- API responses contain only the fields the client consumes.
- Database queries select only the columns they use.

## 10. Determinism

- Same input produces same output unless the function's job is explicitly time/random-based.
- Side-effecting code (I/O, randomness, clock) is isolated and injected, not buried.
