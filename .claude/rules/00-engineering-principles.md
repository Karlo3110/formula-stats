# Engineering Principles

> The mindset that governs every decision in this codebase. Specific rules in other
> files derive from these principles. When a rule and a principle seem to conflict,
> raise it — the conflict is a bug in the rules.

---

## 1. The Prime Directive

**Optimize for the reader, not the writer.** Code is read far more often than it is
written, and usually by someone who lacks the context the author had. A senior engineer
who has never seen this codebase should be able to open any file and understand what it
does, why it exists, and how to change it safely.

---

## 2. Optimization Priority

When two good qualities trade off against each other, resolve in this order:

```
Simplicity > Readability > Maintainability > Scalability > Security > Performance > Testability > Explicitness
```

Two clarifications:
- **Security is never traded away for performance.** The ordering above is for design
  ergonomics; a security requirement is a hard constraint, not a preference.
- **Performance below the requirement is a bug, not a trade-off.** The ordering means
  "don't sacrifice readability for speed you don't need," not "ignore performance."

---

## 3. Always Enforce

- **Clean Architecture** — dependencies point inward, toward the domain. Frameworks,
  databases, and transport are details at the edges.
- **SOLID** — single responsibility, open/closed, Liskov substitution, interface
  segregation, dependency inversion.
- **DRY (where appropriate)** — remove *meaningful* duplication. Do not abstract two
  things that merely look alike today (see §6).
- **KISS** — the simplest thing that fully solves the problem.
- **Separation of concerns** — each module has one reason to change.
- **Feature-oriented design** — organize by business capability, not by technical layer.
- **Modular architecture** — features are independent, replaceable, and testable in isolation.
- **Dependency injection** — collaborators are passed in, never constructed inside.
- **Strong typing** — the type system is a tool for correctness, not decoration.
- **Composition over inheritance** — build behavior by combining small pieces.
- **Explicit dependencies** — what a unit needs is visible in its signature.
- **Predictable behavior** — same input, same output; no hidden state, no surprises.
- **Defensive programming** — validate at boundaries, fail loudly, assume the caller
  is wrong until proven otherwise.

---

## 4. Always Avoid

- **Overengineering** — building for requirements that don't exist yet.
- **Premature optimization** — making code faster before measuring that it's slow.
- **Hidden magic** — behavior that can't be traced by reading the code.
- **Tight coupling** — modules that can't change independently.
- **Circular dependencies** — A needs B needs A. Always a design smell.
- **God objects** — one class that knows or does everything.
- **Massive files / classes / functions** — see `rules/04-file-organization.md`.

---

## 5. Defensive Programming In Practice

- Validate every input at the system boundary (HTTP, queue, file, env). Inside the
  trusted core, rely on types.
- Make illegal states unrepresentable. A discriminated union beats a boolean flag plus
  a comment.
- Fail fast and loudly. A thrown typed error at the source beats a `null` that explodes
  three layers away.
- Treat `null` / `undefined` as real cases the type system forces you to handle.
- Never swallow an error to make a symptom disappear. See `rules/08-error-handling.md`.

---

## 6. The Rule of Three (When To Abstract)

Do **not** create an abstraction the first or second time you see a pattern.

- **Once**: write it inline.
- **Twice**: note the duplication, but resist. Two call sites rarely reveal the right shape.
- **Three times**: now extract. By the third use, the real axis of variation is visible.

Premature abstraction couples unrelated code through a shared shape that will diverge.
A little duplication is far cheaper than the wrong abstraction.

---

## 7. Boundaries And Dependency Rules

- A module may depend on things **more stable** than itself (domain, shared utilities).
- A module must **not** depend on things **less stable** than itself (UI, transport, frameworks).
- Cross-feature communication goes through explicit, typed interfaces — never by reaching
  into another feature's internals.
- The domain layer has **zero** framework imports. It does not know it lives in NestJS,
  Next.js, or a Lambda.

---

## 8. Make The Change Easy, Then Make The Easy Change

When a change is hard, the problem is usually the surrounding structure, not the change.
Refactor first to make room for the change, commit that refactor separately, then make
the now-easy change. Never tangle a refactor and a behavior change in one commit.

---

## 9. Leave It Better Than You Found It

The Boy Scout Rule applies, with discipline:
- Fix small, in-scope messes you touch.
- Do **not** sneak large unrelated refactors into a feature PR — open a separate one.
- If you discover a problem you won't fix now, file it; don't let it evaporate.

---

## 10. Decisions Are Written Down

Significant architectural decisions are recorded as ADRs (Architecture Decision Records)
under `architecture/`. A decision that lives only in someone's head is a decision that
will be silently reversed. Capture the context, the options, the choice, and the
consequences.
