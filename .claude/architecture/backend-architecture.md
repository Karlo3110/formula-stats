# Backend Architecture

## Purpose
Define how server-side code is structured so business logic is testable, transport- and
storage-agnostic, and understandable in isolation. We apply **Clean Architecture**:
dependencies point inward toward the domain; frameworks and databases are replaceable
details at the edges.

## The Layers
```
            ┌─────────────────────────────────────────────┐
   HTTP ───▶│ Controller (transport)                      │
            │   parse · validate · authz · map response   │
            ├─────────────────────────────────────────────┤
            │ Service (application / business logic)       │
            │   orchestration · rules · transactions      │
            ├─────────────────────────────────────────────┤
            │ Repository (data access)                     │
            │   the ONLY layer that touches the ORM/DB     │
            └─────────────────────────────────────────────┘
                         Domain (entities, value objects, domain errors)
                         — no framework imports, pure logic
```

### Controller — responsibilities & boundaries
- Owns transport (HTTP): route, status codes, request/response shape.
- Validates input via DTOs, enforces auth via guards, extracts the authenticated identity.
- Calls **one** service method and maps the result. **No business logic, no data access.**

### Service — responsibilities & boundaries
- Owns business rules and orchestration across repositories/other services.
- Manages transactions for multi-step writes.
- Knows nothing about HTTP (no `Request`/`Response`, no status codes) — it throws typed
  domain exceptions instead.

### Repository — responsibilities & boundaries
- The single place that talks to the database/ORM. Returns domain entities/types.
- No business logic; no HTTP. One repository per aggregate.

### Domain
- Entities, value objects, and domain exceptions expressing the business. Zero framework
  dependencies — it doesn't know it runs in NestJS or .NET.

## Dependency Rules
- Dependencies point **inward**: Controller → Service → Repository → Domain. Never the
  reverse. The domain depends on nothing.
- Collaborators are **injected** (DI), never `new`-ed inside.
- Cross-feature calls go through a service's public interface, never another feature's
  repository or internals.
- No circular dependencies between modules.

## Example (NestJS)
See `rules/backend/nestjs.md` §9 and the full module in `examples/backend/`. The flow:
`BillingController.create` → `BillingService.createInvoice` (rules + transaction) →
`InvoiceRepository.create` (Prisma) → returns a mapped `InvoiceResponse`.

```typescript
// service orchestrates a transaction across repositories; transport stays out of it
async chargeInvoice(userId: string, invoiceId: string): Promise<InvoiceResponse> {
  return this.prisma.$transaction(async (tx) => {
    const invoice = await this.invoiceRepository.findOwned(tx, userId, invoiceId);
    if (!invoice) throw new InvoiceNotFoundException(invoiceId);
    const charged = await this.payments.charge(invoice);            // external boundary
    const updated = await this.invoiceRepository.markPaid(tx, invoice.id, charged.id);
    return this.toResponse(updated);
  });
}
```

## Anti-Patterns
- ❌ Business logic in controllers; ORM calls in controllers/services.
- ❌ A service importing `Request`/`Response` or returning HTTP status codes.
- ❌ "Fat" repositories containing business rules.
- ❌ A `services/` god-folder of unrelated logic; mixing features.
- ❌ Anemic services that just pass through to repositories with no rules (then the logic
  leaked somewhere it shouldn't be — usually the controller).
- ❌ Reaching into another feature's internals instead of its public service.

## Cross-Cutting Concerns
Auth (guards), logging/transform (interceptors), validation/parsing (pipes), and error
translation (filters) live in `common/` and are applied declaratively — not hand-wired in
every handler. See `rules/backend/nestjs.md` and `rules/08-error-handling.md`.

## Related
`api-architecture.md`, `database-architecture.md`, `event-architecture.md`,
`authentication-architecture.md`, `rules/backend/`, `examples/backend/`.
