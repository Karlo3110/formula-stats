# Authentication & Authorization Architecture

## Purpose
Define how we establish *who a user is* (authentication) and *what they may do*
(authorization), consistently and securely, across frontend and backend. Identity is
delegated to a vetted provider; **authorization is always ours and always server-side.**

## Two Distinct Concerns
- **Authentication (AuthN)** — proving identity. Delegated to a provider
  (`rules/integrations/auth-providers.md`). Output: a verified token with a stable subject.
- **Authorization (AuthZ)** — deciding access. Owned by our backend: roles/permissions +
  resource ownership. Never delegated to the client.

## Token Model
- **Short-lived access token (JWT)** + **rotating refresh token**.
- Stored in `HttpOnly`, `Secure`, `SameSite` cookies on web — never `localStorage`.
- The backend **verifies every token** on every protected request: signature (provider
  JWKS), issuer, audience, expiry. A decoded-but-unverified token is worthless.
- Map the provider subject (`sub`) to a **local user record**; app data references the
  local id, decoupling from provider internals.

## Authorization Model
- **Default-deny.** Protected by default; routes opt into public access explicitly.
- **Role/permission checks** for coarse access (e.g., `@Roles(Role.Admin)`).
- **Resource-level checks** for fine access: confirm *this* user owns/may act on *this*
  record — prevents IDOR / broken object-level authorization. This check lives in the
  service/repository query (filter by owner/tenant), not after fetching.

```
Request ──▶ AuthN guard (verify token) ──▶ AuthZ guard (role) ──▶ Service (resource ownership) ──▶ data
            fail → 401                       fail → 403            fail → 403/404
```

## Boundaries & Dependency Rules
- Frontend may *gate UI* on auth state for UX, but **never enforces** security — every
  decision is re-checked server-side.
- Auth enforcement is cross-cutting: guards/middleware (`rules/backend/nestjs.md`,
  `rules/frontend/nextjs.md`), not hand-rolled per handler.
- The authenticated identity comes from the verified token, **never** from the request
  body/query.

## Session Lifecycle
- Login → provider authenticates → backend issues access+refresh cookies.
- Access expires → refresh rotates it (detect refresh reuse = revoke the family).
- Logout/revocation invalidates the session server-side (not just client-side deletion).
- MFA enforced via the provider for sensitive accounts.

## Multi-Tenancy (If Applicable)
- Every query is scoped by tenant; tenant comes from the verified token/session, never the
  request. Consider Postgres RLS as defense in depth (`rules/data/postgresql.md`).

## Security Requirements (Summary)
- Verify signature + claims with cached JWKS; rotate-tolerant.
- Rate-limit and monitor auth endpoints; lockout/backoff on repeated failures.
- Provider secrets/signing keys in the secret manager; PKCE + `state`/`nonce` on OAuth.
- Audit security-relevant auth events (`rules/05-security.md` §11).

## Anti-Patterns
- ❌ Trusting an unverified JWT or a client-supplied `userId`.
- ❌ Authorization only on the client.
- ❌ Tokens in `localStorage`/non-`HttpOnly` cookies.
- ❌ Role checks without resource-ownership checks (IDOR).
- ❌ Long-lived access tokens with no rotation/revocation.
- ❌ Rolling your own credential storage/session crypto when a provider exists.

## Example
See `rules/integrations/auth-providers.md` §7 (verification guard) and
`rules/05-security.md` §4 (guarded, role-checked, resource-aware endpoint).

## Related
`rules/integrations/auth-providers.md`, `rules/05-security.md`, `api-architecture.md`,
`playbooks/authentication-feature.md`.
