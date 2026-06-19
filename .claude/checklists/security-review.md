# Security Review Checklist

> Required for any change touching authentication, authorization, data access, input
> handling, payments, file uploads, or external calls. Backs `rules/05-security.md`.

## Input & Output
- [ ] Every input crossing a trust boundary (body, query, params, headers, webhooks, queue,
      file, env) is validated with an allow-list (DTO/Zod) — reject by default.
- [ ] No injection: parameterized SQL/queries; no shell/path/HTML built from input.
- [ ] Output encoded/escaped; no `dangerouslySetInnerHTML` without DOMPurify.
- [ ] Responses are shaped DTOs — no entity/internal fields leaked.

## Authentication & Authorization
- [ ] Tokens verified server-side (signature, issuer, audience, expiry) on every protected
      request; unverified tokens never trusted.
- [ ] Identity taken from the verified token, never the request body/query.
- [ ] AuthZ enforced server-side: role check **and** resource-ownership check (no IDOR).
- [ ] Default-deny; protected-by-default; public routes opt in explicitly.
- [ ] Tokens in `HttpOnly`/`Secure`/`SameSite` cookies; short-lived + refresh rotation.

## Secrets & Config
- [ ] No hardcoded secrets/keys/credentials anywhere.
- [ ] `process.env` only in the config module; access via ConfigService.
- [ ] Only `NEXT_PUBLIC_` values reach the client; no server secret in the bundle.
- [ ] Secrets sourced from the secret manager; `.env*` not committed (except `.env.example`).

## Transport & Headers
- [ ] HTTPS/HSTS; security headers (CSP, nosniff, frame-ancestors, referrer-policy).
- [ ] CORS is an explicit allow-list (no `*` with credentials).

## Abuse & Rate Limiting
- [ ] Auth, reset, signup, payment, and expensive endpoints are rate-limited.
- [ ] Lockout/backoff on repeated auth failures.

## Crypto & Data Handling
- [ ] Passwords hashed with argon2id/bcrypt(≥12); secure randomness for tokens.
- [ ] Sensitive data encrypted at rest/in transit; least-privilege data access.
- [ ] No passwords/tokens/PII/secrets in logs or error responses (redaction in place).
- [ ] Security-relevant actions write an audit trail.

## Payments (if applicable) — see `rules/integrations/stripe.md`
- [ ] Amounts computed server-side; idempotency keys; webhook signature verified on raw
      body; entitlement granted on verified webhook in a transaction; no card data stored.

## Webhooks / External Calls (if applicable)
- [ ] Inbound webhooks: signature verified (raw body), idempotent, order-tolerant.
- [ ] Outbound: timeouts; no SSRF (URLs validated/allow-listed); retries bounded.

## Dependencies
- [ ] New deps justified; lockfile committed; vulnerability scan passes (no unresolved
      highs/criticals).

---
**Gate:** any unchecked relevant box blocks merge. If a leak occurred (secret in a log/
commit), rotate it before proceeding.
