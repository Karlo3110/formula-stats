# Logging Standards (Detailed)

> Extends `rules/09-logging-observability.md`. Logs are structured, leveled, correlated,
> and free of sensitive data.

## 1. Structured JSON Logs
Every log line is a JSON object with a stable schema, not interpolated prose. Minimum
fields on every line:
- `timestamp` (ISO-8601, UTC), `level`, `service`, `env`, `message`,
- `traceId`/`requestId` (correlation), and relevant typed context (`userId`, `orderId`…).

```typescript
logger.log({ message: 'order.created', orderId, userId, total, currency });
```

Use a real logger (Pino/Nest Logger/Serilog), not `console.*` in service code
(`rules/09` §1). Configure pretty output in dev, JSON in prod.

## 2. Levels (Decision Guide)
- `error` — a real failure needing attention; include the error message + stack + context.
- `warn` — recovered/degraded/suspicious; functioning but worth noticing.
- `info` — significant business events (registered, paid, published).
- `debug` — developer diagnostics; off in prod by default.
- `trace`/`verbose` — fine-grained; enabled only while investigating.

Don't log expected validation failures at `error`; don't hide real failures at `debug`.

## 3. Correlation & Context
- Generate/propagate a `requestId`/`traceId` at the edge and attach it to every log for
  that request (async-local-storage / context middleware). Propagate it across service and
  queue boundaries so one request is traceable end to end.
- Bind contextual fields once (logger child) rather than repeating them on every call.

## 4. Never Log Sensitive Data
Forbidden in logs: passwords, tokens/JWTs, API keys, secrets, full card numbers/PAN,
CVV, government IDs, and sensitive PII. Implement an allow/deny field redactor at the
logger so it's enforced centrally, not per-call. A secret that lands in a log is leaked —
rotate it. See `rules/05-security.md`.

```typescript
// redactor config
redact: ['req.headers.authorization', 'password', '*.token', 'card.number'];
```

## 5. What To Log (And Not)
Log: request start/finish with status + latency, significant state transitions, external
call outcomes, retries, and errors with context. Don't: log inside tight loops, log huge
payloads, or log the same error at every stack frame as it bubbles — log it once where
you have the most context (`rules/08-error-handling.md` §11).

## 6. Operational
- One structured stream to stdout; the platform ships it to the aggregator (CloudWatch,
  Loki, Datadog). Don't write app log files inside containers.
- Set retention and sampling deliberately (sample noisy `info`/debug; never sample `error`).
- Make logs queryable: consistent field names enable dashboards and alerts.

## 7. Review Checklist
- [ ] Structured JSON; no `console.*` in service code.
- [ ] Correct levels; correlation id on every line.
- [ ] No secrets/PII; redactor configured.
- [ ] Errors logged once with context; no tight-loop/oversized logging.
- [ ] Output to stdout; retention/sampling set.
