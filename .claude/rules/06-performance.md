# Performance Rules

> Performance is a feature, but **premature optimization is a defect**. Measure first,
> optimize the proven bottleneck, and never trade readability for speed you don't need.
> The rules below are the ones that are *always* worth following because they prevent
> whole classes of slowness by design.

---

## 1. The Discipline

1. Define the budget (e.g., p95 API < 200 ms, LCP < 2.5 s, query < 50 ms).
2. Measure against it (profiler, traces, `EXPLAIN ANALYZE`, Lighthouse).
3. Optimize the **measured** bottleneck only.
4. Re-measure to confirm the win and guard against regressions.

Do not optimize on intuition. Do not micro-optimize hot-looking code that runs once.

---

## 2. Backend — Data Access

### No N+1 queries
```typescript
// ❌ FORBIDDEN — one query per row
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { authorId: user.id } });
}

// ✅ REQUIRED — single query with the relation
const users = await prisma.user.findMany({ include: { posts: true } });
```

### Always paginate; never unbounded
```typescript
// ❌ FORBIDDEN
const all = await prisma.user.findMany();

// ✅ REQUIRED — bounded, cursor-based for large/infinite lists
const page = await prisma.user.findMany({
  take: limit + 1,                       // fetch one extra to compute hasMore
  cursor: lastId ? { id: lastId } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

### Select only what you need
```typescript
// ✅ REQUIRED — projection avoids hauling unused columns/blobs
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true },
});
```

### Index frequent query paths
Add indexes for columns used in `WHERE`, `ORDER BY`, `JOIN`, and uniqueness. See
`rules/data/postgresql.md`.
```prisma
@@index([email])
@@index([status, createdAt])
```

### Batch instead of looping IO
Use `createMany`, `IN (...)`, `DataLoader`, or bulk endpoints rather than per-item
round trips.

---

## 3. Backend — Compute & IO

- **Never block the event loop.** Offload CPU-heavy work (image/PDF processing, crypto,
  large transforms) to a worker thread, queue, or background job. See
  `architecture/event-architecture.md` and `playbooks/background-job.md`.
- **Parallelize independent IO** with `Promise.all` — but bound concurrency for large
  fan-outs (`p-limit`) so you don't exhaust connections.
- **Stream** large payloads/files instead of buffering them entirely in memory.
- **Set timeouts** on every outbound call; a slow dependency must not pin your workers.

---

## 4. Caching

Cache deliberately, with a TTL and an invalidation story. A cache without invalidation
is a bug generator.

```typescript
// ✅ REQUIRED — TTL + centralized cache service (see rules/data/redis.md)
const cached = await cache.get<User>(`user:${id}`);
if (cached) return cached;
const user = await this.repo.findById(id);
if (user) await cache.set(`user:${id}`, user, 3600); // 1h TTL
return user;
```

- Choose the layer: HTTP/CDN cache → application cache (Redis) → memoization. Cache as
  close to the consumer as correctness allows.
- Pick an invalidation strategy up front: TTL expiry, write-through, or explicit
  invalidate-on-mutate. Document it next to the cache.
- Never cache per-user/private data in a shared/public cache.

---

## 5. Frontend — Rendering

- **Server Components by default**; opt into client components only for interactivity.
  See `rules/frontend/nextjs.md`.
- Avoid unnecessary re-renders:
  ```tsx
  const ExpensiveList = React.memo(function ExpensiveList({ items }: Props) {
    return items.map((item) => <Row key={item.id} {...item} />);
  });

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  );
  const handleSelect = useCallback((id: string) => onSelect(id), [onSelect]);
  ```
  Apply `memo`/`useMemo`/`useCallback` to **measured** hot paths, not reflexively — they
  have their own cost and can hurt clarity.
- **Stable keys** in lists (never the array index for dynamic lists).
- **Lazy-load** heavy, below-the-fold, or rarely-used components:
  ```tsx
  const HeavyChart = dynamic(() => import('@/components/HeavyChart'), { loading: () => <Skeleton /> });
  ```

---

## 6. Frontend — Network & Assets

- Use TanStack Query for server state: dedupe, cache, and background-refetch instead of
  hand-rolled fetches. See `rules/frontend/tanstack-query.md`.
- Optimize images (`next/image`), fonts (`next/font`), and code-split by route.
- Avoid waterfalls — fetch in parallel; prefetch predictable next navigations.
- Keep client bundles lean: tree-shake, avoid heavy libs for small jobs, watch bundle
  size in CI.

---

## 7. Memory & Allocations

- Don't build huge intermediate arrays you immediately reduce — iterate or stream.
- Release references (listeners, subscriptions, timers) on teardown to avoid leaks
  (`useEffect` cleanup, `OnModuleDestroy`).
- Reuse connections via pools; never open a connection per request. See `rules/data/`.

---

## 8. What NOT To Do

- ❌ Optimize before measuring.
- ❌ Cache without a TTL or invalidation plan.
- ❌ Sacrifice readability for a micro-optimization with no measured impact.
- ❌ Add an index for every column "just in case" — indexes cost writes and storage.
- ❌ Introduce concurrency without bounding it.

---

## 9. Monitoring (Close The Loop)

Performance work isn't done until it's observable. Track latency (p50/p95/p99),
throughput, error rate, query time, cache hit ratio, and Core Web Vitals. Alert on
budget breaches. See `rules/observability/monitoring-metrics.md`.
