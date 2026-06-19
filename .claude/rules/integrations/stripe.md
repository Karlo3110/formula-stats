# Stripe Integration Standards

## 1. Overview
Money is the highest-stakes part of the system. Stripe integrations are **server-side,
idempotent, webhook-driven, and never trust the client** for amounts or entitlements.
See `architecture/payment-architecture.md` for the full model.

## 2. Version Requirements
- Official Stripe SDK, pinned API version (set explicitly in client config so behavior
  doesn't shift under you). All calls server-side.

## 3. Approved Patterns
- **Server computes the amount.** Prices/amounts come from your database or Stripe Prices,
  never from the request body.
- **Idempotency keys** on every create/charge call so retries don't double-charge:
  ```typescript
  await stripe.paymentIntents.create(params, { idempotencyKey: `pi_${orderId}` });
  ```
- **Webhooks are the source of truth** for payment state. Verify the signature, then
  update your DB from the event — don't rely on the client redirect to confirm payment.
- **Verify webhook signatures** with the raw body and the signing secret
  (`rules/integrations/webhooks.md`):
  ```typescript
  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  ```
- **Process webhooks idempotently** — store processed `event.id`; ignore duplicates and
  out-of-order events (compare timestamps).
- **Persist a local ledger**: mirror Stripe customers, payments, subscriptions, and a
  transaction record in your DB; reconcile against Stripe.
- **Customer Portal / Checkout** for PCI scope reduction; never handle raw card data.
- Handle the full lifecycle: `payment_intent.succeeded`, `...payment_failed`,
  `invoice.paid`, `customer.subscription.updated/deleted`, disputes/refunds.

## 4. Forbidden Patterns
- ❌ Trusting client-supplied amounts, prices, or entitlements.
- ❌ Granting access on the client redirect instead of on the verified webhook.
- ❌ Charging without an idempotency key.
- ❌ Skipping webhook signature verification, or verifying against a parsed (non-raw) body.
- ❌ Storing raw card numbers / PAN anywhere.
- ❌ Secret keys in the frontend (only the publishable key is client-side).
- ❌ Non-atomic "charge then grant" without a transaction/outbox.

## 5. Security Requirements
- Secret key + webhook signing secret in the secret manager; rotate on exposure.
- Idempotent, signature-verified webhooks; rate-limit payment endpoints.
- Audit every money event (`rules/05-security.md` §11). Least-privilege restricted keys
  where possible.

## 6. Reliability
- Treat webhook delivery as at-least-once and possibly out of order — design idempotent,
  order-tolerant handlers.
- Reconcile periodically (scheduled job) against Stripe to catch missed events.
- Wrap "record payment + grant entitlement" in a DB transaction (or transactional outbox).

## 7. Testing Requirements
- Use Stripe test mode + the Stripe CLI to replay webhook events locally.
- Unit-test handlers with fixture events; assert idempotency (same event twice = one
  effect) and failure paths (declines, disputes). Never hit live mode in tests.

## 8. Example — Verified, Idempotent Webhook
```typescript
@Post('webhooks/stripe')
async handle(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string): Promise<{ received: true }> {
  const event = this.stripe.webhooks.constructEvent(req.rawBody, sig, this.webhookSecret);
  if (await this.events.alreadyProcessed(event.id)) return { received: true }; // idempotent
  await this.billing.applyEvent(event); // transactional update from event data
  await this.events.markProcessed(event.id);
  return { received: true };
}
```

## 9. Review Checklist
- [ ] Amounts computed server-side; client never trusted.
- [ ] Idempotency keys on creates/charges; handlers idempotent + order-tolerant.
- [ ] Webhook signature verified against the raw body.
- [ ] Entitlements granted on verified webhook, in a transaction.
- [ ] Local ledger persisted; reconciliation job exists.
- [ ] Secrets server-side only; payment events audited; test-mode coverage.
