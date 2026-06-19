# Playbook: Stripe / Payment Integration

> Money work. Server-authoritative, idempotent, webhook-driven, audited, reconciled.
> Read `architecture/payment-architecture.md` and `rules/integrations/stripe.md` first.

## 1. Plan
- [ ] Define the flow: one-time payment, subscription, or usage-based. Map the full
      lifecycle including failures, refunds, disputes, and cancellations.
- [ ] Decide the source of amounts/prices: your DB or Stripe Prices — **never the client**.
- [ ] Design the **local ledger**: which Stripe objects you mirror (customer, payment,
      subscription, transaction log) and how entitlements are derived from it.
- [ ] List the webhook events you must handle and the idempotency strategy.
- [ ] Plan the reconciliation job.

## 2. Implement
- [ ] **Provider wrapper service** — the only code touching the Stripe SDK. Pin the API
      version; set timeouts; pass an **idempotency key** on every create/charge.
- [ ] Compute amounts **server-side** from the domain.
- [ ] **Checkout/Elements/Portal** to keep card data out of your systems (PCI scope).
- [ ] **Webhook handler**: verify signature against the **raw body**, dedupe by
      `event.id`, ack fast, process the state change idempotently and order-tolerantly
      (`rules/integrations/webhooks.md`).
- [ ] **Atomic record + grant**: persist the payment and grant entitlement in one
      transaction (or via the outbox — `architecture/event-architecture.md`).
- [ ] **Audit** every money event (`rules/05-security.md` §11).
- [ ] **Reconciliation job** comparing local state to Stripe on a schedule.
- [ ] Secrets (secret key, webhook signing secret) in the secret manager; only the
      publishable key client-side. Rate-limit payment endpoints.

## 3. Test
- [ ] Stripe **test mode** + CLI to replay events locally.
- [ ] Assert **idempotency**: the same webhook twice → exactly one effect.
- [ ] Cover declines, failed payments/dunning, refunds, disputes/chargebacks, subscription
      create/update/cancel, and out-of-order events.
- [ ] Never touch live mode in tests (`rules/integrations/stripe.md` §7).

## 4. Document
- [ ] Document the event→state mapping, the ledger model, and the reconciliation process.
- [ ] Runbook entries for common payment incidents.

## 5. Deploy
- [ ] Register the production webhook endpoint + signing secret. Configure products/prices.
- [ ] Standard pipeline; secrets injected at deploy; backward-compatible.

## 6. Verify
- [ ] Run an end-to-end test transaction in production (small, real or test-clock).
- [ ] Confirm: payment recorded, entitlement granted, audit logged, webhook acked,
      reconciliation reports consistent.
- [ ] Monitor payment success rate, webhook failures, and dispute metrics
      (`rules/observability/monitoring-metrics.md`).

## Definition of Done
Amounts server-side · idempotent charges + webhooks · entitlement granted on verified
webhook in a transaction · local ledger + reconciliation · card data never stored · audited
· test-mode coverage incl. failure paths · verified in prod.

## Red Lines (Never Ship Without)
Signature verification on raw body · idempotency keys · grant-on-webhook (not on redirect)
· secrets server-side only · audit trail.
