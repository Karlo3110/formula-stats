# Monitoring & Metrics Standards

> Extends `rules/09-logging-observability.md`. If you can't measure it, you can't operate
> it. Every service exposes health, emits metrics, and has alerts tied to user impact.

## 1. The Golden Signals
Track for every service and key endpoint:
- **Latency** — p50 / p95 / p99 (separate success vs. error latency).
- **Traffic** — requests/sec, throughput.
- **Errors** — error rate (% and absolute), by type/status.
- **Saturation** — CPU, memory, connection pool, queue depth, event-loop lag.

Plus business metrics that reflect real value (signups, orders placed, payments succeeded,
jobs processed).

## 2. Metric Types & Conventions
- **Counters** (monotonic): `http_requests_total`, `payments_succeeded_total`.
- **Gauges** (current value): `queue_depth`, `active_connections`.
- **Histograms** (distributions): `http_request_duration_seconds`.
- Use consistent names + labels (`service`, `route`, `status`, `method`). Keep label
  cardinality low — never label by user id, raw path with ids, or unbounded values.

## 3. Health Endpoints
Every service exposes:
- `GET /health/live` — process is up (no dependency checks). Used by liveness probes.
- `GET /health/ready` — dependencies (DB, cache, critical downstreams) are reachable. Used
  by readiness probes / load-balancer registration.
Keep them cheap and unauthenticated-but-internal. See `rules/infrastructure/kubernetes.md`.

## 4. Tracing
- Adopt **OpenTelemetry**. Propagate W3C `traceparent` across HTTP and queue boundaries so
  one request reconstructs end to end.
- Spans for inbound requests, outbound calls, DB queries, and queue processing. Attach the
  correlation id shared with logs (`rules/observability/logging.md`) so logs ↔ traces link.

## 5. Dashboards
- One dashboard per service showing the golden signals + key business metrics + dependency
  health. A new on-call engineer should diagnose from it without reading code.
- Track SLIs against SLOs (e.g., "99.9% of requests < 300ms"); visualize error budget burn.

## 6. Alerting (On Symptoms, Not Causes)
- Alert on **user-visible symptoms** and SLO breaches (error rate up, latency past budget,
  health failing, queue backing up, error-budget burn) — not on every CPU blip.
- Every alert is **actionable** and has a runbook link (`playbooks/production-incident.md`).
  Tier by severity (page vs. ticket). Tune to avoid alert fatigue — a noisy alert that's
  routinely ignored is worse than none.

## 7. What "Instrumented" Means For A Feature
Before "done," the feature emits: request/latency/error metrics, the business metric it
moves, spans for its external calls, and it's visible on a dashboard with an alert on its
critical failure mode. See `rules/09` §8.

## 8. Performance Of Telemetry
Metrics/traces are cheap but not free: sample traces (e.g., tail-based) under high volume,
keep cardinality bounded, and emit asynchronously. Never let instrumentation block or
crash the request path.

## 9. Review Checklist
- [ ] Golden signals + relevant business metrics emitted.
- [ ] `/health/live` and `/health/ready` implemented and wired to probes.
- [ ] OpenTelemetry tracing with context propagation; correlation id shared with logs.
- [ ] Dashboard + SLOs defined; alerts on symptoms with runbook links.
- [ ] Label cardinality bounded; telemetry non-blocking.
