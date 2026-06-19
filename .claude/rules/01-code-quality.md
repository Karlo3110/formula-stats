# Code Quality Rules

> Concrete, enforceable quality bars. Violations are blocking review comments.

---

## 1. Self-Documenting Code

Code should explain itself through names and structure. Comments explain **why**, never
**what**.

```typescript
// ❌ FORBIDDEN — comment narrates the obvious
// loop over users and send email
for (const u of users) { sendEmail(u); }

// ❌ FORBIDDEN — cryptic names that need a comment to survive
const d = new Date(); // current date

// ✅ REQUIRED — the name is the documentation
for (const recipient of activeSubscribers) {
  sendRenewalReminder(recipient);
}

// ✅ REQUIRED — comment explains a non-obvious WHY
// Stripe webhooks can arrive out of order; ignore events older than the last processed.
if (event.createdAt < lastProcessedAt) return;
```

**When a comment is warranted:** non-obvious business rules, workarounds for external
bugs (link the issue), security-sensitive reasoning, performance trade-offs, and the
intent behind a regex or a bit of math.

---

## 2. Single Responsibility

A function does one thing. A class has one reason to change. A module owns one concern.
If you describe a unit's job using "and," it probably does too much.

```typescript
// ❌ FORBIDDEN — validates, persists, emails, and logs in one function
async function registerUser(body: unknown): Promise<void> { /* 80 lines */ }

// ✅ REQUIRED — orchestration delegates to focused collaborators
async function registerUser(dto: CreateUserDto): Promise<UserResponse> {
  const user = await this.userRepository.create(dto);
  await this.mailer.sendWelcome(user.email);
  this.logger.log(`User registered: ${user.id}`);
  return this.toResponse(user);
}
```

---

## 3. Small Functions, Shallow Nesting

- Functions under **50 lines** (target; see `rules/04-file-organization.md`).
- Maximum nesting depth of **3**. Beyond that, extract a function or use guard clauses.
- Prefer **early returns** over `else` ladders.

```typescript
// ❌ FORBIDDEN — arrow-code, deep nesting
function price(order) {
  if (order) {
    if (order.items.length) {
      if (order.coupon) {
        // ...
      }
    }
  }
}

// ✅ REQUIRED — guard clauses flatten the flow
function calculateTotal(order: Order): Money {
  if (!order.items.length) return Money.zero();
  const subtotal = sumItems(order.items);
  if (!order.coupon) return subtotal;
  return applyCoupon(subtotal, order.coupon);
}
```

---

## 4. No Dead Code, No Commented-Out Code

Version control is the history. The working tree is the present.

```typescript
// ❌ FORBIDDEN
// const oldRate = 0.05;
// function legacyCalc() { ... }
export function calc() { /* ... */ }
```

Delete it. If you might need it, it's in git. Commented-out code rots, confuses readers,
and silently drifts out of sync.

---

## 5. No Magic Strings Or Numbers

Every literal with meaning gets a name.

```typescript
// ❌ FORBIDDEN
if (user.role === 2) { /* ... */ }
setTimeout(retry, 30000);
if (status === 'actv') { /* ... */ }

// ✅ REQUIRED
enum Role { User = 1, Admin = 2 }
const RETRY_DELAY_MS = 30_000;
const ACTIVE_STATUS = 'active' as const;

if (user.role === Role.Admin) { /* ... */ }
setTimeout(retry, RETRY_DELAY_MS);
```

Exceptions: `0`, `1`, `-1`, and `''` used in their obvious arithmetic/identity sense.

---

## 6. No Duplicate Logic

The same business decision must live in exactly one place. Copy-pasted logic that must
stay in sync is a defect waiting to happen. (But respect the Rule of Three —
`rules/00-engineering-principles.md` §6 — before abstracting incidental duplication.)

---

## 7. No Unused Anything

Unused imports, variables, parameters, exports, and dependencies are forbidden. The
`tsconfig` flags `noUnusedLocals` and `noUnusedParameters` enforce most of this; the
linter handles the rest. Treat lint warnings as errors.

---

## 8. Proper Abstractions

- An abstraction must **hide a real decision**, not just rename a call.
- A good interface is small, cohesive, and stated in the language of the domain.
- A function that takes a `boolean` flag to switch behavior is usually two functions.

```typescript
// ❌ FORBIDDEN — flag argument hides two behaviors
function getUsers(includeDeleted: boolean): User[] { /* ... */ }

// ✅ REQUIRED — two intention-revealing functions
function getActiveUsers(): User[] { /* ... */ }
function getAllUsersIncludingDeleted(): User[] { /* ... */ }
```

---

## 9. Consistency Over Personal Preference

When a pattern already exists in the codebase, follow it even if you'd have chosen
differently. A consistent codebase is more valuable than any individual's stylistic
preference. Propose changes to the pattern in a dedicated PR, not by quietly diverging.

---

## 10. Definition Of "Quality" In Review

Before requesting review, every box in `checklists/pr-review.md` must be true. The
short version:

- [ ] No `any`; explicit return types everywhere.
- [ ] No dead, commented-out, or duplicated code.
- [ ] No magic literals; no unused symbols.
- [ ] Functions small and single-purpose; nesting ≤ 3.
- [ ] Errors typed and handled; no silent catches.
- [ ] Names reveal intent and follow `rules/03-naming-conventions.md`.
- [ ] Tests cover the behavior, not the implementation.
