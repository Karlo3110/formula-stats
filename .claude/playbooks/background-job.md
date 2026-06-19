# Playbook: Background Job / Async Work

> Move slow, fallible, or scheduled work off the request path. Consumers are idempotent
> because delivery is at-least-once. Read `architecture/event-architecture.md` first.

## 1. Plan
- [ ] Confirm it belongs async: slow, external/fallible, retriable, schedulable, or a side
      effect (`architecture/event-architecture.md`: When To Go Async).
- [ ] Choose the mechanism: queue/worker (BullMQ/SQS/Vercel Queues), domain event, or cron.
- [ ] Define the **job payload contract** (versioned, validated) — carry enough data, or an
      id to fetch current state.
- [ ] Design for **idempotency** (stable job/event id → dedupe) and **order tolerance**.
- [ ] Decide retry policy, max attempts, and the **dead-letter** destination.

## 2. Implement
- [ ] **Producer** enqueues against a queue **interface**, not a concrete broker. If the job
      must follow a DB change reliably, use the **transactional outbox** (enqueue in the
      same transaction) — never commit-then-publish as two steps.
- [ ] **Consumer/worker**: validate the payload (Zod), **dedupe by id**, do the work
      idempotently, tolerate out-of-order delivery.
- [ ] Bounded **retries with backoff + jitter**; on exhaustion → DLQ + alert, never silent
      drop (`rules/08-error-handling.md`).
- [ ] Per-job **timeout**; graceful shutdown (finish/requeue in-flight on `SIGTERM`).
- [ ] Bound worker **concurrency** (`rules/06-performance.md`).
- [ ] Emit metrics: queue depth, processing latency, success/failure/retry, DLQ size.
      Propagate trace context (`rules/observability/monitoring-metrics.md`).

## 3. Test
- [ ] Unit-test the consumer: success, malformed payload, transient failure→retry,
      permanent failure→DLQ.
- [ ] Assert **idempotency** (same job twice → one effect) and order tolerance.
- [ ] Integration-test producer→queue→consumer against a real queue (Testcontainers).

## 4. Document
- [ ] Document the payload contract, retry/DLQ policy, idempotency key, and the
      reprocessing/DLQ-drain procedure (runbook).

## 5. Deploy
- [ ] Deploy worker as its own scalable process/deployment with health probes
      (`rules/infrastructure/kubernetes.md`). Configure the queue + DLQ.
- [ ] Backward-compatible payload changes (consumers handle old + new during rollout).

## 6. Verify
- [ ] Enqueue a real job in staging/prod; confirm it processes once, retries correctly, and
      DLQs on forced failure.
- [ ] Watch queue depth and latency; confirm no backlog growth and DLQ is empty/handled.

## Definition of Done
Async-appropriate · idempotent + order-tolerant consumer · outbox for DB-coupled events ·
bounded retries + DLQ · timeouts + graceful shutdown + bounded concurrency · observable ·
tested incl. failure paths · verified end-to-end.

## Anti-Patterns
❌ Non-idempotent consumer · ❌ publish outside the DB transaction (lost/ghost events) ·
❌ unbounded retries / silent drops · ❌ heavy work in the request handler · ❌ assuming order.
