# Security Baseline

Security is mandatory by default. These rules apply to every project unless a specific
route is explicitly and deliberately marked public.

## Authentication and authorization

- **Default deny.** Every endpoint requires authentication. Public endpoints are the
  exception and are explicitly marked (e.g. a `@Public()` decorator in NestJS,
  `[AllowAnonymous]` in .NET).
- **Authorization is checked per request**, on the server, for every protected resource.
  Never trust a client-supplied role or ownership claim.
- **Object-level checks.** Verify the authenticated user is allowed to act on the specific
  resource (the order belongs to them), not merely that they are logged in.
- Use the shared auth model in `database/database-standards.md`: short-lived JWT access
  token, rotating refresh token in an httpOnly + Secure + SameSite cookie, RBAC.

## Input handling

- Validate and parse all input at the boundary with a schema (zod / class-validator /
  FluentValidation). Reject unknown fields.
- Treat all client input as hostile until validated.
- Use parameterized queries / the ORM. Never build SQL by string concatenation.
- Escape or sanitize any user content that is rendered as HTML.

## Output handling

- **Never leak internal fields.** Map entities to response DTOs that contain only the
  fields the client uses. Password hashes, tokens, internal flags, and soft-delete columns
  never reach the client.
- Error responses use the standard shape in `backend/api-contract.md`. Do not return stack
  traces, SQL, or internal messages to clients in production.

## Transport and headers

- HTTPS everywhere. Redirect HTTP to HTTPS at the edge.
- Set security headers (NestJS: `helmet`; .NET: equivalent middleware): HSTS,
  `X-Content-Type-Options: nosniff`, a restrictive CSP, no `X-Powered-By`.
- CORS is an explicit allowlist of origins from validated config. Never `*` with credentials.

## Secrets and credentials

- No secrets in client bundles, logs, error messages, or the repository.
- Passwords hashed with a modern algorithm (argon2id or bcrypt with a sane cost factor).
- Refresh tokens stored hashed (not plaintext) in the database.
- Tokens and secrets are rotated; refresh tokens are single-use and rotated on each refresh.

## Rate limiting and abuse

- Apply rate limiting on auth endpoints and any expensive operation.
- Lock out or back off after repeated failed logins.

## Logging

- Log auth events and authorization failures.
- Never log secrets, tokens, passwords, or full PII. Redact before logging.

## Dependencies

- Pin versions. Run dependency vulnerability scanning in CI.
- Do not add a dependency to solve a trivial problem (see `core/00-principles.md` rule 5).

## Per-endpoint security checklist

- [ ] Requires auth, or explicitly marked public with justification.
- [ ] Authorization (role + object ownership) verified server-side.
- [ ] Input validated against a schema; unknown fields rejected.
- [ ] Response DTO excludes internal/sensitive fields.
- [ ] Errors return the standard shape without internal detail.
- [ ] Rate limited if sensitive or expensive.
