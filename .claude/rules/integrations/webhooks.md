# Webhook Standards (Inbound & Outbound)

## 1. Overview
Webhooks are untrusted, at-least-once, possibly-out-of-order HTTP calls. Every inbound
webhook must be **verified, idempotent, fast-acknowledged, and processed out-of-band**.
Outbound webhooks we send must be **signed, retried, and observable**.

---

## 2. Inbound — Approved Patterns
- **Verify authenticity first.** Check the provider's signature using the **raw request
  body** and the signing secret before doing anything else. Reject unverified calls with
  `400/401`.
  ```typescript
  const event = provider.verify(rawBody, signature, signingSecret); // throws on mismatch
  ```
- **Preserve the raw body.** Configure the framework to expose the unparsed body for the
  webhook route (signatures are computed over exact bytes). A re-serialized JSON body will
  fail verification.
- **Idempotency.** Store each processed event id; if seen, ack and no-op. Handlers must be
  safe to run twice.
- **Order tolerance.** Don't assume delivery order; compare event timestamps/versions and
  ignore stale updates.
- **Acknowledge fast, process async.** Validate + enqueue, return `2xx` quickly; do the
  real work in a background job (`playbooks/background-job.md`). Slow handlers cause
  provider retries and duplicate processing.
- **Validate the payload** shape with Zod after verifying the signature.

## 3. Inbound — Forbidden Patterns
- ❌ Processing a webhook without signature verification.
- ❌ Verifying against a parsed/re-serialized body instead of the raw bytes.
- ❌ Assuming exactly-once or in-order delivery.
- ❌ Doing heavy work synchronously before acking (causes retries/timeouts).
- ❌ Trusting payload contents without validation, or acting on amounts/entitlements from
  the payload without cross-checking your own records (esp. payments — `rules/integrations/stripe.md`).
- ❌ Returning `5xx` for a *business* rejection you don't want retried (use `2xx` + log).

## 4. Outbound — Approved Patterns
- **Sign** every outbound webhook (HMAC over the body + timestamp); publish the scheme so
  receivers can verify. Include a timestamp to prevent replay.
- **Retry with backoff** on non-`2xx`/timeout, capped, then **dead-letter** for inspection.
- **At-least-once + idempotency**: include a stable `event_id` so receivers can dedupe.
- **Timeouts** per attempt; never block app flow on delivery (queue it).
- **Observability**: record attempts, responses, and final status; expose redelivery.

## 5. Security Requirements
- Signing secrets in the secret manager; rotate on exposure. Constant-time signature
  comparison.
- Reject stale timestamps (replay protection). Rate-limit/allow-list where applicable.
- Never log full payloads containing secrets/PII (`rules/05-security.md`).
- Outbound: avoid SSRF — receivers' URLs validated/allow-listed; no internal addresses.

## 6. Reliability
- Treat your handler as the idempotent reconciler of provider state, not a one-shot
  trigger. Add a periodic reconciliation job to catch missed events.

## 7. Testing Requirements
- Unit-test: valid signature accepted; tampered/invalid rejected; duplicate event id =
  single effect; out-of-order update ignored. Replay real fixtures (provider CLIs).
- Never disable verification "for tests" — feed correctly-signed fixtures.

## 8. Example — Inbound Handler Shape
```typescript
@Post('webhooks/provider')
@HttpCode(200)
async handle(@Req() req: RawBodyRequest<Request>, @Headers('x-signature') sig: string): Promise<{ received: true }> {
  const event = this.provider.verify(req.rawBody, sig, this.secret);   // 1. authenticate (raw body)
  const payload = EventSchema.parse(event);                            // 2. validate shape
  if (await this.processed.has(payload.id)) return { received: true }; // 3. idempotency
  await this.queue.enqueue('provider.event', payload);                 // 4. ack fast, process async
  return { received: true };
}
```

## 9. Review Checklist
- [ ] Inbound: signature verified against the raw body before processing.
- [ ] Idempotent (event id stored); order-tolerant.
- [ ] Acks fast; heavy work offloaded to a job.
- [ ] Payload validated; business rejections return `2xx`, not `5xx`.
- [ ] Outbound: signed + timestamped, retried with backoff, dead-lettered, deduped.
- [ ] Secrets in secret manager; replay protection; no PII in logs; tests cover tamper +
      duplicate + out-of-order.
