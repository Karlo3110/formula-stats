# .NET Rules (ASP.NET Core Web API)

Read with `backend/api-contract.md`, `core/05-security-baseline.md`, and
`database/database-standards.md`. ORM is EF Core; database is PostgreSQL (Npgsql).

The goal is parity with the NestJS rules: same layering, same auth model, same API contract.

## Layering (strict)

```
Request
  → Controller   (routing + model validation only)
  → Service      (business logic)
  → Repository   (data access via EF Core)
  → DbContext / Database
```

- **Controllers** are thin: route, validate the model, call a service, return a typed DTO.
  No business logic, no `DbContext` access.
- **Services** hold all business logic. They depend on repository interfaces.
- **Repositories** are the only place `DbContext` is touched.

## Project structure

```
src/
├── Api/                       # Controllers, middleware, Program.cs
│   ├── Controllers/
│   ├── Middleware/            # ExceptionHandlingMiddleware
│   └── Program.cs
├── Application/               # Services, DTOs, validators, interfaces
│   ├── Users/
│   │   ├── UserService.cs
│   │   ├── IUserService.cs
│   │   ├── Dtos/
│   │   │   ├── CreateUserRequest.cs
│   │   │   └── UserResponse.cs
│   │   └── Validators/CreateUserRequestValidator.cs
│   └── Common/                # shared DTOs (paged result, error)
├── Domain/                    # Entities, enums, domain rules
│   └── Entities/User.cs
└── Infrastructure/            # EF Core, repositories, auth
    ├── Persistence/AppDbContext.cs
    ├── Repositories/UserRepository.cs
    └── Auth/
```

(For small services, Application/Domain/Infrastructure can be folders in one project rather
than separate assemblies. Keep the layering regardless.)

## Controllers

```csharp
[ApiController]
[Route("api/v1/users")]
[Authorize] // protected by default
public sealed class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService) => _userService = userService;

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserResponse>> GetById(Guid id, CancellationToken ct)
    {
        UserResponse user = await _userService.GetByIdAsync(id, ct);
        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(
        CreateUserRequest request, CancellationToken ct)
    {
        UserResponse created = await _userService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}
```

- `[Authorize]` is the default (apply globally via a fallback policy). Use `[AllowAnonymous]`
  to mark public endpoints explicitly.
- Controllers return DTOs, never entities.
- Always accept and pass `CancellationToken`.

## Validation

- Use **FluentValidation** with automatic validation, or DataAnnotations for simple cases.
- Reject unknown/extra fields; the model binder should not silently ignore them where it
  matters. Validation failures return the standard 400 error shape.

```csharp
public sealed class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(80);
    }
}
```

## Services

```csharp
public sealed class UserService : IUserService
{
    private readonly IUserRepository _users;

    public UserService(IUserRepository users) => _users = users;

    public async Task<UserResponse> CreateAsync(
        CreateUserRequest request, CancellationToken ct)
    {
        bool exists = await _users.ExistsByEmailAsync(request.Email, ct);
        if (exists)
        {
            throw new ConflictException("Email already registered.");
        }

        User user = await _users.CreateAsync(request, ct);
        return UserMapper.ToResponse(user);
    }
}
```

- Business logic lives only here. One public method per use case.
- Depend on interfaces (`IUserRepository`), registered in DI.

## Repositories and EF Core

- `AppDbContext` is the only EF surface; repositories own all queries.
- Project to DTOs in queries (`Select`) so only needed columns are read.
- Disable lazy loading. Use explicit `Include` only when needed.
- Use `AsNoTracking()` for read-only queries.

```csharp
public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct) =>
    await _db.Users.AsNoTracking().AnyAsync(u => u.Email == email, ct);
```

## DTOs

- Requests and responses are distinct `record` types in `Application`.
- Responses include only fields the client uses. Entities are never returned.
- Map with explicit mapper methods (or a configured mapper); never serialize entities directly.

```csharp
public sealed record CreateUserRequest(string Email, string DisplayName);
public sealed record UserResponse(Guid Id, string Email, string DisplayName);
```

## Auth

- JWT bearer authentication with the shared model: short-lived access token + rotating
  refresh token in an httpOnly + Secure + SameSite=Strict cookie.
- Global authorization fallback policy requires an authenticated user; `[AllowAnonymous]`
  opts out.
- RBAC via policies/roles: `[Authorize(Roles = "Admin")]` or named policies.
- Verify object-level ownership in the service, not just the role.

## Errors

- One `ExceptionHandlingMiddleware` converts exceptions into the standard error shape from
  `backend/api-contract.md` (ProblemDetails-compatible), with `traceId`, hiding internals in
  production.
- Define typed domain exceptions (`NotFoundException`, `ConflictException`,
  `ForbiddenException`) mapped to the correct status codes.

## Config

- Options pattern with validation on start (`core/04-env-and-config.md`).
- Secrets via User Secrets locally and environment variables / secret store in production.

## Cross-cutting

- Security headers, HTTPS redirection, CORS allowlist, and rate limiting configured in
  `Program.cs`.
- Structured logging with `traceId`; never log secrets or full PII.

## Real-time (only when required)

- Use SignalR only when polling is insufficient. Authenticate the connection, keep payloads
  minimal and strongly typed, and never push entities.
