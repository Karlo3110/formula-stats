# Formula Stats — Full Project Specification

> A single, self-contained reference describing the **Formula Stats** application:
> what it is, the technologies it uses, its architecture, the algorithms behind its
> most interesting features, and representative code. Written to be used as source
> material for a seminar/technical paper.

---

## 1. Executive Summary

**Formula Stats** is a full-stack Formula 1 statistics and visualization web
application. It lets anyone browse the F1 calendar, championship standings, and
historical results, learn the sport through a structured "learning center," and —
its centerpiece — watch a **3D, telemetry-driven replay of the start of a real
Grand Prix**, reconstructed from official timing data.

The system is built as **three cooperating services**:

1. **Frontend** — a Next.js (App Router) single-page-style web app that renders the
   dashboard, standings, learning content, and an interactive WebGL 3D race scene.
2. **Backend** — a NestJS REST API that owns authentication, users, and acts as a
   caching/persistence gateway in front of the F1 data.
3. **DataService** — a Python (FastAPI) microservice that wraps the
   [FastF1](https://theoehrly-fast-f1.mintlify.app/) library and turns raw F1
   telemetry into clean, render-ready geometry.

The three services are backed by **PostgreSQL** (durable data), **Redis** (hot
cache + ephemeral auth state), and a file cache for FastF1. Everything is deployed
on **Railway** across isolated staging and production environments.

**Why the design is interesting for a seminar:**
- It demonstrates a **polyglot microservice architecture** (TypeScript + Python)
  with a clear separation of concerns and server-to-server trust boundaries.
- It contains a **real data-engineering pipeline**: noisy GPS/telemetry → cleaned,
  resampled, smoothed 3D track geometry → time-aligned, rank-computed race replay.
- It has a **production-grade self-hosted auth system**: argon2id password hashing,
  short-lived JWT access tokens, rotating opaque refresh tokens with reuse
  detection, email verification, and password reset.
- The frontend uses **modern React patterns**: Server Components by default,
  TanStack Query for server state, Zustand for UI state, and React Three Fiber for
  a 60 fps 3D scene driven by an interpolating animation source.

---

## 2. Technology Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 | Server Components by default |
| Styling | Tailwind CSS v4 (CSS-variable tokens) | Dark "esports" aesthetic, semantic tokens |
| Server state | TanStack Query v5 | Caching, dedup, background refresh |
| Client/UI state | Zustand v5 | Auth session, race scene state |
| 3D rendering | Three.js + React Three Fiber + `@react-three/drei` | WebGL race visualization |
| Forms & validation | React Hook Form + Zod | Runtime-validated inputs |
| **Backend** | NestJS 11, TypeScript 5, Node ≥ 20 | Controller → Service → Repository |
| ORM / DB | Prisma 6 + PostgreSQL | UUID v7 PKs, `timestamptz`, soft delete |
| Cache | Redis (ioredis) behind a `CacheService` interface | Read-through cache + TTL keys |
| Auth crypto | argon2 (argon2id), Node `crypto`, `@nestjs/jwt` | Self-hosted JWT |
| Email | Resend | Verification codes + reset links |
| Validation | class-validator + Zod | DTO validation + boundary parsing |
| Security | Helmet, `@nestjs/throttler`, cookie-parser | Rate limiting, headers, cookies |
| **DataService** | Python, FastAPI, Uvicorn | Thin FastF1 wrapper |
| F1 data | FastF1 (pandas / numpy under the hood) + Ergast/Jolpica | Telemetry, results, standings |
| **Infra** | Railway (staging + production), Nixpacks builds | Postgres + Redis + volume per env |

**Rough size:** ~159 TypeScript/TSX files across frontend + backend, ~836 lines of
Python in the data service.

---

## 3. High-Level Architecture

```
                      Browser (Next.js client)
                              │
                 HTTPS  ▲     │  fetch /api/v1/*  (Bearer access token
                        │     │                    + httpOnly refresh cookie)
                        │     ▼
              ┌─────────────────────────┐
              │   Backend (NestJS API)  │   ← auth, users, F1 gateway
              │  Controller→Service→Repo│
              └───────┬─────────┬───────┘
                      │         │
          Prisma ▼    │         │  ▼ ioredis
            ┌─────────────┐  ┌──────────┐
            │ PostgreSQL  │  │  Redis   │  ← hot cache, verify codes,
            │ users,      │  │  cache + │     reset tokens (TTL)
            │ tokens, F1  │  │ ephemeral│
            └─────────────┘  └──────────┘
                      ▲
                      │  server-to-server, private network,
                      │  X-Internal-Key header  (only on cache miss)
                      ▼
              ┌─────────────────────────┐
              │ DataService (FastAPI)   │   ← wraps FastF1
              └───────────┬─────────────┘
                          │
                          ▼
                    FastF1 library  ──►  file cache (volume)
                    + Ergast/Jolpica API
```

**Key architectural decisions:**

- **The browser never touches FastF1 or the DataService directly.** F1 data flows
  through three tiers: **Redis (hot) → PostgreSQL (durable history) → DataService
  (FastF1)**. This shields the upstream from rate limits, makes repeat loads
  instant, and builds a permanent race archive over time.
- **The DataService is private** and authenticated with a shared `X-Internal-Key`
  header — only the backend may call it (server-to-server on Railway's private
  network).
- **Every trust boundary validates its input.** The backend validates DataService
  responses with Zod; the frontend validates API responses with Zod; controllers
  validate request DTOs with class-validator.

---

## 4. Repository Layout

```
/
├── Backend/          # NestJS API
│   ├── src/
│   │   ├── common/        # decorators, guards, filters, exceptions, types
│   │   ├── config/        # Zod env validation
│   │   ├── modules/
│   │   │   ├── auth/       # register, login, refresh, verify, reset
│   │   │   ├── users/      # user repository + response DTO
│   │   │   └── f1/         # F1 gateway (service, repo, data-service client)
│   │   ├── mail/          # Resend mailer
│   │   ├── prisma/        # PrismaService (singleton)
│   │   ├── redis/         # CacheService abstraction + Redis implementation
│   │   └── main.ts        # bootstrap (helmet, cors, validation pipe)
│   └── prisma/schema.prisma
│
├── Frontend/         # Next.js app
│   └── src/
│       ├── app/          # App Router: (auth), (public) route groups
│       ├── components/    # ui/, auth/, race/, learn/, home/, standings/…
│       ├── hooks/         # use-auth, use-f1, use-countdown, use-race-clock…
│       ├── lib/           # http-client, race engine, learn content, config
│       ├── services/      # typed API client functions
│       ├── stores/        # Zustand stores (auth, race)
│       └── providers/     # QueryProvider, AuthInitializer
│
├── DataService/      # Python FastF1 microservice
│   └── app/
│       ├── main.py        # FastAPI app + health endpoints
│       ├── routers/f1.py  # F1 endpoints (guarded by internal key)
│       ├── fastf1_client.py # the data pipeline (track + replay algorithms)
│       ├── models.py      # Pydantic response models
│       ├── config.py      # settings
│       └── security.py    # internal-key dependency
│
└── .claude/          # Engineering standards (rules the codebase follows)
```

---

## 5. Backend (NestJS)

### 5.1 Layering

The backend follows a strict **Controller → Service → Repository** layering with
dependency injection throughout:

- **Controllers** are thin: they route, validate DTOs, and return response DTOs.
- **Services** hold all business logic and orchestration.
- **Repositories** are the only place Prisma is touched.
- Cross-cutting concerns live in `common/` (guards, filters, decorators).

`main.ts` wires the global security and validation posture:

```ts
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.use(helmet());          // security headers
  app.use(cookieParser());    // refresh-token cookie

  app.enableCors({
    origin: config.getOrThrow<string>('CORS_ORIGINS').split(',').map(o => o.trim()),
    credentials: true,        // allow the httpOnly refresh cookie
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // strip unknown fields
    forbidNonWhitelisted: true,// reject unknown fields
    transform: true,           // coerce to DTO types
    exceptionFactory: validationExceptionFactory,
  }));

  app.enableShutdownHooks();
  await app.listen(config.getOrThrow<number>('PORT'));
}
```

### 5.2 Configuration is validated at boot (fail fast)

Environment variables are parsed once with Zod. A missing/invalid value throws at
startup rather than causing a mysterious runtime failure later:

```ts
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),  // 15 min
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  RESEND_API_KEY: z.string().min(1),
  // …
});
```

### 5.3 Authentication System (the security highlight)

The app implements **self-hosted authentication** rather than delegating to a
provider. It combines several standard best practices:

- **Passwords** hashed with **argon2id** (memory-hard, GPU-resistant). Never stored
  in plaintext, never logged.
- **Access tokens**: short-lived (15 min) **JWTs** carrying `{ sub, email, role }`.
  Sent by the client in the `Authorization: Bearer` header.
- **Refresh tokens**: long-lived (30 day) **opaque** tokens, stored **hashed**
  (SHA-256) in PostgreSQL, delivered to the browser in an **httpOnly, Secure,
  SameSite cookie** scoped to `/api/v1/auth`. JavaScript can never read them.
- **Rotation with reuse detection**: every refresh consumes (revokes) the old token
  and issues a new one. If an **already-revoked** token is presented, that signals
  theft, so the **entire token family for the user is revoked**.
- **Email verification** (6-digit codes) and **password reset** (random URL-safe
  tokens) use **Redis with a TTL** — ephemeral state that doesn't belong in the DB.
- **Rate limiting**: auth endpoints are throttled to 5 requests/minute.
- **No user enumeration**: "forgot password" and "resend verification" always
  resolve successfully regardless of whether the email exists.

**Account state machine** (`users.status`): `PENDING_VERIFICATION → ACTIVE →
(SUSPENDED | LOCKED | DEACTIVATED)`. Login is rejected for any non-`ACTIVE` account.

**Token issuance & rotation** (from `token.service.ts`):

```ts
/** Creates a new refresh-token family entry and returns the raw token. */
async issueRefreshToken(userId: string): Promise<string> {
  const secret = randomBytes(32).toString('base64url');   // cryptographically secure
  const expiresAt = new Date(Date.now() + ttlDays * 86_400_000);
  const record = await this.refreshTokens.create({
    userId,
    tokenHash: hashSecret(secret),   // store the HASH, never the raw secret
    expiresAt,
  });
  return `${record.id}.${secret}`;   // raw token = id.secret
}

private async consume(rawToken: string): Promise<string> {
  const parsed = parseToken(rawToken);
  const record = await this.refreshTokens.findById(parsed.id);
  if (!record) throw new InvalidRefreshTokenException();

  // Reuse of an already-revoked token => compromise: revoke the whole family.
  if (record.revokedAt) {
    await this.refreshTokens.revokeAllForUser(record.userId);
    throw new InvalidRefreshTokenException();
  }
  if (record.expiresAt.getTime() < Date.now()) throw new InvalidRefreshTokenException();
  if (!secretMatches(parsed.secret, record.tokenHash)) throw new InvalidRefreshTokenException();

  await this.refreshTokens.revoke(record.id);   // single-use: rotate on every refresh
  return record.userId;
}
```

Note the use of **`timingSafeEqual`** for secret/code comparison to avoid timing
side-channels, and `randomInt`/`randomBytes` (never `Math.random()`) for all
security-relevant randomness.

**Cookie handling** (from `auth.controller.ts`) adapts to environment:

```ts
private baseCookieOptions(): CookieOptions {
  const isProduction = this.config.getOrThrow<string>('NODE_ENV') === 'production';
  return {
    httpOnly: true,
    secure: isProduction,                       // HTTPS-only in prod
    sameSite: isProduction ? 'none' : 'lax',    // cross-subdomain in prod
    path: '/api/v1/auth',
    ...(domain ? { domain } : {}),
  };
}
```

### 5.4 The F1 Gateway: three-tier caching

The `F1Service` is the clearest example of the caching strategy. Each read checks
Redis first, then PostgreSQL, and only calls the DataService on a full miss —
persisting whatever it fetches so it becomes permanent history:

```ts
async getSessionResults(season, round, session): Promise<SessionResultsDto> {
  const key = `f1:results:${season}:${round}:${session}`;

  const cached = await this.cache.get<SessionResultsDto>(key);   // tier 1: Redis
  if (cached) return cached;

  const stored = await this.repository.findResults(season, round, session); // tier 2: Postgres
  if (stored.length > 0) {
    return this.cacheAndReturn(key, resultsToSessionResultsDto(...stored), RESULTS_TTL);
  }

  const dto = toSessionResultsDto(                                // tier 3: DataService (FastF1)
    await this.dataService.getSessionResults(season, round, session),
  );
  await this.repository.replaceResults(season, round, session, dto.results); // persist
  return this.cacheAndReturn(key, dto, RESULTS_TTL);
}
```

TTLs are chosen by volatility: schedules/standings 1 h; results 24 h; derived
geometry (track maps, replays) 7 days. Derived-geometry keys carry a **version
suffix** (e.g. `f1:replay:v9:…`) so that when the generation algorithm changes, all
old caches are invalidated simply by bumping the version constant.

**The DataService client treats every upstream response as untrusted** — it fetches
with a timeout (AbortController) and validates the JSON against a Zod schema:

```ts
private async get<T>(path: string, schema: ZodType<T>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), this.config.getOrThrow('DATA_SERVICE_TIMEOUT_MS'));
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: 'application/json', 'X-Internal-Key': key },
      signal: controller.signal,
    });
    if (!response.ok) throw new DataServiceUnavailableException(`Data service responded ${response.status}.`);
    return schema.parse(await response.json());   // runtime validation
  } finally {
    clearTimeout(timeout);
  }
}
```

### 5.5 Caching abstraction (Dependency Inversion)

Business code depends on an **abstract `CacheService`**, never on Redis directly —
making the cache swappable and testable:

```ts
export abstract class CacheService {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract deleteByPrefix(prefix: string): Promise<void>;
}
```

`RedisCacheService` implements it over ioredis (with `SCAN`-based prefix deletion,
never the blocking `KEYS *`), and is wired via NestJS DI.

### 5.6 Consistent error handling

A single `GlobalExceptionFilter` maps every thrown error to a stable, RFC-7807-style
JSON shape with a `traceId`, logs unexpected 500s (with stack), and **never leaks
internals** to the client:

```json
{ "title": "USER_NOT_FOUND", "status": 404, "detail": "...",
  "code": "USER_NOT_FOUND", "traceId": "018f…" }
```

Domain errors are typed (`InvalidCredentialsException`, `EmailAlreadyRegisteredException`,
`DataServiceUnavailableException`, …), each carrying a machine-readable `code` and
HTTP status.

### 5.7 Database schema (Prisma)

Conventions: `snake_case` tables/columns, **UUID v7** primary keys (time-ordered,
index-friendly, non-enumerable), `timestamptz` timestamps, soft delete.

```prisma
model User {
  id              String    @id @default(uuid(7)) @db.Uuid
  email           String    @unique
  passwordHash    String    @map("password_hash")
  displayName     String    @map("display_name")
  role            String    @default("MEMBER")
  status          String    @default("PENDING_VERIFICATION")
  emailVerifiedAt DateTime? @map("email_verified_at") @db.Timestamptz
  // created_at / updated_at / deleted_at …
  refreshTokens   RefreshToken[]
  @@map("users")
}

model RefreshToken {
  id        String    @id @default(uuid(7)) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  tokenHash String    @map("token_hash")   // hashed, never the raw token
  expiresAt DateTime  @map("expires_at") @db.Timestamptz
  revokedAt DateTime? @map("revoked_at") @db.Timestamptz
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@map("refresh_tokens")
}

// F1 archive — fetched once from FastF1, then durable history.
model F1SessionResult {
  // season, roundNumber, session, position, driverNumber, abbreviation,
  // fullName, teamName, points, status …
  @@unique([season, roundNumber, session, driverNumber])
  @@index([season, roundNumber, session])
  @@map("f1_session_results")
}

model F1TrackMap {
  points  Json   // derived track geometry cached as JSON
  @@unique([season, roundNumber, session])
  @@map("f1_track_maps")
}
```

---

## 6. DataService (Python / FastAPI / FastF1) — the data pipeline

This is the most algorithmically interesting service. It wraps FastF1 and turns raw,
noisy telemetry into clean, render-ready geometry that the frontend can animate.

### 6.1 Design notes

- **FastAPI** with a small router guarded by an **internal-key dependency** — only
  the backend can reach it.
- FastF1 (and its pandas/numpy/matplotlib stack) is **imported lazily** inside each
  function, so a heavy or failing import never blocks app startup or the health
  endpoints.
- FastF1 calls are blocking (network + parsing), so handlers are plain sync `def`
  functions and run in **FastAPI's threadpool**.
- Responses are typed with **Pydantic** models.

```python
router = APIRouter(prefix="/api/v1", tags=["f1"],
                   dependencies=[Depends(require_internal_key)])

@router.get("/seasons/{season}/rounds/{round_number}/sessions/{session}/replay",
            response_model=ReplaySession)
def replay(season: int, round_number: int, session: str) -> ReplaySession:
    return get_replay(season, round_number, session)
```

### 6.2 Building a clean 3D track outline

The fastest lap's raw GPS position stream is noisy and unevenly sampled. To turn it
into a smooth, closed loop with real elevation, the pipeline:

1. **Removes duplicate points** (where the car didn't move).
2. Computes **cumulative arc-length** along the lap.
3. **Resamples** to a fixed number of evenly-spaced points via linear interpolation.
4. **Circularly smooths** X, Y, and Z (elevation) with a moving-average kernel that
   wraps around the start/finish so there's no seam.
5. **Normalizes** to a fixed world span and lifts elevation so the lowest point sits
   at zero — keeping the circuit's real undulation in proportion.

```python
def _clean_resample_smooth(xs, ys, zs=None):
    keep = np.concatenate([[True], (np.diff(xs) != 0) | (np.diff(ys) != 0)])
    xs, ys = xs[keep], ys[keep]
    if zs is not None: zs = zs[keep]

    seg = np.sqrt(np.diff(xs) ** 2 + np.diff(ys) ** 2)
    cumulative = np.concatenate([[0.0], np.cumsum(seg)])   # arc length
    total = float(cumulative[-1])

    samples = np.linspace(0, total, TRACK_POINTS, endpoint=False)
    xr = _circular_smooth(np.interp(samples, cumulative, xs), TRACK_SMOOTH_WINDOW)
    yr = _circular_smooth(np.interp(samples, cumulative, ys), TRACK_SMOOTH_WINDOW)
    zr = _circular_smooth(np.interp(samples, cumulative, zs), TRACK_SMOOTH_WINDOW) if zs is not None else None
    return xr, yr, zr

def _circular_smooth(values, window):
    padded = np.concatenate([values[-window:], values, values[:window]])  # wrap the seam
    kernel = np.ones(window) / window
    return np.convolve(padded, kernel, mode="same")[window:-window]
```

Each output track point is `[x, elevation, y]` in a shared normalized world space,
so the frontend can build the ribbon mesh directly.

### 6.3 Reconstructing a race-start replay

The showpiece endpoint (`get_replay`) reconstructs a **session-time-aligned replay**
of the race start — real, wheel-to-wheel racing with correct overtakes and running
order — from per-driver position streams.

Key steps and the problems they solve:

- **Shared time grid.** Every driver's position stream is interpolated onto one
  common time axis so all cars advance on a single race clock.
- **Real grid at lights-out.** Rather than clamping all cars onto one point before
  the start, the algorithm samples each car at its true grid position during a short
  countdown, then plays the race.
- **True on-track order via track progress.** Position alone is ambiguous; the code
  projects each car onto the nearest track-outline vertex and accumulates a lap each
  time it wraps past start/finish, giving a monotonic "distance covered" that yields
  the real running order.
- **Official speed** from car telemetry, aligned to the grid.
- **On/off-track flag** held with a nearest-previous lookup (categorical, not
  interpolated) so cars in run-off are flagged.
- **Race-control messages** (yellow/red flags, safety car, incidents) mapped onto
  the replay clock — best-effort, so any failure yields an empty feed rather than
  breaking the replay.

```python
def _track_progress(xi, yi, ox, oy, arclen, lap_length):
    """Distance each car has covered = lap*length + arc-length along the outline."""
    d2 = (xi[:, None] - ox[None, :]) ** 2 + (yi[:, None] - oy[None, :]) ** 2
    s = arclen[np.argmin(d2, axis=1)]              # nearest outline vertex

    progress = np.empty_like(s)
    offset = 0.0
    progress[0] = s[0]
    for k in range(1, len(s)):
        if s[k] < s[k - 1] - lap_length * 0.5:     # wrapped past start/finish
            offset += lap_length
        progress[k] = s[k] + offset
    return progress

# Rank 1..N per sample: furthest along the track = leader
ranks = np.argsort(np.argsort(-progress, axis=0), axis=0) + 1
```

Each driver's samples are emitted as compact numeric arrays — one row per time
sample — to keep the payload small:

```
Sample layout: [t, x, y, elevation, speedKmh, position, progressMetres, onTrack]
```

The service also derives **per-circuit scale** so cars and track width look
correctly proportioned on every track (e.g. Monaco vs Spa), and returns team colors
so the frontend can paint each car.

### 6.4 Standings via Ergast/Jolpica

Championship standings come from FastF1's `Ergast` client (driver + constructor
tables), mapped into typed Pydantic rows.

---

## 7. Frontend (Next.js)

### 7.1 Architecture principles

- **Server Components by default**; `"use client"` is pushed to the smallest
  interactive leaf.
- **Route groups** organize the app: `(public)` for the dashboard, standings,
  history, learn, about; `(auth)` for login/register/verify/reset.
- **Separation of concerns**: components render; **hooks** own stateful logic;
  **services** own API calls; **stores** own client state; **lib/utils** are pure.
- **Server state** lives in TanStack Query; **UI state** lives in Zustand. Server
  data is never duplicated into client stores.

### 7.2 Typed HTTP client with transparent token refresh

A single `httpClient` reads the API base URL from validated config, attaches the
access token, and — crucially — implements **single-flight refresh-and-retry** on
`401`: concurrent expired requests trigger only one refresh call, then retry:

```ts
// Single-flight refresh so concurrent 401s trigger only one refresh call.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    const response = await fetch(`${clientConfig.apiUrl}/api/v1/auth/refresh`, {
      method: 'POST', credentials: 'include',   // sends the httpOnly refresh cookie
    });
    if (!response.ok) { setAccessToken(null); return false; }
    setAccessToken((await response.json()).accessToken);
    return true;
  })();
  try { return await refreshInFlight; } finally { refreshInFlight = null; }
}

async function request<T>(path, options = {}): Promise<T> {
  const response = await fetch(`${clientConfig.apiUrl}/api/v1${path}`, {
    method: options.method ?? 'GET', credentials: 'include', headers: buildHeaders(),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (response.status === 401 && !options.skipAuthRefresh && path !== '/auth/refresh') {
    if (await refreshAccessToken()) {
      return request<T>(path, { ...options, skipAuthRefresh: true });  // retry once
    }
  }
  if (!response.ok) throw await toApiError(response);
  return response.status === 204 ? (undefined as T) : (await response.json()) as T;
}
```

The **access token is kept in memory** (not `localStorage`), and the refresh token
is an httpOnly cookie — the recommended posture against XSS token theft.

### 7.3 Auth as an explicit state machine

Zustand models auth as `loading | authenticated | unauthenticated` — no ambiguous
"maybe logged in" state:

```ts
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  setSession: (user, accessToken) => { setAccessToken(accessToken); set({ status: 'authenticated', user }); },
  clear: () => { setAccessToken(null); set({ status: 'unauthenticated', user: null }); },
}));
```

On mount, `useInitAuth` restores the session by attempting a cookie-based refresh +
`/me`. All auth actions (login, register, verify, reset, logout) are **TanStack
Query mutations** wrapped in typed hooks, so components stay declarative.

### 7.4 Server-state hooks

F1 data is consumed through typed query hooks with query-key factories and
volatility-tuned `staleTime`. The hooks also encode real domain logic — e.g.
`useLatestRace` finds the most recently completed Grand Prix and rolls back to the
previous season if the new one hasn't started yet; `useCurrentWeekend` rolls the
dashboard over to next season once the current one has no sessions left:

```ts
export function useReplay(season, round, session, options = {}): UseQueryResult<ReplaySession> {
  return useQuery({
    queryKey: f1Keys.replay(season, round, session),
    queryFn: () => f1Service.getReplay(season, round, session),
    staleTime: ONE_DAY_MS,
    retry: 1,
    enabled: options.enabled ?? true,
  });
}
```

All API responses are validated with **Zod** before use — the client trusts nothing
it receives over the wire.

### 7.5 The 3D race visualization (React Three Fiber)

The `RaceView` lazy-loads the WebGL scene (`ssr: false`, with a spinner fallback),
fetches the replay for the resolved race, and overlays UI (driver list, telemetry,
race-control feed, flags, start lights, camera controls, fullscreen):

```tsx
const RaceScene = dynamic(() => import('./RaceScene').then(m => m.RaceScene), {
  ssr: false,
  loading: () => <Spinner size="lg" />,
});
```

The animation is driven by a **`RaceSource` abstraction** with two implementations —
a `ReplaySource` (real FastF1 telemetry) and a mock engine — so the scene code is
agnostic to where positions come from. `ReplaySource` interpolates each car's pose
between samples on a shared clock:

```ts
pose(driverId: string): DriverPose | null {
  const car = this.byId.get(driverId);
  const { a, b, frac } = this.locate(car);   // find bracketing samples + fraction
  return {
    x: ax + (bx - ax) * frac,
    y: aElev + (bElev - aElev) * frac,        // real circuit elevation
    z: ay + (by - ay) * frac,
    headingY: Math.atan2(bx - ax, by - ay),   // face direction of travel
    onTrack: (a?.[ON_TRACK] ?? 1) > 0.5,
  };
}
```

The `CarsLayer` reads poses every frame via `useFrame` and moves each car with
**smoothing** — snapping only on large jumps (initial placement, loop wrap) and
otherwise easing position (`lerp`) and heading (`lerpAngle`) for fluid motion.
Off-track cars get a glowing marker ring; the selected car shows a floating label:

```tsx
useFrame(() => {
  source.drivers.forEach((driver, index) => {
    const pose = source.pose(driver.id);
    target.set(pose.x, pose.y + CAR_LIFT, pose.z);
    if (group.position.distanceTo(target) > SNAP_DISTANCE) {
      group.position.copy(target);                     // snap on wrap / first frame
      group.rotation.y = pose.headingY;
    } else {
      group.position.lerp(target, POSITION_LERP);      // ease for smooth motion
      group.rotation.y = lerpAngle(group.rotation.y, pose.headingY, ROTATION_LERP);
    }
    offMarkers.current[index].visible = !pose.onTrack;
  });
});
```

The scene includes cinematic and free-orbit cameras, start lights, a start-grid, a
proper asphalt track ribbon with real elevation, and team-colored car models.

### 7.6 The Learning Center

A structured, content-driven education system. Topics (rulebook, aerodynamics,
tyres, power unit, flags, penalties) are defined as **typed data** (`LearnTopic →
LearnChapter → ContentBlock[]`), where content blocks are a **discriminated union**
(`paragraph | subheading | callout | list | steps | terms | table`). Reading time
is estimated by counting words per block, and an exhaustiveness check (`assertNever`)
guarantees every block type is handled:

```ts
function countBlockWords(block: ContentBlock): number {
  switch (block.type) {
    case 'paragraph':
    case 'subheading': return block.text.split(/\s+/).length;
    case 'list':       return block.items.reduce((s, i) => s + i.split(/\s+/).length, 0);
    // …table / terms / steps / callout…
    default: return assertNever(block);   // compile error if a case is added and missed
  }
}
```

The catalog is rendered through dynamic routes: `/learn`, `/learn/[slug]`,
`/learn/[slug]/[chapter]`, with chapter navigation, pager, and takeaways.

### 7.7 Design system

Tailwind CSS v4 with **CSS-variable design tokens** (semantic colors, spacing, type
scale). A dark "esports" aesthetic with a blue accent, typed UI primitives
(`Button`, `Input`, `Card`, `Heading`, `Text`, `Spinner`, …), and a `cn()` helper
(clsx + tailwind-merge). Fonts: Bebas Neue (display headings) + Inter (body).

---

## 8. Cross-Cutting Concerns

### 8.1 Security model (summary)

| Concern | Approach |
| --- | --- |
| Password storage | argon2id hashing |
| Access tokens | 15-min JWTs, in-memory on the client |
| Refresh tokens | 30-day opaque, hashed in DB, httpOnly/Secure/SameSite cookie, rotated with reuse detection |
| Transport | HTTPS, Helmet security headers, explicit CORS allow-list |
| Input | class-validator DTOs (backend), Zod (all boundaries) |
| Rate limiting | `@nestjs/throttler` on auth endpoints (5/min) |
| Secrets | validated env only; never committed; `NEXT_PUBLIC_` boundary on the client |
| Internal service | private DataService behind `X-Internal-Key` |
| Errors | generic client responses + `traceId`; internals logged, never leaked |
| Enumeration | forgot-password / resend always succeed |

### 8.2 Data flow: watching a race replay

```
1. Browser opens /race
2. useLatestRace() → GET /api/v1/f1/seasons/{y}/schedule  (find last completed GP)
3. useReplay() → GET /api/v1/f1/seasons/{y}/rounds/{r}/sessions/R/replay
4. Backend: Redis miss → DataService GET .../replay  (X-Internal-Key)
5. DataService: FastF1 load → clean track + build time-aligned replay + ranks + flags
6. Backend: Zod-validate → cache in Redis (v9, 7d) → return
7. Frontend: Zod-validate → ReplaySource → React Three Fiber animates at 60fps
8. Repeat visits: served instantly from Redis / Postgres
```

---

## 9. Deployment (Railway)

Two isolated environments (**staging** + **production**) under one Railway project,
each running the same three services plus managed Postgres, Redis, and a storage
volume.

- Each service's **Root Directory** points to its folder; Railway reads that
  folder's `railway.json` and auto-detects the stack via **Nixpacks**.
- Environment variables are set **per environment** in the dashboard and injected
  directly into the process (so deploy commands avoid `dotenv-cli`).
- Service references like `${{Postgres.DATABASE_URL}}` and `${{Redis.REDIS_URL}}`
  wire the data stores.
- The backend's start command runs **`prisma migrate deploy`** before booting, so
  migrations apply automatically on each release.
- `NEXT_PUBLIC_*` values are **inlined at build time**, so the frontend is built in
  the target environment.

**Promotion flow:** feature branch → PR (CI: typecheck + tests + build for all three
services) → merge to `main` → staging redeploys → verify → **promote the same build
to production**. Roll back instantly by redeploying the previous deployment.

---

## 10. Engineering Standards

The repository enforces a comprehensive, self-imposed ruleset (in `.claude/rules/`)
that governs every layer. Highlights that show up throughout the code:

- **No `any`** — everything explicitly typed; `unknown` + validation at boundaries.
- **Explicit return types** on every function.
- **Single responsibility**, small functions, shallow nesting, guard clauses.
- **Feature-oriented modules**; dependencies point inward (Clean Architecture).
- **SOLID** — especially Dependency Inversion (services depend on interfaces like
  `CacheService`, injected via DI).
- **Discriminated unions** to make illegal states unrepresentable (auth state,
  content blocks, request state).
- **Structured logging**, typed exceptions, no silent catches.
- **Conventional Commits** and a squash-merge git workflow.

---

## 11. Notable Technical Challenges & Solutions (good seminar talking points)

1. **Turning noisy telemetry into smooth geometry.** Raw GPS is uneven and jittery;
   the solution is arc-length resampling + seam-aware circular smoothing, preserving
   real elevation. (§6.2)

2. **Computing the *real* running order.** Raw position is ambiguous near the
   start/finish line; projecting onto track arc-length and accumulating laps yields a
   monotonic progress metric that gives correct positions and gaps. (§6.3)

3. **Shielding a rate-limited upstream.** A three-tier cache (Redis → Postgres →
   FastF1) makes repeat loads instant and builds a permanent archive, with
   version-keyed caches for derived geometry. (§5.4)

4. **Secure sessions without a third party.** Rotating hashed refresh tokens with
   reuse detection + in-memory access tokens + httpOnly cookies is a textbook
   self-hosted auth design. (§5.3)

5. **Seamless token refresh in the browser.** Single-flight refresh-and-retry means
   an expired token is invisible to the user and never triggers a refresh stampede.
   (§7.2)

6. **60 fps 3D from ~300 samples per driver.** Client-side interpolation between
   sparse samples + snap/ease smoothing keeps the payload tiny while the motion looks
   continuous. (§7.5)

7. **Polyglot boundaries done safely.** TypeScript ↔ Python communicate over a
   private, key-authenticated HTTP boundary, and *both sides validate* — the backend
   Zod-parses the Python response, the frontend Zod-parses the backend response.

---

## 12. Conclusion

Formula Stats is a compact but complete demonstration of a modern, production-shaped
web system: a typed React/Next.js frontend, a layered NestJS API with real
authentication and caching, and a Python data-engineering microservice that performs
genuine signal processing on Formula 1 telemetry. Its architecture emphasizes clear
trust boundaries, validation everywhere, dependency inversion, and a strict
separation between rendering, business logic, and data access — while delivering a
visually rich, interactive 3D experience built on real racing data.
```

