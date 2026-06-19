# API Contract (REST)

Shared by every REST backend (NestJS and .NET) so the frontend always sees the same shapes.
This document governs the **REST** surface. The GraphQL surface and the rule for which
operations belong to REST vs GraphQL are in `backend/graphql.md`. Read with
`core/05-security-baseline.md`.

## Versioning

- All routes are prefixed `/api/v1`. Breaking changes increment the version.

## Resource paths

- Plural, kebab-case nouns: `/api/v1/user-profiles`.
- The HTTP method is the verb. No verbs in paths.
- Nesting reflects ownership: `/api/v1/orders/{orderId}/items`.

## HTTP status codes

| Situation | Code |
| --- | --- |
| Read / update success | 200 |
| Create success | 201 |
| Success, no body | 204 |
| Validation failure | 400 |
| Unauthenticated | 401 |
| Authenticated but forbidden | 403 |
| Not found | 404 |
| Conflict (duplicate, version) | 409 |
| Rate limited | 429 |
| Unhandled server error | 500 |

## Success responses

- **Single resource:** return the resource DTO directly.
  ```json
  { "id": "018f...", "email": "a@b.com", "displayName": "Ana" }
  ```
- **Collection:** return a `data` array plus `pagination`.
  ```json
  {
    "data": [ /* resource DTOs */ ],
    "pagination": { "page": 1, "pageSize": 20, "total": 137, "totalPages": 7 }
  }
  ```

## Pagination request

- Query params: `page` (1-based), `pageSize` (default 20, max 100), optional `sort`
  (`field:asc|desc`).
- The server clamps `pageSize` to the max. Never trust the client to limit.

## Error responses (RFC 7807-style, consistent everywhere)

```json
{
  "type": "https://errors.example.com/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "errors": {
    "email": ["Must be a valid email address."],
    "displayName": ["Must be at least 1 character."]
  },
  "traceId": "018f..."
}
```

Rules:
- Same shape for every error, every backend.
- `errors` is present only for field-level validation failures.
- `detail` is safe for users. No stack traces, SQL, or internal identifiers in production.
- `traceId` correlates to server logs for debugging.

## DTO discipline

- **Request DTOs** define exactly what the endpoint accepts. Unknown fields are rejected.
- **Response DTOs** define exactly what the endpoint returns — only fields the client uses.
- Entities are never serialized directly. Internal fields (password hash, tokens,
  `deleted_at`, internal flags) never appear in a response DTO.
- Request and response DTOs are distinct types even when similar.

## Idempotency and methods

- `GET` is safe and cacheable; never mutates.
- `PUT` replaces; `PATCH` partially updates; both are idempotent.
- `POST` creates; provide an idempotency key for operations that must not double-execute.
- `DELETE` is idempotent (deleting an already-deleted resource returns 204 or 404 consistently).

## Auth on the wire

- Access token sent as `Authorization: Bearer <token>`.
- Refresh token in an httpOnly + Secure + SameSite=Strict cookie, never in a response body
  accessible to JS.
- CORS is an explicit origin allowlist; credentials enabled only for allowed origins.
