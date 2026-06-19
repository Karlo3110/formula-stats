# Playbook: Authentication / Identity Feature

> Identity and access work. Delegate authentication to a provider; own authorization
> server-side. Read `architecture/authentication-architecture.md` and
> `rules/integrations/auth-providers.md` first.

## 1. Plan
- [ ] Define exactly what's changing: login/signup flow, role/permission, session handling,
      MFA, password reset, SSO/OAuth, etc.
- [ ] Confirm the provider handles credentials/sessions; you handle **authorization** and
      the local user mapping.
- [ ] Map the authZ model: roles/permissions + resource-ownership rules. Default-deny.
- [ ] Identify every endpoint/route affected and its required access.

## 2. Implement
- [ ] **Token verification** server-side on every protected request: signature (JWKS),
      issuer, audience, expiry. Never trust an unverified token or a client-supplied
      `userId`.
- [ ] **Guards/middleware** for authN + authZ applied declaratively (backend guards;
      Next.js middleware). Add resource-ownership checks in the service/query (prevent
      IDOR).
- [ ] **Token storage**: `HttpOnly`, `Secure`, `SameSite` cookies; short-lived access +
      rotating refresh (detect refresh reuse).
- [ ] **Local user mapping** keyed by provider `sub`.
- [ ] OAuth flows use **PKCE** + `state`/`nonce`. Identity webhooks handled idempotently +
      signature-verified.
- [ ] Rate-limit auth endpoints; lockout/backoff on repeated failures; audit auth events
      (`rules/05-security.md`).

## 3. Test
- [ ] Guard/middleware tests: valid token → allowed; expired/invalid/missing → `401`; wrong
      role → `403`; wrong owner → `403`/`404`.
- [ ] Refresh rotation + reuse detection; logout actually invalidates the session.
- [ ] E2E the full login→access→refresh→logout journey with a test tenant
      (`rules/07-testing.md`).

## 4. Document
- [ ] Document the authZ model (roles/permissions, ownership rules) and the session
      lifecycle. Update `shared/` types for the authenticated user shape.

## 5. Deploy
- [ ] Provider secrets/signing keys in the secret manager. Configure callback URLs per
      environment. Backward-compatible session handling across the rollout window.

## 6. Verify
- [ ] Verify in staging then prod: protected routes reject the unauthorized; authorized
      access works; tokens are `HttpOnly`; refresh rotates; logout revokes.
- [ ] Confirm auth metrics and failed-login alerting
      (`rules/observability/monitoring-metrics.md`).

## Definition of Done
Tokens verified server-side · authZ enforced (role + ownership, default-deny) · secure
cookie storage + refresh rotation · provider mapped to local user · auth endpoints
rate-limited + audited · tested allow/deny paths · verified.

## Red Lines
Never trust an unverified token or client `userId` · never authorize only on the client ·
never store tokens in `localStorage` · never skip resource-ownership checks.
