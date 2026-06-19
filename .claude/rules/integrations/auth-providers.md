# Authentication Provider Standards

## 1. Overview
We delegate identity to a vetted provider (Clerk, Auth0, Supabase Auth, Cognito, or a
managed OIDC/OAuth IdP) rather than building auth from scratch. The provider handles
credentials, MFA, and federation; **our backend still independently verifies every token
and owns authorization**. See `architecture/authentication-architecture.md`.

## 2. Approved Patterns
- **Use a managed provider**; never hand-roll password storage, session crypto, or OAuth
  flows unless there is no alternative (and then review heavily).
- **Verify tokens server-side on every request**: validate JWT signature (against the
  provider's JWKS), issuer, audience, and expiry. Trust nothing the client asserts about
  identity beyond a verified token.
- **Authorization is ours.** The provider says *who* the user is; our code decides *what*
  they may do (roles/permissions, resource ownership). Default-deny.
- **Short-lived access tokens + rotating refresh tokens.** Store tokens in `HttpOnly`,
  `Secure`, `SameSite` cookies (web) — not `localStorage`.
- **Map external identity to a local user record** keyed by the provider's stable subject
  (`sub`), so app data isn't coupled to provider internals.
- **PKCE** for OAuth/OIDC public clients; validate `state`/`nonce`.
- **MFA** available/required for sensitive accounts; enforce via the provider.
- Handle lifecycle webhooks (user created/deleted, etc.) idempotently and signature-verified.

## 3. Forbidden Patterns
- ❌ Rolling your own password hashing/session management when a provider exists.
- ❌ Trusting a decoded-but-unverified JWT, or trusting a `userId` from the request body.
- ❌ Storing tokens in `localStorage`/`sessionStorage` or non-`HttpOnly` cookies.
- ❌ Putting secrets/PII/roles you don't re-verify into the JWT and trusting them blindly.
- ❌ Doing authorization only on the client.
- ❌ Long-lived access tokens with no rotation/revocation story.
- ❌ Skipping `state`/PKCE in OAuth flows.

## 4. Security Requirements
- Verify signature + claims server-side using cached JWKS; reject on any mismatch.
- Enforce least-privilege roles; check resource-level ownership (prevent IDOR).
- Rate-limit and monitor auth endpoints; lockout/backoff on repeated failures
  (`rules/05-security.md`).
- Provider secrets (client secret, API keys, signing secrets) in the secret manager.
- Support revocation/logout that actually invalidates sessions.

## 5. Reliability
- Cache JWKS with refresh; tolerate key rotation. Handle provider downtime gracefully
  (clear error, no lockout of already-authenticated sessions where safe).
- Process identity webhooks idempotently.

## 6. Testing Requirements
- Test guards/middleware: valid token → allowed; expired/invalid/missing → rejected;
  wrong role/owner → forbidden. Mock the provider/JWKS in unit tests; cover the full flow
  in E2E with a test tenant.

## 7. Example — Token Verification Guard (NestJS)
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenVerifier) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = extractBearer(req);
    if (!token) throw new UnauthorizedException();
    const claims = await this.tokens.verify(token); // signature + iss + aud + exp via JWKS
    req.user = { id: claims.sub, roles: claims.roles ?? [] };
    return true;
  }
}
```

## 8. Review Checklist
- [ ] Managed provider used; no hand-rolled credential/session crypto.
- [ ] Tokens verified server-side (sig, iss, aud, exp) on every protected request.
- [ ] Authorization enforced server-side: roles + resource ownership; default-deny.
- [ ] Tokens in `HttpOnly`/`Secure` cookies; short-lived + refresh rotation.
- [ ] External identity mapped to a local user; webhooks idempotent + verified.
- [ ] Auth endpoints rate-limited; secrets in secret manager; tests cover allow/deny.
