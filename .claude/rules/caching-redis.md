# Caching (Redis)

Redis is the caching and ephemeral-state layer. Access it only through a `CacheService`
abstraction (Dependency Inversion — `core/06-solid.md`). Business code never imports the
Redis client directly.

## What Redis is used for

- **Read-through cache** for expensive or hot read queries (GraphQL resolvers, REST reads).
- **Rate limiting** counters (auth endpoints, expensive operations).
- **Session/refresh-token support** (e.g. denylist of revoked tokens, lookup of active
  sessions) — the source of truth for refresh tokens remains the database.
- **WebSocket adapter / pub-sub** for multi-instance broadcasts.
- **Short-lived ephemeral state** (email verification codes, password-reset tokens with TTL).

Redis is a cache, not a database. Never store data in Redis that cannot be rebuilt from the
primary store (PostgreSQL).

## The CacheService abstraction

```ts
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
  deleteByPrefix(prefix: string): Promise<void>;
}
```

A `RedisCacheService` implements it and is injected where caching is needed. Tests inject an
in-memory fake.

## Key naming (deterministic)

`<domain>:<entity>:<identifier>[:<variant>]`

```
user:profile:018f-...            // a user's profile
user:permissions:018f-...        // resolved permissions
post:list:page=1:size=20         // a paginated list view
ratelimit:login:<ip>             // rate-limit counter
```

- Colon-separated, lowercase, predictable. No spaces.
- Encode query variants (filters, pagination) into the key so different shapes do not collide.

## TTL rules

- **Every cached value has an explicit TTL.** No unbounded keys.
- Choose TTL by volatility: rarely-changing reference data minutes–hours; user-specific
  hot data seconds–minutes; rate-limit windows match the policy.
- Prefer short TTLs plus explicit invalidation over long TTLs.

## Invalidation (the hard part — make it explicit)

- A mutation that changes an entity **must** invalidate every cache key derived from it.
- Co-locate invalidation with the write in the service so it cannot be forgotten:

```ts
async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserResponse> {
  const updated = await this.users.updateProfile(userId, input);
  await this.cache.delete(`user:profile:${userId}`);
  await this.cache.deleteByPrefix(`post:list`); // any list that may include this user
  return toUserResponse(updated);
}
```

- Prefer deleting (cache-aside invalidation) over trying to update cached values in place.
- For list/collection caches, use a key prefix so all variants can be cleared together.

## Read-through pattern

```ts
async getProfile(userId: string): Promise<UserResponse> {
  const key = `user:profile:${userId}`;
  const cached = await this.cache.get<UserResponse>(key);
  if (cached) {
    return cached;
  }
  const profile = toUserResponse(await this.users.findByIdOrThrow(userId));
  await this.cache.set(key, profile, 300);
  return profile;
}
```

## Rules

- Never cache responses that vary by permission without including the principal in the key.
  A cached value must never be served to a user not entitled to it.
- Never cache sensitive raw data (tokens, password hashes).
- Cache stores DTOs (client-facing shapes), not entities.
- A cache outage must degrade gracefully: on a Redis error, fall back to the primary store,
  log the error, and continue. Caching failures never take down a request.
- Connection config (host, TLS, credentials) comes from validated env
  (`core/04-env-and-config.md`).

## .NET parity

Use `IDistributedCache` or a thin `ICacheService` wrapper over StackExchange.Redis with the
same key naming, TTL, and invalidation rules. Business logic depends on the interface.
