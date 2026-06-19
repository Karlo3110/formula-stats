# Error Handling Standards

> Errors are part of the contract, not an afterthought. Handle them explicitly, type them
> precisely, and never let one disappear silently.

---

## 1. Typed Errors, Not Generic Ones

```typescript
// ❌ FORBIDDEN — opaque, uncatchable-by-type, no metadata
throw new Error('Something went wrong');

// ✅ REQUIRED — a domain exception hierarchy
// common/exceptions/domain.exception.ts
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, 'USER_NOT_FOUND', 404);
  }
}
```

Each error carries a stable machine-readable `code`, a human message, and an HTTP status.
Callers can branch on type/code instead of string-matching messages.

---

## 2. Never Swallow Errors

```typescript
// ❌ FORBIDDEN — silent catch hides failures
try { await chargeCard(order); } catch { /* ignore */ }

// ❌ FORBIDDEN — catch-log-continue as if nothing happened
try { await chargeCard(order); } catch (e) { console.log(e); }

// ✅ REQUIRED — handle, translate, or rethrow; never absorb
try {
  await this.payments.charge(order);
} catch (error) {
  this.logger.error(`Charge failed for order ${order.id}`, error instanceof Error ? error.stack : undefined);
  throw new PaymentFailedException(order.id, { cause: error });
}
```

The only time you may catch-and-not-rethrow is when you have a **real recovery** (a
fallback value, a retry, a documented best-effort side effect) — and you log it.

---

## 3. Catch `unknown`, Then Narrow

In TypeScript, caught values are `unknown`. Prove the shape before using it.

```typescript
try {
  await doThing();
} catch (error) {
  if (error instanceof DomainException) {
    // handle known domain error
  } else if (error instanceof Error) {
    this.logger.error(error.message, error.stack);
    throw error;
  } else {
    throw new UnknownException('Non-Error thrown', { cause: error });
  }
}
```

Never write `catch (error: any)`.

---

## 4. Fail Fast At Boundaries

Validate and reject invalid input at the system edge (see `rules/05-security.md`).
Inside the trusted core, an invalid state is a bug — throw immediately rather than
limping forward with bad data. A loud failure at the source is far cheaper to debug than
a `null` that explodes three layers away.

---

## 5. Result Types For Expected Failures

Exceptions are for **exceptional** conditions. For *expected* outcomes that aren't errors
(e.g., "username taken," "coupon expired"), prefer returning a typed result so the caller
must handle both branches.

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

async function reserveUsername(name: string): Promise<Result<Username, 'TAKEN' | 'INVALID'>> {
  if (!isValid(name)) return { ok: false, error: 'INVALID' };
  if (await exists(name)) return { ok: false, error: 'TAKEN' };
  return { ok: true, value: await persist(name) };
}
```

Use exceptions for truly exceptional, non-local failures; use `Result` for routine,
locally-handled outcomes. Don't use exceptions for ordinary control flow.

---

## 6. Centralized Translation To HTTP (Backend)

Controllers and services throw domain exceptions; a single exception filter maps them to
HTTP responses. Transport concerns live in exactly one place.

```typescript
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    res.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      code: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

A separate catch-all filter maps **unexpected** errors to a generic `500` (see §8).

---

## 7. Client-Safe Messages (No Leaks)

```typescript
// ❌ FORBIDDEN — leaks internals to the client
res.status(500).json({ error: err.stack, query: failedSql });

// ✅ REQUIRED — generic to client, detailed to logs
this.logger.error('Unhandled error', { stack: err.stack, context });
res.status(500).json({ statusCode: 500, code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
```

Never return stack traces, SQL, internal paths, or dependency versions to clients.
Correlate via a request/trace ID the client *can* quote to support.

---

## 8. The Catch-All Net

Every service has a top-level handler so no error escapes unlogged and unshaped:
- Backend: a global exception filter + `unhandledRejection`/`uncaughtException` handlers
  that log and gracefully shut down on fatal errors.
- Frontend: React **error boundaries** around feature regions, plus a global handler that
  reports to Sentry and shows a recoverable fallback UI. See `rules/observability/sentry.md`.

```tsx
// ✅ REQUIRED — error boundary with graceful fallback
<ErrorBoundary fallback={<ErrorState onRetry={refetch} />}>
  <Dashboard />
</ErrorBoundary>
```

---

## 9. Async Errors Are Real Errors

- Every `await` can throw — account for it.
- Never leave a floating promise; `await` it or explicitly handle rejection. (`no-floating-promises` lint on.)
- For parallel work, remember `Promise.all` rejects on the first failure; use
  `Promise.allSettled` when partial success is acceptable, and report what failed.

---

## 10. Retries, Timeouts & Idempotency

- Wrap network/IO calls in timeouts; a hung dependency must not hang you.
- Retry only **transient** failures (network blips, `429`, `503`), with exponential
  backoff and jitter and a max attempt count. Never retry a non-idempotent write blindly
  — make the operation idempotent (idempotency keys) first. See `architecture/payment-architecture.md`.
- A circuit breaker around a flaky dependency prevents cascading failure.

---

## 11. Logging Errors

Log at the point you can add the most context, once — not at every frame as it bubbles.
Include the error message, stack, and structured context (ids, operation), never secrets
or PII. See `rules/observability/logging.md`.
