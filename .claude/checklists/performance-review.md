# Performance Review Checklist

> Run for changes involving database queries, lists, hot paths, large payloads, or
> data-heavy UI. Backs `rules/06-performance.md`. Remember: measure before optimizing —
> but these items prevent whole classes of slowness by design.

## Database & Backend
- [ ] No N+1 queries — relations loaded in one query (`include`/projection).
- [ ] Every list endpoint is paginated (cursor/keyset for large sets); nothing unbounded.
- [ ] Only needed columns selected/projected; no hauling large blobs unnecessarily.
- [ ] Indexes exist for filtered/sorted/joined columns and FKs; query plan checked
      (`EXPLAIN ANALYZE`) for new hot queries.
- [ ] Multi-step writes are transactional; batched IO instead of per-item loops.
- [ ] Outbound calls have timeouts; independent IO parallelized with bounded concurrency.
- [ ] No CPU-heavy/blocking work on the request path (offloaded to a job/worker).

## Caching
- [ ] Cache entries have a TTL **and** an invalidation strategy.
- [ ] No per-user/private data cached under a shared key.
- [ ] Cache invalidated on the relevant writes.

## Frontend
- [ ] Server-first rendering; minimal client JS; `'use client'` only at leaves.
- [ ] Server state via TanStack Query (dedupe/cache), not hand-rolled `useEffect` fetches.
- [ ] No needless re-renders; memoization (`memo`/`useMemo`/`useCallback`) applied only to
      measured hot paths.
- [ ] Stable list keys; long lists virtualized.
- [ ] Heavy/below-the-fold components lazy-loaded; images via `next/image`; fonts via
      `next/font`.
- [ ] No request waterfalls; predictable navigations prefetched.
- [ ] Bundle size checked; no heavy lib pulled in for a small job.

## Budgets & Monitoring
- [ ] Meets the stated budget (e.g., API p95, query time, LCP/INP/CLS).
- [ ] The change is observable: latency/error/throughput (and cache hit ratio) tracked
      (`rules/observability/monitoring-metrics.md`).

## Discipline
- [ ] Any optimization beyond the above is backed by a **measurement**, not a hunch — and
      readability wasn't sacrificed for speed that isn't needed.
- [ ] No premature/micro-optimization; no "index every column just in case."

---
**Gate:** N+1, unbounded queries, blocking request-path work, and cache-without-
invalidation are blocking by default.
