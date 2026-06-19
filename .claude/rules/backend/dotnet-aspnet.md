# .NET / ASP.NET Core Standards

## 1. Overview
For .NET services we use ASP.NET Core with the same layered discipline as the rest of the
codebase: thin endpoints → application services → repositories, Clean Architecture with
dependencies pointing inward, and strong typing throughout. C# is our typed backend
language here; `dynamic` is to C# what `any` is to TypeScript — forbidden.

## 2. Version Requirements
- **.NET 8 LTS+**, C# **12+**, nullable reference types **enabled** project-wide
  (`<Nullable>enable</Nullable>`), `TreatWarningsAsErrors` on.

## 3. Folder Structure (Clean Architecture)
```
src/
├── Api/                # ASP.NET Core host: controllers/minimal APIs, middleware, DI wiring
├── Application/        # Use cases, DTOs, interfaces, validators (no infra deps)
├── Domain/            # Entities, value objects, domain services, domain events (no deps)
└── Infrastructure/    # EF Core, repositories, external clients, config
tests/
├── Application.UnitTests/
└── Api.IntegrationTests/
```
`Domain` depends on nothing. `Application` depends on `Domain`. `Infrastructure` and `Api`
depend inward. Never the reverse.

## 4. Approved Patterns
- **Thin controllers / minimal-API handlers**: validate, dispatch to an application
  service (or MediatR handler), map the result to a response. No business logic.
- **Application services / CQRS handlers** hold use-case logic; depend on interfaces.
- **Repositories behind interfaces** (defined in `Application`/`Domain`, implemented in
  `Infrastructure`) wrap EF Core (`rules/backend/entity-framework.md`).
- **Dependency injection** via the built-in container; register with correct lifetimes
  (`Scoped` for EF `DbContext`/repositories, `Singleton` for stateless services).
- **DTOs/records** for requests/responses; **FluentValidation** for input validation.
- **`async`/`await` end-to-end** with `CancellationToken` flowed through every async call.
- **Options pattern** (`IOptions<T>`) for configuration — never read raw config in services.
- **Global exception middleware** mapping typed exceptions to `ProblemDetails` responses.
- **Structured logging** via `ILogger<T>` with message templates.

## 5. Forbidden Patterns
- ❌ `dynamic`; suppressing nullable warnings with `!` to silence the compiler.
- ❌ Business logic or EF queries in controllers.
- ❌ `DbContext` injected into controllers or used outside repositories.
- ❌ Blocking on async (`.Result`, `.Wait()`, `.GetAwaiter().GetResult()`).
- ❌ `async void` (except event handlers); swallowing exceptions.
- ❌ Service locator / `new`-ing dependencies instead of DI.
- ❌ Reading `IConfiguration` directly in business code (use `IOptions<T>`).

## 6. Security Requirements
- Authentication + authorization via ASP.NET Core (`[Authorize]`, policy-based authz);
  default-deny with a fallback policy. Resource-level checks for ownership.
- Validate all input (FluentValidation); model binding does not equal validation.
- Secrets via user-secrets (dev) / a secret manager (prod), never `appsettings.json`.
- Use parameterized EF queries; enforce HTTPS, HSTS, anti-forgery, security headers,
  CORS allow-list, rate limiting (`rules/05-security.md`).

## 7. Performance Requirements
- `AsNoTracking()` for read-only queries; project to DTOs with `.Select()`; never return
  full entities to the wire.
- Avoid N+1 (`Include`/explicit projection); paginate all lists; no unbounded queries.
- Flow `CancellationToken`; use connection pooling (default) and `IHttpClientFactory` for
  outbound calls. See `rules/06-performance.md`.

## 8. Testing Requirements
- xUnit + FluentAssertions; mock interfaces with NSubstitute/Moq for unit tests.
- Integration tests via `WebApplicationFactory` against a real test database
  (Testcontainers). See `rules/07-testing.md`.

## 9. Example
```csharp
// Api: thin endpoint
[ApiController]
[Route("v1/invoices")]
[Authorize]
public sealed class InvoicesController(IInvoiceService invoiceService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<InvoiceResponse>> Create(
        CreateInvoiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await invoiceService.CreateAsync(User.GetId(), request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}

// Application: use-case logic
public sealed class InvoiceService(IInvoiceRepository repository, ILogger<InvoiceService> logger)
    : IInvoiceService
{
    public async Task<InvoiceResponse> CreateAsync(
        Guid userId, CreateInvoiceRequest request, CancellationToken cancellationToken)
    {
        var invoice = Invoice.Create(userId, request.Amount, request.Currency);
        await repository.AddAsync(invoice, cancellationToken);
        logger.LogInformation("Invoice {InvoiceId} created for {UserId}", invoice.Id, userId);
        return InvoiceResponse.From(invoice);
    }
}
```

## 10. Review Checklist
- [ ] Nullable enabled; no `dynamic`; warnings-as-errors clean.
- [ ] Thin endpoints; logic in Application; data access behind repository interfaces.
- [ ] DI lifetimes correct; `CancellationToken` flowed; no blocking on async.
- [ ] Input validated (FluentValidation); typed exceptions → `ProblemDetails`.
- [ ] `[Authorize]` + policies; secrets out of config files.
- [ ] `AsNoTracking` + projections; lists paginated; no N+1.
- [ ] Unit + integration tests present.
