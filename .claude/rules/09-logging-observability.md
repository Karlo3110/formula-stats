# Logging & Observability (Overview)

> This file states the cross-cutting rules every service follows. Deeper, tool-specific
> guidance lives in `rules/observability/` (logging, monitoring & metrics, Sentry).

Observability rests on three pillars: **logs** (discrete events), **metrics** (aggregated
numbers over time), and **traces** (the path of one request across services). A
production-grade service emits all three.

---

## 1. No `console.log` In Production Code

```typescript
// ❌ FORBIDDEN
console.log('User created');
console.error(error);

// ✅ REQUIRED — a structured logger
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async create(dto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${dto.email}`);
    try {
      const user = await this.repo.create(dto);
      this.logger.log(`User created: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${dto.email}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
```

`console.*` is allowed only in CLI scripts and local dev tooling, never in shipped service
code. A lint rule enforces this.

---

## 2. Structured, Not String-Soup

Logs are machine-parsed. Emit JSON with consistent fields, not interpolated prose.

```typescript
// ✅ REQUIRED — structured fields
logger.log({ message: 'invoice.paid', invoiceId, amount, currency, userId });
```

Every log line should carry: timestamp, level, service name, environment, and a
**correlation/trace id** so one request can be followed across logs, metrics, and traces.

---

## 3. Log Levels (Use Them Correctly)

| Level | Use for |
|-------|---------|
| `error` | A failure needing attention; something broke. Always with stack + context. |
| `warn`  | A recovered or suspicious condition; degraded but functioning. |
| `info`/`log` | Significant business events (user registered, order placed). |
| `debug` | Developer detail, off in production by default. |
| `verbose`/`trace` | Fine-grained diagnostics, on only when chasing a problem. |

Don't log at `error` for expected validation failures, and don't bury a real failure at
`debug`.

---

## 4. Never Log Sensitive Data

Never log passwords, tokens, API keys, secrets, full card/PAN, or sensitive PII. Redact
at the logger with an allow/deny field list. A leaked secret in a log is a leaked
secret — rotate it. See `rules/05-security.md` and `rules/observability/logging.md`.

---

## 5. Errors Reported, Not Just Logged

Unhandled and significant errors are sent to an error-tracking service (Sentry) with
context, release version, and user/trace id — not left to scroll past in stdout. See
`rules/observability/sentry.md`.

---

## 6. Metrics & Tracing

- Emit the golden signals — latency, traffic, errors, saturation — per service and
  endpoint. See `rules/observability/monitoring-metrics.md`.
- Propagate a trace context (OpenTelemetry / W3C `traceparent`) across service and queue
  boundaries so a request can be reconstructed end to end.
- Health endpoints (`/health/live`, `/health/ready`) expose liveness and readiness for
  orchestrators. See `rules/infrastructure/kubernetes.md`.

---

## 7. Audit Trails

Security- and money-relevant actions are recorded to a durable, tamper-evident audit log
(separate from operational logs): actor, action, target, timestamp, source IP/agent,
outcome. See `rules/05-security.md` §11.

---

## 8. What "Observable" Means For A Feature

A feature is not done until you can answer, from telemetry alone:
- Is it working right now? (health, error rate)
- How fast is it? (latency p50/p95/p99)
- When it breaks, who/what/where? (structured logs + trace id + Sentry event)
- Is it being used? (business metrics)

If you can't answer these, add the instrumentation before calling it done.
