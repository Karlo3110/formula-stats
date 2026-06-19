# Redis Standards

## 1. Overview
Redis is a **cache and ephemeral data store** — never the primary system of record.
Anything in Redis must be reconstructable from PostgreSQL or recomputable. Use cases:
caching, rate limiting, session/token storage, queues/pub-sub, distributed locks.

## 2. Version Requirements
- Redis **7+**. A single pooled client instance, injected via DI. Access only through a
  centralized cache/service wrapper — never scattered raw calls.

## 3. Approved Patterns
- **Everything has a TTL.** A cache entry without an expiry is a memory leak and a
  staleness bug.
  ```typescript
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user)); // 1h
  ```
- **Centralized, typed cache service** (one place owns serialization + TTL + key scheme):
  ```typescript
  @Injectable()
  export class CacheService {
    constructor(private readonly redis: Redis) {}
    async get<T>(key: string): Promise<T | null> {
      const raw = await this.redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }
    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    }
    async invalidate(key: string): Promise<void> { await this.redis.del(key); }
  }
  ```
- **Consistent key namespacing**: `entity:id[:sub]` (`user:123`, `invoice:42:lines`).
  Document the scheme; keep it greppable.
- **Cache-aside** read pattern: check cache → on miss, load from DB → populate with TTL.
- **Invalidate on write**: when the source record changes, delete/refresh its keys.
- **Atomic ops** for counters/locks (`INCR`, `SET NX PX`); Lua scripts for multi-step
  atomicity.

## 4. Forbidden Patterns
- ❌ Redis as the only store for important data (no DB backing).
- ❌ Keys without TTL (except deliberately-persistent structures, documented).
- ❌ Scattered `redis.get/set` calls across services — go through the cache service.
- ❌ `KEYS *` in production (blocking) — use `SCAN`, or better, targeted invalidation.
- ❌ Caching per-user/private data under a shared key.
- ❌ Storing secrets/PII unencrypted; persisting sensitive tokens without expiry.
- ❌ Giant values (multi-MB blobs) — Redis is for small, hot data.

## 5. Security Requirements
- AUTH + TLS enabled; credentials from the secret manager.
- Namespace and isolate per environment; never share a prod instance with non-prod.
- Don't store sensitive data unencrypted; set TTLs on anything sensitive (sessions).

## 6. Performance Requirements
- Pipeline batched commands; use `MGET`/`MSET` over loops.
- Prefer targeted key deletion over `SCAN`-and-delete sweeps; if you must scan, use
  `SCAN` with a cursor and bounded `COUNT`.
- Choose eviction policy intentionally (`allkeys-lru` for a pure cache). Monitor hit
  ratio and memory. See `rules/06-performance.md`.

## 7. Testing Requirements
- Test cache behavior against a real Redis (Testcontainers) or a faithful in-memory fake;
  cover hit, miss, expiry, and invalidation paths.

## 8. Example — Cache-Aside With Invalidation
```typescript
async getUser(id: string): Promise<User | null> {
  const key = `user:${id}`;
  const cached = await this.cache.get<User>(key);
  if (cached) return cached;
  const user = await this.userRepository.findById(id);
  if (user) await this.cache.set(key, user, 3600);
  return user;
}

async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
  const user = await this.userRepository.update(id, dto);
  await this.cache.invalidate(`user:${id}`); // keep cache honest
  return user;
}
```

## 9. Rate Limiting / Locks (Common Uses)
```typescript
// Fixed-window rate limit
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, windowSeconds);
if (count > limit) throw new TooManyRequestsException();

// Distributed lock (acquire)
const ok = await redis.set(lockKey, token, 'NX', 'PX', ttlMs); // release via Lua compare-and-del
```

## 10. Review Checklist
- [ ] Data is cache/ephemeral, with a DB source of truth.
- [ ] Every key has a TTL (or documented exception).
- [ ] Access via the centralized cache service; consistent key namespace.
- [ ] Writes invalidate affected keys.
- [ ] No `KEYS *`; no oversized values; no unencrypted secrets.
- [ ] Hit ratio / memory monitored.
