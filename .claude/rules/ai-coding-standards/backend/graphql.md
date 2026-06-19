# GraphQL (Backend) and REST/GraphQL Split

This project exposes **both** REST and GraphQL. They have distinct, non-overlapping jobs.
Read with `backend/nestjs.md`, `backend/api-contract.md`, and `core/06-solid.md`.

## When to use REST vs GraphQL (deterministic)

Pick by the rules below. Do not duplicate the same operation in both surfaces.

**Use REST for:**
- Authentication flows: login, logout, refresh, register, password reset. They are
  security-sensitive, simple, and pair with httpOnly cookies and HTTP semantics.
- Binary: file upload and download, media streaming.
- Simple, single-resource actions and webhooks (incoming and outgoing).
- Anything consumed by external/third parties or that benefits from HTTP-level caching.
- Health checks and operational endpoints.

**Use GraphQL for:**
- Read models for application screens, especially dashboards and detail pages that compose
  multiple resources in one round trip.
- Anywhere the client needs flexible field selection to avoid overfetching.
- Frequently changing frontend data requirements where adding REST endpoints per shape
  would proliferate.
- Mutations that belong to the app's own data graph (create/update/delete of domain
  entities the UI already queries).

**Tie-breaker:** if a single client screen needs data from 3+ resources, it is GraphQL. If
the operation is a simple action on one resource or is security/transport-sensitive, it is
REST.

## Schema definition: code-first

Use NestJS **code-first** GraphQL (decorators generate the SDL). This keeps a single typed
source of truth and matches the rest of the codebase.

## Layering (resolvers are thin, like controllers)

```
GraphQL request
  → Resolver     (field wiring + input validation only)
  → Service      (business logic — shared with REST controllers)
  → Repository   (data access)
```

- Resolvers contain no business logic. They validate input, call a service, and return a
  typed object/DTO.
- Services are **shared** between REST controllers and GraphQL resolvers. Business rules
  live in one place regardless of transport.

```ts
@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserType, { nullable: true })
  async user(@Args("id", { type: () => ID }) id: string): Promise<UserType | null> {
    return this.usersService.findById(id);
  }

  @Mutation(() => UserType)
  async createUser(@Args("input") input: CreateUserInput): Promise<UserType> {
    return this.usersService.create(input);
  }
}
```

## Avoid N+1 with DataLoader

Every relation resolved per-parent must go through a request-scoped `DataLoader` that
batches and caches within the request. Never issue a query inside a `@ResolveField` without
batching.

```ts
@ResolveField(() => [OrderType])
async orders(
  @Parent() user: UserType,
  @Context("ordersByUserLoader") loader: DataLoader<string, OrderType[]>,
): Promise<OrderType[]> {
  return loader.load(user.id);
}
```

## Pagination: cursor-based (Relay-style connections)

List queries return a connection with `edges { node, cursor }` and `pageInfo
{ hasNextPage, endCursor }`. Offset pagination is not used for GraphQL lists. The server
enforces a maximum page size.

## Input validation and types

- Inputs are `@InputType()` classes with `class-validator` decorators, validated by the
  global pipe — same discipline as REST DTOs.
- Object types (`@ObjectType()`) expose only client-facing fields. Sensitive fields
  (password hash, tokens) are never added to a GraphQL type.
- Distinct input vs output types, even when similar.

## Errors

- Throw typed domain exceptions; a formatting layer maps them to GraphQL errors with a
  stable `extensions.code` (e.g. `NOT_FOUND`, `FORBIDDEN`, `VALIDATION`) mirroring the REST
  error taxonomy in `api-contract.md`.
- Never leak stack traces or internal messages in production.

## Security

- The auth guard applies to GraphQL too: every query/mutation requires auth unless marked
  `@Public()`. RBAC via `@Roles()` on resolvers or field-level guards.
- Enforce query depth and complexity limits to prevent abusive queries.
- Disable introspection and the playground in production.

## Data optimization

- Resolve only requested fields. Repositories should select columns based on the requested
  selection set where it materially reduces load (e.g. heavy columns fetched only when asked).
- Cache hot, expensive read resolvers via the Redis `CacheService`
  (see `backend/caching-redis.md`), with explicit invalidation on mutation.

## Subscriptions

- GraphQL subscriptions are for real-time updates to entities already in the graph
  (e.g. "order status changed"). For high-frequency or custom-protocol real-time, use raw
  WebSockets instead — see `backend/websockets.md`.
