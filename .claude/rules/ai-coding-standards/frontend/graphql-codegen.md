# Frontend GraphQL (Codegen)

The frontend consumes the backend GraphQL API through generated, fully typed operations.
No hand-written types for GraphQL data, ever. Read with `frontend/react.md` and
`frontend/nextjs.md`.

## Folder structure

```
src/
└── graphql/
    ├── codegen.ts              # codegen config (committed)
    ├── fragments/              # reusable fragments, colocated by domain
    │   └── user.fragments.graphql
    ├── queries/
    │   └── users.queries.graphql
    ├── mutations/
    │   └── users.mutations.graphql
    ├── subscriptions/
    │   └── notifications.subscriptions.graphql
    └── generated/              # OUTPUT of codegen — never edited by hand
        └── graphql.ts
```

- `.graphql` documents are the source of truth for operations.
- `generated/` is produced by codegen and is git-ignored or committed read-only — never
  hand-edited. If a type is wrong, fix the query or schema and regenerate.

## Codegen

Use GraphQL Code Generator against the backend schema to produce typed documents and typed
hooks (TanStack Query or the chosen client).

```ts
// src/graphql/codegen.ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_API_URL + "/graphql",
  documents: ["src/graphql/**/*.graphql"],
  generates: {
    "src/graphql/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-react-query"],
      config: { fetcher: "graphql-request", exposeQueryKeys: true },
    },
  },
};

export default config;
```

- Codegen runs as a script (`pnpm codegen`) and in CI; a stale `generated/` fails the build.
- The generated client reads the endpoint from validated config, never a literal.

## Request only the data you use (enforced)

This is the central data-optimization rule for the frontend.

- A component selects **only** the fields it renders. No `...AllFields` catch-alls.
- Define a fragment per UI unit and select exactly what that unit shows. The fragment lives
  next to the component's data needs and is composed into the query.

```graphql
# graphql/fragments/user.fragments.graphql
fragment UserCard_user on User {
  id
  displayName
  avatarUrl
}
```

```graphql
# graphql/queries/users.queries.graphql
query UsersList($first: Int!, $after: String) {
  users(first: $first, after: $after) {
    edges {
      node { ...UserCard_user }
      cursor
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

- When a screen no longer renders a field, remove it from the query. Do not leave unused
  fields in operations.

## Usage in code (logic stays out of components)

- Components consume generated hooks via a feature hook in `hooks/`, not by calling the
  GraphQL client directly inside the component.
- Mutations update the cache deterministically (invalidate affected queries or write the
  result), mirroring the backend's cache invalidation discipline.

```ts
// hooks/useUsersList.ts
import { useUsersListQuery } from "@/graphql/generated/graphql";

export function useUsersList(pageSize: number) {
  return useUsersListQuery({ first: pageSize, after: null });
}
```

## Pagination

- Use the backend's cursor connections (`first`/`after`, `pageInfo`). Implement infinite or
  paged lists with the connection shape; do not invent offset paging on the client.

## REST coexistence

- REST calls go through the typed `httpClient` (`frontend/nextjs.md`); GraphQL calls go
  through generated hooks. Use the surface that matches `backend/graphql.md`'s split.
- Both keep server state in TanStack Query so the cache has one owner.
