# Security Rules (CRITICAL)

> Security is a hard constraint, never a trade-off. Every rule here is enforced in
> review and, where possible, in CI. The guiding axiom: **never trust input, client
> state, or request metadata.**

---

## 1. Secret Management

Secrets never appear in source, logs, errors, client bundles, or commits.

```typescript
// ❌ FORBIDDEN
const apiKey = 'sk-live-abc123';                 // hardcoded
const dbUrl = process.env.DATABASE_URL;          // raw access inside a service

// ✅ REQUIRED — config module, accessed via ConfigService
// config/configuration.ts
export default () => ({
  database: { url: process.env.DATABASE_URL, poolSize: parseInt(process.env.DB_POOL_SIZE ?? '10', 10) },
  jwt: { secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
});

// usage
constructor(private readonly config: ConfigService) {}
getDbUrl(): string {
  return this.config.getOrThrow<string>('database.url');
}
```

Rules:
- `process.env` is read **only** inside the config module. Everywhere else uses `ConfigService`.
- Validate all required env vars at boot (fail fast if missing). See `rules/integrations/`.
- Secrets live in a secret manager (AWS Secrets Manager, Vault, platform env). `.env.local`
  is git-ignored and never committed. Provide a committed `.env.example` with empty values.
- Rotate any secret that touches a log, a screenshot, or a chat message. Treat it as leaked.

---

## 2. Frontend Secrets

```typescript
// ❌ FORBIDDEN in Frontend — server-only secrets in the browser bundle
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;

// ✅ ALLOWED in Frontend — public values only (NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

Anything not prefixed `NEXT_PUBLIC_` must never be referenced in client components.
Privileged operations happen server-side (route handlers, server actions, the backend).

---

## 3. Input Validation (Never Trust Input)

Validate **everything** that crosses a trust boundary: HTTP bodies, query/params,
headers, webhooks, queue messages, file contents, env.

```typescript
// ❌ FORBIDDEN — no validation
@Post()
async create(@Body() dto: CreateUserDto) {}

// ✅ REQUIRED — class-validator DTO + global ValidationPipe
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @IsString() @MinLength(12) password!: string;
}

// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // strip unknown properties
  forbidNonWhitelisted: true,   // reject unknown properties
  transform: true,              // coerce to DTO types
}));
```

On the frontend and at any non-NestJS boundary, validate with Zod and parse `unknown`.
Validation rejects by default (allow-list), never sanitizes-and-hopes.

---

## 4. Authentication & Authorization

Authentication answers "who are you"; authorization answers "may you do this." Both are
enforced **server-side, on every protected operation**, using the authenticated identity
— never a value from the client body.

```typescript
// ❌ FORBIDDEN — trusts client-supplied identity, no guard
@Post('admin/action')
async adminAction(@Body() dto: ActionDto) {
  return this.service.doAdminThing(dto.userId, dto);
}

// ✅ REQUIRED — guarded, role-checked, identity from the token
@Post('admin/action')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
async adminAction(
  @CurrentUser() user: AuthenticatedUser,
  @Body() dto: ActionDto,
): Promise<ActionResponse> {
  return this.service.doAdminThing(user.id, dto);
}
```

- Authorize at the **resource** level, not just the route: confirm *this* user owns *this*
  record (prevent IDOR / broken object-level authorization).
- Default-deny: a missing guard should fail closed. Protect by default; opt routes into
  public access explicitly.
- See `architecture/authentication-architecture.md` for the full model.

---

## 5. Injection Prevention

```typescript
// ❌ FORBIDDEN — string interpolation into a query
const users = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ REQUIRED — parameterized / ORM methods
const users = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
const user = await prisma.user.findUnique({ where: { email } });
```

- Never build SQL, shell commands, file paths, or HTML by string concatenation with input.
- Parameterize SQL; use ORM query builders. For dynamic shell/FS work, use safe APIs and
  allow-list inputs.

---

## 6. XSS Prevention (Frontend)

```tsx
// ❌ FORBIDDEN — raw user HTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ REQUIRED — render as text, or sanitize if HTML is genuinely required
<div>{userContent}</div>

import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

- Prefer text rendering. Reach for `dangerouslySetInnerHTML` only with a sanitizer and a
  reviewed justification.
- Set a strict Content-Security-Policy. Avoid `eval`, inline event handlers, and
  `javascript:` URLs.

---

## 7. CORS

```typescript
// ❌ FORBIDDEN — wide open
app.enableCors();

// ✅ REQUIRED — explicit allow-list from config
app.enableCors({
  origin: config.getOrThrow<string[]>('cors.origins'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});
```

Never reflect the request `Origin` header back unconditionally. Never combine
`origin: '*'` with `credentials: true`.

---

## 8. Rate Limiting & Abuse Protection

```typescript
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // 5 / minute
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {}
}
```

Rate-limit authentication, password reset, signup, payment, and any expensive or
sensitive endpoint. Apply progressive backoff / lockout on repeated auth failures.

---

## 9. Transport & Headers

- HTTPS everywhere; HSTS enabled. No mixed content.
- Security headers via Helmet (or framework equivalent): CSP, `X-Content-Type-Options:
  nosniff`, `X-Frame-Options`/frame-ancestors, `Referrer-Policy`.
- Cookies for sessions/tokens: `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict`).

---

## 10. Passwords, Tokens & Crypto

- Hash passwords with **argon2id** (preferred) or **bcrypt** (cost ≥ 12). Never store
  plaintext or reversible encryption for passwords.
- Use cryptographically secure randomness (`crypto.randomBytes`) for tokens, never `Math.random()`.
- JWTs: short-lived access tokens + rotating refresh tokens; verify signature and
  expiry; never put secrets or PII in the payload.
- Use vetted libraries. Never roll your own crypto.

---

## 11. Logging, Audit & Data Handling

- **Never log** passwords, tokens, full card numbers, secrets, or sensitive PII. Redact
  at the logger. See `rules/observability/logging.md`.
- Maintain an **audit trail** for security-relevant actions (login, role change,
  payment, data export, admin action): who, what, when, from where.
- Apply least privilege to data access and follow data-retention/minimization
  requirements. Encrypt sensitive data at rest and in transit.

---

## 12. Dependencies & Supply Chain

- Pin and lock dependencies (`package-lock.json` committed). No floating `latest`.
- Run automated vulnerability scanning (e.g., `npm audit`, Dependabot) in CI; triage
  highs/criticals before merge.
- Justify every new dependency in the PR (`rules/01-code-quality.md`). Prefer the
  standard library and existing deps.

---

## 13. Error Responses Don't Leak

Return generic messages to clients; log details server-side. Never expose stack traces,
SQL, internal paths, or library versions to the client. See `rules/08-error-handling.md`.

---

## Security Review Gate

Every PR touching auth, data access, input handling, or external calls must satisfy
`checklists/security-review.md` before merge.
