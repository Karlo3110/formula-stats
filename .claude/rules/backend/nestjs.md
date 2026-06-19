# NestJS Standards

## 1. Overview
NestJS is our primary backend framework. Architecture is strict and layered:
**Controller → Service → Repository**, with dependency injection throughout and the
domain kept free of transport concerns.

## 2. Version Requirements
- NestJS **10+**, Node **20 LTS+**, TypeScript strict (`rules/02-typescript.md`).
- Prisma as the data layer (`rules/data/postgresql.md`), class-validator for DTOs.

## 3. Folder Structure
Per-feature modules — see `rules/04-file-organization.md` §3:
```
modules/billing/
├── billing.module.ts
├── billing.controller.ts
├── billing.service.ts
├── billing.repository.ts
├── dto/  entities/  types/  exceptions/
└── billing.service.spec.ts
common/   config/   database/   main.ts
```

## 4. Approved Patterns
- **Controllers are thin**: parse/validate the request, call one service method, return
  the result. No business logic, no data access.
- **Services hold business logic** and orchestration; they depend on repositories and
  other services via constructor injection.
- **Repositories own data access** (Prisma). Nothing else touches the ORM.
- **DTOs validate input** with class-validator; a global `ValidationPipe` enforces
  `whitelist`, `forbidNonWhitelisted`, `transform` (`rules/05-security.md`).
- **Config via `ConfigService`** only; `process.env` confined to the config module.
- **Cross-cutting concerns** as Guards (authz), Interceptors (logging/transform), Pipes
  (validation/parsing), Filters (errors) in `common/`.
- **Typed domain exceptions** + a global exception filter (`rules/08-error-handling.md`).
- `async/await` everywhere; explicit return types on every controller/service method.

## 5. Forbidden Patterns
- ❌ Business logic in controllers.
- ❌ Prisma/raw SQL in controllers or services (only repositories).
- ❌ `process.env` outside the config module.
- ❌ `any`; untyped request bodies; missing DTO validation.
- ❌ `new PrismaClient()` per request — use the injected singleton (`rules/data/postgresql.md`).
- ❌ Generic `throw new Error(...)`; throw typed exceptions instead.
- ❌ Circular module dependencies.

## 6. Security Requirements
- Guards on every protected route; default-deny; authorize at the resource level.
- Validate all input; rate-limit sensitive endpoints (`ThrottlerGuard`).
- Helmet, explicit CORS allow-list, secure cookies (`rules/05-security.md`).
- Never leak internals in error responses.

## 7. Performance Requirements
- No N+1 (`include`/`select`); paginate all list endpoints; project needed fields.
- Cache via a centralized cache service with TTL (`rules/data/redis.md`).
- Multi-step writes wrapped in `prisma.$transaction` (`rules/data/postgresql.md`).
- See `rules/06-performance.md`.

## 8. Testing Requirements
- Unit-test services with mocked repositories; integration-test controllers→DB; E2E for
  critical flows (`rules/07-testing.md`). Tests sit beside the code.

## 9. Example
```typescript
// billing.controller.ts — thin transport layer
@Controller('v1/invoices')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInvoiceDto,
  ): Promise<InvoiceResponse> {
    return this.billingService.createInvoice(user.id, dto);
  }
}

// billing.service.ts — business logic
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async createInvoice(userId: string, dto: CreateInvoiceDto): Promise<InvoiceResponse> {
    const invoice = await this.invoiceRepository.create(userId, dto);
    this.logger.log(`Invoice created: ${invoice.id}`);
    return this.toResponse(invoice);
  }

  private toResponse(invoice: Invoice): InvoiceResponse {
    return { id: invoice.id, total: invoice.total, status: invoice.status };
  }
}

// invoice.repository.ts — data access only
@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, dto: CreateInvoiceDto): Promise<Invoice> {
    return this.prisma.invoice.create({ data: { userId, ...dto } });
  }
}
```
See the full golden implementation in `examples/backend/`.

## 10. Review Checklist
- [ ] Controller thin; logic in service; data access in repository only.
- [ ] DTOs validated; global ValidationPipe configured.
- [ ] Config via ConfigService; no stray `process.env`.
- [ ] Typed exceptions + global filter; no internal leaks.
- [ ] Guards on protected routes; resource-level authz.
- [ ] No N+1; lists paginated; multi-step writes transactional.
- [ ] Explicit return types; no `any`; tests present.
