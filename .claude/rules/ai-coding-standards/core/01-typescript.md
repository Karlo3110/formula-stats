# TypeScript Rules

Applies to every `.ts` and `.tsx` file. These are enforced, not optional.

## Forbidden

- `any` — in any position, including casts and generics. Use `unknown` and narrow.
- `as` casts to silence the compiler. A cast is only allowed when narrowing `unknown`
  after a runtime check, or for `as const`.
- Non-null assertions (`!`) except immediately after a guard that proves non-null.
- `@ts-ignore` / `@ts-expect-error` without a one-line justification comment.
- TypeScript `enum`. Use `as const` objects with derived union types (see below).

## Required

- Explicit return type on every function (including arrow functions assigned to a name).
- Explicit type on every exported constant.
- Explicit parameter types. No inferred `any` parameters.
- `strict: true` in `tsconfig.json`, plus `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`.

```jsonc
// tsconfig.json — minimum compiler options
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true
  }
}
```

## `type` vs `interface`

- Default to `type`.
- Use `interface` only for a contract a class will `implement`.

## Replacing enums

```ts
export const Role = {
  Admin: "ADMIN",
  Member: "MEMBER",
} as const;

export type Role = (typeof Role)[keyof typeof Role]; // "ADMIN" | "MEMBER"
```

## Handling `unknown`

```ts
function parseConfig(input: unknown): Config {
  // Validate at the boundary, then the type is known.
  return ConfigSchema.parse(input); // zod
}
```

## Runtime validation at boundaries

Static types are erased at runtime. Any data crossing a trust boundary (HTTP body, query
params, env vars, third-party responses, parsed JSON) is validated with **zod** before use.

```ts
import { z } from "zod";

const CreateUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(80),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

Derive the TypeScript type from the schema with `z.infer`. Never declare the type and the
schema separately — they will drift.

## Nullability

- Prefer absence modeled explicitly: `T | null` for "intentionally empty",
  `T | undefined` only for "not provided".
- Do not mix `null` and `undefined` for the same field.

## Immutability

- Mark data that should not change `readonly`.
- Prefer `ReadonlyArray<T>` for inputs you do not mutate.
- Use `as const` for fixed literal data.

## Imports/exports

- Named exports only. No default exports (except where a framework requires it, e.g.
  Next.js pages and route handlers).
- One concept per file; the file name matches the primary export.
