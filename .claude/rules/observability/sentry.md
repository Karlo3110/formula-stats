# Sentry / Error Tracking Standards

> Extends `rules/08-error-handling.md` and `rules/09-logging-observability.md`. Errors are
> *reported* with context, not just logged to stdout where they scroll away.

## 1. Overview
Sentry captures unhandled and significant errors from frontend and backend, enriched with
release, environment, user/trace context, and breadcrumbs — so we find and fix issues
before users report them.

## 2. Approved Patterns
- **Initialize once per app** (backend bootstrap, frontend root) with `environment` and
  `release` (the git SHA) set so errors map to a deploy.
- **Capture unhandled errors automatically**: wire Sentry into the global exception filter
  (backend) and error boundaries + global handlers (frontend). See `rules/08` §8.
- **Enrich context**: attach `traceId`/`requestId` (shared with logs/traces), `userId`
  (id only, not PII), feature/tags, and breadcrumbs. This is what makes an error
  debuggable.
- **Capture handled-but-important errors** explicitly with `captureException(error, {
  extra })` where a swallow/fallback still warrants visibility.
- **Source maps uploaded** on frontend builds so stack traces are readable.
- **Performance/tracing**: enable tracing with sampling to correlate errors with slow
  transactions.
- **Release health & alerts**: alert on new issues, regressions, and spikes; route to the
  owning team.

## 3. Forbidden Patterns
- ❌ Sending PII/secrets/tokens to Sentry (scrub before send — see §4).
- ❌ Reporting expected validation/business rejections as errors (noise). Capture genuine
  faults only.
- ❌ Catch-and-`captureException`-and-continue when the operation actually failed — handle
  it properly (`rules/08`), then report.
- ❌ Shipping without `release`/source maps (unreadable, unattributable stack traces).
- ❌ 100% trace sampling in high-volume prod (cost/perf) — sample.
- ❌ Letting the Sentry SDK failure affect the request path.

## 4. Security & Privacy
- Configure `beforeSend` to scrub sensitive fields (auth headers, passwords, tokens, card
  data, PII). Default-deny: only send what you intend.
- Send a stable user **id**, never email/name/IP unless explicitly allowed and necessary.
- DSN is not a high secret but keep server DSNs out of the client; never expose privileged
  config.

## 5. Reliability / Performance
- Bound event volume (rate limiting, sampling, deduping). The SDK must fail open — never
  block or crash the app if Sentry is unreachable.

## 6. Testing Requirements
- Verify the integration in staging: trigger a test error and confirm it arrives with
  release, environment, and context. Assert `beforeSend` scrubbing in a unit test.

## 7. Example — Backend Wiring (NestJS)
```typescript
Sentry.init({
  dsn: config.getOrThrow<string>('sentry.dsn'),
  environment: config.getOrThrow<string>('app.env'),
  release: config.getOrThrow<string>('app.release'),   // git SHA
  tracesSampleRate: 0.1,
  beforeSend(event) { return scrubSensitive(event); }, // drop PII/secrets
});

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (isUnexpected(exception)) {
      Sentry.captureException(exception, { tags: { requestId: getRequestId(host) } });
    }
    // delegate to the domain/HTTP error mapping (rules/08-error-handling.md)
  }
}
```

## 8. Review Checklist
- [ ] Initialized with environment + release (git SHA); source maps uploaded (FE).
- [ ] Unhandled errors auto-captured (filter + boundaries); important handled errors
      captured explicitly.
- [ ] Context attached (traceId, userId-only) — debuggable events.
- [ ] `beforeSend` scrubs PII/secrets; expected rejections not reported as errors.
- [ ] Tracing sampled; SDK fails open; verified in staging.
