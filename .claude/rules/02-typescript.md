# TypeScript Rules (CRITICAL)

> TypeScript is our primary correctness tool. These rules are non-negotiable and
> enforced by both the compiler and review.

---

## 1. No `any`. Ever.

```typescript
// ❌ FORBIDDEN
const data: any = await fetch(url);
function process(input: any): any {}
const items: any[] = [];

// ✅ REQUIRED
interface ApiResponse<T> {
  data: T;
  status: number;
}
const data: ApiResponse<User> = await client.get('/users');
function process(input: ProcessInput): ProcessOutput { /* ... */ }
const items: User[] = [];
```

**When you genuinely don't know the type, use `unknown`, then narrow.** `unknown` forces
you to prove the shape before use; `any` silently disables the type checker.

```typescript
// ✅ REQUIRED — unknown + validation at the boundary
function handleWebhook(payload: unknown): void {
  const event = WebhookSchema.parse(payload); // now strongly typed
  process(event);
}
```

The only acceptable `any` is one that is unavoidable in a third-party type definition,
and it must be isolated behind a typed wrapper with an inline `// eslint-disable` and a
one-line justification.

---

## 2. Explicit Return Types On Every Function

```typescript
// ❌ FORBIDDEN — inferred return type
async function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

// ✅ REQUIRED
async function getUser(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}
```

Explicit return types document intent, catch accidental changes to a function's contract,
and speed up the compiler. This applies to exported functions, methods, and React
components alike.

---

## 3. Named Types For Reused Structures

```typescript
// ❌ FORBIDDEN — inline object types for structures used more than once
function createUser(data: { name: string; email: string }): { id: string; name: string } {}

// ✅ REQUIRED — named, exported, reusable
interface CreateUserDto {
  name: string;
  email: string;
}
interface UserResponse {
  id: string;
  name: string;
}
function createUser(data: CreateUserDto): UserResponse { /* ... */ }
```

**`interface` vs `type`:** prefer `interface` for object shapes that may be extended or
implemented; use `type` for unions, intersections, mapped types, and function signatures.

---

## 4. No Type Assertions To Silence Errors

```typescript
// ❌ FORBIDDEN — assertions that lie to the compiler
const user = response as User;
const config = JSON.parse(str) as Config;

// ✅ REQUIRED — runtime validation that also narrows the type
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});
type User = z.infer<typeof UserSchema>;

const user = UserSchema.parse(response); // throws on mismatch, returns typed value
```

The only acceptable assertions are `as const` (literal narrowing) and assertions the
compiler genuinely cannot infer but you can prove locally (e.g., after a discriminant
check), documented with a one-line comment. Never use `as unknown as X` to force a cast.

---

## 5. Strict Null Handling

```typescript
// ❌ FORBIDDEN — assumes non-null
function getLength(str: string | null): number {
  return str.length;
}

// ✅ REQUIRED — handle the null case explicitly
function getLength(str: string | null): number {
  if (!str) return 0;
  return str.length;
}
```

- Use optional chaining (`?.`) and nullish coalescing (`??`) deliberately, not to paper
  over a design where `null` shouldn't occur.
- The non-null assertion operator (`!`) is **forbidden** except immediately after a check
  the compiler can't see, with a comment.

---

## 6. Discriminated Unions Over Boolean Soup

Make illegal states unrepresentable.

```typescript
// ❌ FORBIDDEN — flags allow contradictory states
interface Request {
  isLoading: boolean;
  isError: boolean;
  data?: User;
  error?: Error;
}

// ✅ REQUIRED — only valid states exist
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };
```

---

## 7. Prefer `readonly` And Immutability

```typescript
// ✅ REQUIRED — inputs that shouldn't mutate are readonly
interface Config {
  readonly apiUrl: string;
  readonly retries: number;
}
function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
```

Default to immutable data. Mutate only local, freshly-created values.

---

## 8. Exhaustiveness Checks

When switching over a union, prove you handled every case.

```typescript
function label(state: RequestState): string {
  switch (state.status) {
    case 'idle': return 'Idle';
    case 'loading': return 'Loading…';
    case 'success': return `Loaded ${state.data.name}`;
    case 'error': return state.error.message;
    default: return assertNever(state); // compile error if a case is added and missed
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
```

---

## 9. Generics With Intent

Use generics to preserve type relationships, not to look clever. Constrain them.

```typescript
// ✅ REQUIRED — constrained, meaningful generic
function pluck<T, K extends keyof T>(items: readonly T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
```

If a generic appears once and isn't related to anything, it's probably unnecessary.

---

## 10. Required `tsconfig` Compiler Options

Every project's `tsconfig.json` MUST include:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

`noUncheckedIndexedAccess` means `arr[i]` is `T | undefined` — handle it. This catches a
whole class of runtime crashes at compile time. Do not relax these flags to make code
compile; fix the code.
