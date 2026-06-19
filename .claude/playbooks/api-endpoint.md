# Playbook: New API Endpoint

> Add an HTTP endpoint that is RESTful, validated, authorized, typed, and documented.

## 1. Plan
- [ ] Define the **contract first**: method + path (RESTful, versioned `/v1/...`), request
      shape, response shape, error codes, auth requirements
      (`architecture/api-architecture.md`).
- [ ] Decide: does this belong on an existing controller/module or a new one?
- [ ] Identify authorization: required role(s) and resource-ownership rule.
- [ ] Confirm idempotency needs (unsafe operations that may be retried).

## 2. Implement
- [ ] **Request DTO** with class-validator decorators; rely on the global ValidationPipe
      (`rules/05-security.md` §3).
- [ ] **Response DTO** — never serialize the entity directly.
- [ ] **Service method** with the business logic + transaction; throws typed exceptions.
- [ ] **Repository method** if new data access is needed.
- [ ] **Controller handler**: thin, `@UseGuards` for authN + authZ, `@CurrentUser` for
      identity (never trust the body), returns the mapped DTO / envelope
      (`examples/backend/users/`).
- [ ] Paginate any list; no N+1 (`rules/06-performance.md`).
- [ ] Add a stable error `code` for each failure mode (`rules/08-error-handling.md`).
- [ ] Rate-limit if sensitive/expensive (`rules/05-security.md` §8).

## 3. Test
- [ ] Unit-test the service (happy path, validation/error paths, authz).
- [ ] Integration-test the route: valid request → expected status/body; invalid → `400`;
      unauthenticated → `401`; wrong role/owner → `403`/`404`.
- [ ] Test idempotency if applicable (`rules/07-testing.md`).

## 4. Document
- [ ] Update the **OpenAPI** spec (decorators/annotations): summary, params, request/
      response schemas, auth, and every error code.
- [ ] Update `shared/` types so the frontend consumes the same contract.

## 5. Deploy
- [ ] Backward-compatible (additive). Breaking changes → new version, never mutate `/v1`.
- [ ] Standard pipeline; CI green (`architecture/deployment-architecture.md`).

## 6. Verify
- [ ] Call it in preview/staging with valid and invalid inputs; confirm status codes,
      envelope shape, and error format.
- [ ] Confirm it appears in metrics/traces with the right latency
      (`rules/observability/monitoring-metrics.md`).

## Definition of Done
RESTful + versioned · input validated · authN+authZ enforced · typed errors with codes ·
paginated/no N+1 · tested · OpenAPI + shared types updated · verified.
