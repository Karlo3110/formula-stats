# API Architecture

## Purpose
Define a consistent, predictable, versioned HTTP API contract so clients can integrate
confidently and the surface evolves without breaking consumers.

## Style & Conventions
- **RESTful resource modeling.** Nouns, plural, hierarchical:
  ```
  GET    /v1/users            list
  POST   /v1/users            create
  GET    /v1/users/:id        read
  PATCH  /v1/users/:id        partial update
  DELETE /v1/users/:id        delete
  GET    /v1/users/:id/orders nested resource
  ```
  Verbs in paths (`/getUsers`, `/createNewUser`) are forbidden.
- **HTTP semantics**: correct methods and status codes (`200/201/204`, `400/401/403/404/
  409/422`, `429`, `5xx`). `GET` is safe and idempotent; `PUT`/`DELETE` idempotent.
- **Versioning**: prefix public APIs with `/v1`. Breaking changes go to a new version;
  never silently break `/v1`.

## Consistent Response Envelope
```typescript
interface ApiResponse<T> {
  data: T;
  meta?: { page?: number; limit?: number; total?: number; hasMore?: boolean };
}

interface ApiError {
  statusCode: number;
  code: string;            // stable, machine-readable (e.g., USER_NOT_FOUND)
  message: string;         // human-readable, client-safe
  details?: Record<string, string[]>; // field-level validation errors
  timestamp: string;
}
```
Errors come from the central exception filter (`rules/08-error-handling.md`) — never leak
stack traces, SQL, or internals.

## Boundaries & Responsibilities
- The API is a **thin transport layer** over services (`backend-architecture.md`).
  Controllers validate, authorize, delegate, and map — no business logic.
- **Input is validated** at the boundary (DTOs + ValidationPipe / FluentValidation) and
  never trusted (`rules/05-security.md`).
- **Output is shaped** to response DTOs — entities are not serialized directly (avoid
  leaking internal/sensitive fields and over-fetching).

## Pagination, Filtering, Sorting
- Every list endpoint paginates (`limit`/`cursor` or `page`/`limit`) — never unbounded.
  Prefer cursor/keyset for large or infinite lists. Return `meta` with `hasMore`/`total`.
- Filtering/sorting via documented query params with allow-listed fields (no arbitrary
  query injection into the DB).

## Dependency Rules
- Controllers depend on services; services don't depend on controllers or HTTP types.
- DTOs (request/response) are the contract; shared request/response types live in
  `shared/` so FE and BE agree (`rules/frontend/typescript-frontend.md`).

## Security
- AuthN/AuthZ on every protected route; default-deny; resource-level ownership checks.
- Rate limiting on sensitive/expensive endpoints; CORS allow-list; security headers.
- Idempotency keys for unsafe operations that may be retried (payments, creates).
See `rules/05-security.md`, `architecture/authentication-architecture.md`.

## Documentation
- Generate and publish an **OpenAPI** spec (Swagger/NestJS decorators / Swashbuckle).
  The spec is part of "done"; clients and contract tests consume it.
- Document each endpoint's auth, params, request/response, and error codes.

## Idempotency & Concurrency
- Make retried writes idempotent (idempotency-key header → dedupe). Use optimistic
  concurrency (version/ETag) where lost updates matter.

## Anti-Patterns
- ❌ RPC-style verb endpoints; inconsistent casing/shapes across endpoints.
- ❌ Returning raw ORM entities; leaking internal fields.
- ❌ Unbounded lists; arbitrary client-controlled sort/filter into the DB.
- ❌ Breaking `/v1` instead of versioning.
- ❌ Inconsistent error shapes; leaking internals in errors.
- ❌ Business logic in controllers.

## Example
```typescript
@Controller('v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async list(@Query() query: ListUsersQueryDto): Promise<ApiResponse<UserResponse[]>> {
    const { items, total } = await this.userService.list(query);
    return { data: items, meta: { total, limit: query.limit, hasMore: query.offset + items.length < total } };
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<ApiResponse<UserResponse>> {
    return { data: await this.userService.findById(id) };
  }
}
```

## Related
`backend-architecture.md`, `authentication-architecture.md`, `rules/05-security.md`,
`rules/08-error-handling.md`, `playbooks/api-endpoint.md`.
