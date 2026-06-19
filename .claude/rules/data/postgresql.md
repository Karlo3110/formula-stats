# PostgreSQL Standards

## 1. Overview
PostgreSQL is our primary relational store. Treat the schema as a first-class, versioned
artifact. The database enforces integrity — application code is the second line of
defense, never the only one.

## 2. Version Requirements
- PostgreSQL **15+**. Access via Prisma (Node) or EF Core (.NET) — never a per-request
  raw connection. Migrations are committed and reviewed.

## 3. Schema & Naming
- Tables and columns: `snake_case`. Tables **plural** (`user_accounts`), columns singular.
- Primary keys: `id` — prefer UUID (v7 for time-ordering) or identity bigint; be
  consistent project-wide.
- Foreign keys: `<entity>_id` with an actual `REFERENCES` constraint and an `ON DELETE`
  rule chosen deliberately (`RESTRICT`/`CASCADE`/`SET NULL`).
- Timestamps: `created_at`, `updated_at` (`timestamptz`, UTC). Soft delete via
  `deleted_at` where required.
- Money as `numeric(19,4)` (or integer minor units) — **never** `float`/`double`.
- Enumerable states: a Postgres `enum` or a `text` + `CHECK` constraint, not magic ints.

## 4. Approved Patterns
- **Constraints in the database**: `NOT NULL`, `UNIQUE`, `CHECK`, `FOREIGN KEY`. The DB
  is the source of truth for integrity.
- **Indexes** for every column used in `WHERE`, `JOIN`, `ORDER BY`, and for FKs.
  Composite indexes ordered by selectivity; partial indexes for filtered hot paths.
- **Transactions** for all multi-statement writes — atomic or nothing.
- **Parameterized queries** exclusively (`rules/05-security.md`).
- **Pagination** on every list (keyset/cursor for large or infinite sets).
- **Migrations** are forward-only, small, reviewed, and reversible-by-design; never edit
  an applied migration. See `playbooks/database-migration.md`.
- `EXPLAIN ANALYZE` slow queries; add/adjust indexes based on real plans.

## 5. Forbidden Patterns
- ❌ Raw string-interpolated SQL.
- ❌ A new connection per request (use the pooled singleton client).
- ❌ Unbounded `SELECT *` / `findMany()` with no limit.
- ❌ N+1 query loops (`rules/06-performance.md`).
- ❌ `float`/`double` for money.
- ❌ Foreign keys without constraints ("logical only" relationships).
- ❌ Business-critical invariants enforced only in app code, not the schema.
- ❌ Editing a migration that has run anywhere shared.

## 6. Security Requirements
- Least-privilege DB roles; the app role can't `DROP`/alter schema in prod.
- Row-level filtering by owner/tenant in the query (consider RLS for multi-tenant).
- No secrets in the DB in plaintext; encrypt sensitive columns; never log query params
  containing PII (`rules/05-security.md`).
- TLS to the database; credentials from the secret manager.

## 7. Performance Requirements
- Connection **pooling** (PgBouncer or the ORM pool) sized to the workload.
- Indexes maintained; watch for unused/duplicate indexes (they slow writes).
- Project only needed columns; avoid hauling large `text`/`jsonb` blobs unnecessarily.
- Batch writes; use `COPY`/`createMany` for bulk loads. See `architecture/database-architecture.md`.

## 8. Migrations (Workflow)
1. Edit `schema.prisma` (or EF model).
2. Generate: `npx prisma migrate dev --name descriptive_name` / `dotnet ef migrations add`.
3. **Review the generated SQL** — especially for locks on large tables.
4. For big tables, prefer non-blocking changes (`CREATE INDEX CONCURRENTLY`, nullable add
   then backfill then constrain).
5. Commit migration files; apply to staging then prod via `migrate deploy` /
   `database update` in a controlled step.

## 9. Example (Prisma)
```prisma
model Invoice {
  id        String        @id @default(uuid())
  userId    String        @map("user_id")
  total     Decimal       @db.Decimal(19, 4)
  currency  String        @db.Char(3)
  status    InvoiceStatus @default(OPEN)
  createdAt DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime      @updatedAt @map("updated_at") @db.Timestamptz
  user      User          @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@index([userId, createdAt])
  @@map("invoices")
}

enum InvoiceStatus { OPEN PAID VOID }
```
```typescript
// Atomic multi-step write
await prisma.$transaction(async (tx) => {
  await tx.user.update({ where: { id }, data: { balance: { decrement: amount } } });
  await tx.ledgerEntry.create({ data: { userId: id, amount, type: 'DEBIT' } });
});
```

## 10. Review Checklist
- [ ] Constraints (NN/UNIQUE/CHECK/FK) enforced in the schema.
- [ ] Indexes for filtered/joined/sorted columns and FKs.
- [ ] Money is `numeric`/integer, not float; timestamps are `timestamptz`.
- [ ] Parameterized queries; pooled connection; lists paginated.
- [ ] Multi-step writes transactional; no N+1.
- [ ] Migration reviewed for locks; forward-only; committed.
