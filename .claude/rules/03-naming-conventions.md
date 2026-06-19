# Naming Conventions

> Names are the primary interface to code. A precise name removes the need for a comment
> and a guess. These conventions are enforced in review.

---

## 1. The Golden Rule

**A name should reveal intent. The reader should know what a thing is and why it exists
without reading its implementation.** If you need a comment to explain a name, the name
is wrong.

```typescript
// ❌ FORBIDDEN
const d = 7;          // days until expiry
const list = users.filter((u) => u.a);
function check(u) {}

// ✅ REQUIRED
const daysUntilExpiry = 7;
const activeUsers = users.filter((user) => user.isActive);
function isEligibleForRefund(order: Order): boolean {}
```

---

## 2. Casing By Kind

| Kind | Convention | Example |
|------|-----------|---------|
| Variables, function params | `camelCase` | `pendingInvoices`, `retryCount` |
| Functions, methods | `camelCase`, **verb-first** | `calculateTotal`, `fetchUser`, `sendEmail` |
| Classes, types, interfaces, enums | `PascalCase`, **noun** | `UserService`, `InvoiceStatus` |
| React components | `PascalCase` | `UserProfileCard` |
| React hooks | `camelCase`, `use` prefix | `useCurrentUser`, `useDebounce` |
| Constants (module-level, fixed) | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES`, `DEFAULT_PAGE_SIZE` |
| Enum members | `PascalCase` | `Role.Admin`, `Status.Pending` |
| Files (TS, configs) | `kebab-case` | `user-service.ts`, `create-user.dto.ts` |
| Files (React components) | `PascalCase.tsx` | `UserProfileCard.tsx` |
| Directories | `kebab-case` | `user-management/`, `api-clients/` |
| Database tables / columns | `snake_case` | `user_accounts`, `created_at` |
| Environment variables | `SCREAMING_SNAKE_CASE` | `DATABASE_URL`, `JWT_SECRET` |

---

## 3. Functions Are Verbs

A function *does* something; its name starts with a verb.

```typescript
createUser()      // not user()
getInvoice()      // not invoice()
isExpired()       // boolean → is / has / can / should
hasPermission()
canPublish()
shouldRetry()
toResponse()      // transformations: to / from / parse / serialize
```

Standard verb vocabulary (use consistently):
- `get` — retrieve, may be cached, never throws on "not found" if return is nullable.
- `fetch` — retrieve over the network/IO.
- `find` — retrieve, returns `null`/`undefined` when absent.
- `load` — retrieve and initialize.
- `create` / `update` / `delete` — persistence mutations.
- `build` / `make` — construct an in-memory value.
- `compute` / `calculate` — derive a value.
- `validate` / `assert` — check, throw on failure.
- `is` / `has` / `can` / `should` — boolean predicates.

---

## 4. Classes And Types Are Nouns

```typescript
class PaymentProcessor {}     // not ProcessPayment
interface UserRepository {}
type InvoiceStatus = 'paid' | 'open' | 'void';
```

Suffix conventions used across the codebase:
- `*Service` — application/business logic orchestrator.
- `*Repository` — data access for one aggregate.
- `*Controller` — HTTP transport layer.
- `*Dto` — data transfer object crossing a boundary (request/response).
- `*Entity` — persistence model.
- `*Exception` — typed error.
- `*Guard`, `*Interceptor`, `*Filter`, `*Pipe` — NestJS cross-cutting concerns.
- `*Provider` — React context provider.

---

## 5. Booleans Read Like Assertions

```typescript
// ❌ FORBIDDEN
const active = true;
const flag = false;
const status = checkUser();

// ✅ REQUIRED
const isActive = true;
const hasUnreadMessages = false;
const canEditPost = checkPermission();
```

Avoid negated names; `isEnabled` beats `isNotDisabled`. `if (!isEnabled)` is clearer than
`if (isNotDisabled)`.

---

## 6. Length Scales With Scope

- A loop index in a three-line loop may be `i`.
- A variable used across a 40-line function needs a full, descriptive name.
- An exported symbol used across the codebase needs an unambiguous, searchable name.

Searchability matters: `MAX_CLASSES_PER_STUDENT` can be grep'd; `7` cannot.

---

## 7. Avoid

- **Abbreviations** that aren't universal. `usr`, `calc`, `btn`, `idx` → spell them out.
  (Universal ones are fine: `id`, `url`, `http`, `db`, `api`, `dto`.)
- **Type information in names** (Hungarian notation): `strName`, `arrUsers`, `iCount`.
  The type system already says this.
- **Meaningless noise words**: `data`, `info`, `manager`, `helper`, `util`, `object`,
  `value` as standalone names. `processData(data)` says nothing.
- **Inconsistent terms for one concept.** Pick `customer` or `client`, `delete` or
  `remove`, `fetch` or `get` — and use it everywhere.
- **Single-letter names** outside tiny scopes or well-known math (`x`, `y`, `dx`).

---

## 8. Domain Language (Ubiquitous Language)

Use the same words the business uses, everywhere — code, tests, docs, and conversation.
If the domain calls it a "subscription," the code does not call it an "account plan."
A shared vocabulary between engineers and stakeholders eliminates an entire class of
translation bugs.

---

## 9. Files And Their Contents Agree

The file name describes its primary export.

```
user.service.ts          → export class UserService
create-user.dto.ts       → export class CreateUserDto
UserProfileCard.tsx      → export function UserProfileCard
use-current-user.ts      → export function useCurrentUser
invoice-status.enum.ts   → export enum InvoiceStatus
```

One primary export per file (small, tightly-coupled helpers may live alongside it).
