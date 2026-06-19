# NestJS Rules

Read with `backend/api-contract.md`, `core/05-security-baseline.md`, `core/01-typescript.md`,
`core/06-solid.md`, and `database/database-standards.md`. ORM is Prisma; database is
PostgreSQL; cache is Redis.

This file covers the REST/module structure. The GraphQL layer (`backend/graphql.md`),
real-time (`backend/websockets.md`), and caching (`backend/caching-redis.md`) plug into the
**same services** described here — resolvers and gateways are additional thin transports
over the identical business logic, never a second copy of it.

## Layering (strict)

```
Request
  → Controller   (routing + validation only)
  → Service      (business logic)
  → Repository   (data access via Prisma)
  → Database
```

- **Controllers** map routes, validate input via DTOs + `ValidationPipe`, call a service,
  and return a response DTO. No business logic. No direct Prisma access.
- **Services** contain all business logic and orchestration. They depend on repositories,
  not on Prisma directly (keeps data access swappable and testable).
- **Repositories** are the only place Prisma is used. They return domain/entity types.

## Folder structure (feature modules)

```
src/
├── main.ts
├── app.module.ts
├── config/                    # env validation + config module
├── common/
│   ├── decorators/            # @Public(), @CurrentUser()
│   ├── guards/                # JwtAuthGuard, RolesGuard
│   ├── filters/               # GlobalExceptionFilter
│   ├── interceptors/          # logging, transform
│   └── dto/                   # shared response/pagination DTOs
├── prisma/                    # PrismaService, schema.prisma
└── modules/
    └── users/
        ├── users.module.ts
        ├── users.controller.ts
        ├── users.service.ts
        ├── users.repository.ts
        ├── dto/
        │   ├── create-user.dto.ts
        │   └── user-response.dto.ts
        └── users.service.spec.ts
```

One feature = one module. Do not invent folders outside this layout.

## Controllers

```ts
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id")
  async findById(@Param("id") id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }
}
```

- No `try/catch` for control flow; throw `HttpException` subclasses and let the global
  filter format them.
- Controllers return response DTOs, never entities.

## DTOs and validation

- Request DTOs use `class-validator` decorators; enable a global `ValidationPipe` with
  `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.

```ts
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(1, 80)
  displayName!: string;
}
```

- Response DTOs explicitly list returned fields. Use `class-transformer` `@Expose`/`@Exclude`
  or explicit mapping functions so internal fields never serialize.

## Services

```ts
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email already registered.");
    }
    const user = await this.usersRepository.create(dto);
    return toUserResponse(user);
  }
}
```

- All business rules live here. One public method = one use case.
- Services depend on repositories and other services via constructor injection.

## Repositories and Prisma

- `PrismaService` extends `PrismaClient` and is the only Prisma surface.
- Repositories select only needed columns (`select`), never `findMany()` of full rows when
  a subset is used.

```ts
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
```

## Auth and guards

- Global `JwtAuthGuard` enforces auth on every route by default.
- A `@Public()` decorator marks the few open routes (e.g. login, register, health).
- `RolesGuard` + `@Roles(Role.Admin)` enforce RBAC.
- A `@CurrentUser()` param decorator injects the authenticated user.

```ts
@UseGuards(RolesGuard)
@Roles(Role.Admin)
@Delete(":id")
async remove(@Param("id") id: string): Promise<void> {
  await this.usersService.remove(id);
}
```

## Errors

- One `GlobalExceptionFilter` converts thrown exceptions into the standard error shape from
  `backend/api-contract.md`, attaches a `traceId`, and hides internals in production.

## Cross-cutting

- Config via the validated config module (`core/04-env-and-config.md`).
- Logging interceptor logs method, path, status, duration, and `traceId` — never secrets.
- `helmet`, CORS allowlist, and rate limiting configured in `main.ts`.

## Real-time (only when required)

- Use a NestJS Gateway (WebSockets) only when polling is insufficient.
- Authenticate the socket connection. Keep payloads minimal and explicitly typed. Define a
  typed event contract; do not send entities.
