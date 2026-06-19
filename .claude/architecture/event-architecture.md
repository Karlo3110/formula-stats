# Event & Async Architecture

## Purpose
Define how we do asynchronous, decoupled work — background jobs, domain events, and
message queues — so slow/unreliable work doesn't block requests and services stay loosely
coupled. The core guarantee we design for: **at-least-once delivery → therefore idempotent
consumers**.

## When To Go Async
Move work off the request path when it is: slow (email, PDF, image processing), external
and fallible (third-party APIs), retriable, schedulable (cron), or a side effect other
parts of the system care about (domain events). Keep it synchronous when the caller needs
the result now and it's fast/reliable.

## Building Blocks
- **Background jobs / queues** (BullMQ/Redis, SQS, Vercel Queues): producer enqueues, a
  worker consumes. Decouples the trigger from the work. See `playbooks/background-job.md`.
- **Domain events**: a record that something happened (`InvoicePaid`), published after the
  state change commits, consumed by interested handlers.
- **Scheduled jobs (cron)**: periodic work (cleanup, reconciliation, digests).
- **Pub/sub**: fan-out one event to many independent consumers.

## Core Guarantees & How We Handle Them
- **At-least-once delivery** → consumers MUST be **idempotent** (dedupe by a stable event/
  job id; running twice = one effect). This is the single most important rule here.
- **Out-of-order delivery** → handlers tolerate it (compare timestamps/versions; ignore
  stale).
- **Failure** → bounded retries with exponential backoff + jitter; persistent failures go
  to a **dead-letter queue** for inspection, never silently dropped
  (`rules/08-error-handling.md`).
- **Poison messages** → cap attempts; DLQ + alert.

## The Transactional Outbox (Don't Lose Events)
Never do "commit DB change" and "publish event" as two independent steps — a crash between
them loses the event or fires it without the change. Instead:
1. In the **same DB transaction** as the state change, insert the event into an `outbox`
   table.
2. A relay/poller publishes outbox rows to the queue and marks them sent (at-least-once).
3. Consumers dedupe by event id.

This makes the state change and the intent-to-publish atomic.

## Boundaries & Dependency Rules
- Producers depend on a queue/event-bus **interface**, not a concrete broker.
- Consumers are independent: a slow/failing consumer must not affect the producer or other
  consumers. No shared mutable state between handlers.
- Event payloads are **versioned, explicit contracts** (carry enough data to process, or an
  id to fetch current state). Treat them like API contracts.
- Propagate trace context through the queue so async work is traceable end to end
  (`rules/observability/monitoring-metrics.md`).

## Worker Design
- Workers are stateless, horizontally scalable, and bound their concurrency
  (`rules/06-performance.md`).
- Set per-job timeouts; handle graceful shutdown (finish/requeue in-flight on `SIGTERM`).
- Validate the job/event payload (Zod) before processing — it's untrusted input.

## Observability
- Emit queue depth, processing latency, success/failure/retry counts, and DLQ size as
  metrics; alert on backlog growth and DLQ entries
  (`rules/observability/monitoring-metrics.md`).

## Anti-Patterns
- ❌ Non-idempotent consumers under at-least-once delivery.
- ❌ Publishing an event outside the DB transaction that produced its state (lost/ghost
  events) — use the outbox.
- ❌ Doing heavy work synchronously in a request/webhook handler.
- ❌ Unbounded retries; dropping failures silently (no DLQ).
- ❌ Sharing mutable state between consumers; assuming ordering.
- ❌ Fat, unversioned event payloads coupling producer and consumer.

## Example — Outbox + Idempotent Consumer
```typescript
// producer: state change + event recorded atomically
await prisma.$transaction(async (tx) => {
  await tx.invoice.update({ where: { id }, data: { status: 'PAID' } });
  await tx.outbox.create({ data: { id: eventId, type: 'invoice.paid', payload } });
});

// consumer: idempotent
async function onInvoicePaid(event: InvoicePaidEvent): Promise<void> {
  if (await processed.has(event.id)) return;      // dedupe
  await grantEntitlements(event.payload);
  await processed.add(event.id);
}
```

## Related
`backend-architecture.md`, `database-architecture.md`, `playbooks/background-job.md`,
`rules/integrations/webhooks.md`, `rules/integrations/stripe.md`.
