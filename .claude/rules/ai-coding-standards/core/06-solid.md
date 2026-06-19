# SOLID Principles

SOLID is mandatory for all backend services and applies to frontend logic (services, hooks,
utilities) as well. These are concrete rules with the canonical stack, not abstract theory.

## S — Single Responsibility

A class/module/function has one reason to change. Already covered in `00-principles.md`;
SOLID restates it as the foundation.

- A service that authenticates **and** sends email **and** writes audit logs is three
  collaborators. Split: `AuthService`, `EmailService`, `AuditService`.
- A React hook that fetches **and** formats **and** manages a modal is three units.

## O — Open/Closed

Open for extension, closed for modification. Add behavior by adding code, not by editing
existing tested code with new branches.

```ts
// Bad — every new provider edits this function.
function sendNotification(type: "email" | "sms", message: string): Promise<void> {
  if (type === "email") { /* ... */ }
  else if (type === "sms") { /* ... */ }
  // adding "push" forces a modification here
}

// Good — extend by adding a new strategy implementation.
interface NotificationChannel {
  send(message: string): Promise<void>;
}

class EmailChannel implements NotificationChannel { /* ... */ }
class SmsChannel implements NotificationChannel { /* ... */ }

class NotificationService {
  constructor(private readonly channels: ReadonlyArray<NotificationChannel>) {}
  async broadcast(message: string): Promise<void> {
    await Promise.all(this.channels.map((c) => c.send(message)));
  }
}
```

Apply this only when a second variant actually exists (see `00-principles.md` rule 5). Do
not pre-build strategy patterns for a single case.

## L — Liskov Substitution

A subtype must be usable anywhere its base type is, without surprising behavior.

- An implementation of an interface must honor the full contract: same return semantics, no
  stronger preconditions, no thrown errors the contract does not allow.
- If a `ReadOnlyRepository` cannot implement `save()`, it must not inherit from a repository
  interface that promises `save()`. Split the interface (see ISP).

## I — Interface Segregation

Clients depend only on methods they use. Prefer many small interfaces over one large one.

```ts
// Bad — consumers forced to depend on methods they never call.
interface UserStore {
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  exportAllToCsv(): Promise<string>;
}

// Good — segregated by capability.
interface UserReader { findById(id: string): Promise<User | null>; }
interface UserWriter { create(input: CreateUserInput): Promise<User>; }
interface UserExporter { exportAllToCsv(): Promise<string>; }
```

## D — Dependency Inversion

High-level modules depend on abstractions, not concrete implementations. Concrete
implementations are injected.

- Services depend on **repository interfaces**, not on Prisma/EF Core directly.
- Services depend on a **`CacheService` interface**, not on the Redis client directly.
- Wiring happens in the DI container (NestJS module / .NET `Program.cs`).

```ts
// users.service.ts depends on the abstraction
export class UsersService {
  constructor(
    private readonly users: UserRepository,   // interface/abstract
    private readonly cache: CacheService,      // interface/abstract
  ) {}
}
```

```ts
// users.module.ts wires the concrete implementations
@Module({
  providers: [
    UsersService,
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: CacheService, useClass: RedisCacheService },
  ],
})
export class UsersModule {}
```

This is what makes the data layer (Prisma/EF) and cache layer (Redis) swappable and the
business logic unit-testable with fakes.

## How SOLID maps to the layering

- Controllers/Resolvers → thin, depend on service abstractions.
- Services → business logic, depend on repository and infrastructure abstractions.
- Repositories → the only concrete data access; implement a repository interface.
- Infrastructure (Redis, email, storage) → behind interfaces, injected.

If a dependency is `new`-ed up inside a class instead of injected, that is a Dependency
Inversion violation and must be refactored.
