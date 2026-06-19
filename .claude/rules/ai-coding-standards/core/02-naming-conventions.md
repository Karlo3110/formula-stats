# Naming Conventions

One convention per category, applied everywhere. No exceptions without a framework requirement.

## Files and folders

| Kind | Convention | Example |
| --- | --- | --- |
| Folder | kebab-case | `user-profile/` |
| React component file | PascalCase | `UserCard.tsx` |
| Hook file | camelCase, `use` prefix | `useAuth.ts` |
| Service / util / config file | kebab-case | `auth.service.ts`, `format-date.ts` |
| Type-only file | kebab-case, `.types.ts` | `user.types.ts` |
| Test file | mirrors source, `.test`/`.spec` | `auth.service.spec.ts` |
| Next.js route files | framework names | `page.tsx`, `layout.tsx`, `route.ts` |

## Symbols

| Kind | Convention | Example |
| --- | --- | --- |
| Variable, function | camelCase | `currentUser`, `fetchUser()` |
| React component | PascalCase | `function UserCard()` |
| Type, interface, class | PascalCase, **no** `I`/`T` prefix | `User`, `AuthService` |
| Constant (module-level fixed value) | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| `as const` object key | PascalCase | `Role.Admin` |
| Boolean | `is` / `has` / `should` / `can` prefix | `isLoading`, `hasAccess` |
| Event handler | `handle` prefix | `handleSubmit` |
| Handler prop | `on` prefix | `onSubmit` |
| Async function | verb that implies I/O | `fetchUser`, `saveOrder` |

## Functions

- Name is a verb or verb phrase: `calculateTotal`, `validateEmail`.
- Boolean-returning functions read as a predicate: `isExpired`, `canEdit`.
- Avoid `get`/`set` for anything that performs I/O — reserve `get` for cheap accessors and
  use `fetch`/`load`/`read` for I/O.

## Environment variables

- UPPER_SNAKE_CASE.
- Client-exposed (Next.js) variables are prefixed `NEXT_PUBLIC_`. Nothing else is.
- Group by domain: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `NEXT_PUBLIC_API_URL`.
- See `core/04-env-and-config.md`.

## API and routes

- REST paths are kebab-case, plural nouns: `/api/v1/user-profiles`.
- No verbs in REST paths; the HTTP method is the verb.
- Versioned: `/api/v1/...`.

## Database (PostgreSQL)

| Kind | Convention | Example |
| --- | --- | --- |
| Table | snake_case, plural | `user_profiles` |
| Column | snake_case | `created_at` |
| Primary key | `id` | `id` |
| Foreign key | `<singular>_id` | `user_id` |
| Boolean column | `is_`/`has_` prefix | `is_active` |
| Index | `idx_<table>_<columns>` | `idx_orders_user_id` |
| Join table | both names, alphabetical | `roles_users` |

## Generic forbidden names

`data`, `info`, `item`, `temp`, `obj`, `val`, `manager`, `helper`, `util` (as a standalone
name), and single letters except loop indices `i`/`j` and well-known math/coordinate names.
Name things for what they are: `userList`, not `data`.
