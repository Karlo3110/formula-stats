# Payment Architecture

## Purpose
Define how money moves through the system safely. Payments are the highest-stakes,
least-forgiving subsystem: errors mean lost money, double charges, or fraud. The
architecture is **server-authoritative, idempotent, webhook-driven, auditable, and
reconciled.** See `rules/integrations/stripe.md` for provider specifics.

## Non-Negotiable Principles
1. **The server is authoritative for money.** Amounts, prices, currencies, and
   entitlements are computed from your database / provider Prices — **never** taken from
   the client.
2. **Idempotency everywhere.** Every charge/create uses an idempotency key; every webhook
   handler dedupes by event id. Retries must never double-charge or double-grant.
3. **The provider webhook is the source of truth for payment state**, not the client
   redirect. Grant access only after the verified webhook confirms payment.
4. **Atomic record + grant.** "Record the payment" and "grant the entitlement" happen in
   one transaction (or via a transactional outbox), so they can't diverge.
5. **Everything is audited.** Every money event is recorded immutably (who/what/when/
   amount/result).

## Flow (Checkout)
```
Client                 Backend                     Provider (Stripe)
  │  start checkout ─────▶ create PaymentIntent ──────▶  (amount from DB, idempotency key)
  │  ◀── client secret ───┤
  │  confirm payment ───────────────────────────────▶  charge
  │                       ◀── webhook: succeeded ──────┤   (verify signature, raw body)
  │                       ├─ tx: record payment + grant entitlement (idempotent)
  │                       ├─ audit event
  │  ◀── access granted ──┘   (reflected after webhook, not before)
```

## Components & Boundaries
- **Payment service** — orchestrates intents/charges via a provider wrapper; computes
  amounts from the domain; never trusts input.
- **Provider wrapper** — the only code touching the Stripe SDK (pinned API version,
  idempotency keys, retries/timeouts).
- **Webhook handler** — verifies signature against the raw body, dedupes, enqueues/applies
  state changes idempotently and order-tolerantly (`rules/integrations/webhooks.md`).
- **Local ledger** — mirrors customers, payments, subscriptions, and a transaction log in
  your DB. The app reads entitlements from here, not by calling Stripe on every request.
- **Reconciliation job** — periodically compares local state to the provider to catch
  missed/out-of-order events.

## Consistency & Reliability
- Treat webhook delivery as at-least-once and possibly out of order
  (`event-architecture.md`). Handlers are idempotent and compare event timestamps.
- Use a transactional outbox if downstream effects (provisioning, email) must follow a
  payment reliably.
- Reconcile on a schedule; never assume you received every event.

## Security & Compliance
- Secret + webhook signing keys in the secret manager; only the publishable key is
  client-side. Verify signatures; rate-limit payment endpoints.
- **Never store raw card data / PAN.** Use Checkout/Elements/Customer Portal to keep PCI
  scope minimal. Audit every money event. See `rules/05-security.md`, `rules/integrations/stripe.md`.

## Subscriptions & Lifecycle
- Drive entitlement state from subscription webhooks
  (`customer.subscription.created/updated/deleted`, `invoice.paid`, `...payment_failed`).
- Handle dunning (failed payments, retries, grace periods), upgrades/downgrades
  (proration), cancellations, refunds, and disputes/chargebacks explicitly — each changes
  entitlement and must be auditable.

## Anti-Patterns
- ❌ Trusting client-supplied amounts/prices/entitlements.
- ❌ Granting access on the client redirect instead of the verified webhook.
- ❌ Charging without an idempotency key; non-idempotent webhook handlers.
- ❌ "Charge then grant" as two unprotected steps (no transaction/outbox).
- ❌ Storing card data; secret keys in the frontend.
- ❌ No reconciliation — assuming every webhook arrived, once, in order.

## Testing
- Provider test mode + CLI replay; assert idempotency (same event twice → one effect),
  declines, refunds, disputes, and subscription transitions. Never touch live mode in
  tests. See `rules/integrations/stripe.md` §7 and `playbooks/stripe-integration.md`.

## Related
`rules/integrations/stripe.md`, `event-architecture.md`, `rules/05-security.md`,
`playbooks/stripe-integration.md`.
