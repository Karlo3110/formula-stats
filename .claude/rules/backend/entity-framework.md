# Entity Framework Core Standards

## 1. Overview
EF Core is the data-access layer for .NET services. It lives only in `Infrastructure`,
behind repository interfaces. Application and Domain code never see `DbContext`.

## 2. Version Requirements
- EF Core **8+**, matching the .NET 8 LTS baseline. Migrations checked into source.

## 3. Folder Structure
```
Infrastructure/
├── Persistence/
│   ├── AppDbContext.cs
│   ├── Configurations/        # IEntityTypeConfiguration<T> per entity
│   ├── Repositories/          # Implement Application/Domain repository interfaces
│   └── Migrations/            # Generated migrations (committed)
```

## 4. Approved Patterns
- **`DbContext` is `Scoped`** (one per request), injected only into repositories.
- **Fluent configuration** via `IEntityTypeConfiguration<T>` — keys, indexes, relations,
  max lengths, value conversions live there, not in attributes scattered on entities.
- **`AsNoTracking()`** for every read-only query.
- **Project to DTOs with `.Select()`** — return only needed columns, never raw entities
  to the API surface.
- **Explicit loading strategy**: `Include` for needed relations; avoid lazy loading
  (it hides N+1).
- **Migrations** for every schema change, reviewed before apply; applied via
  `dotnet ef database update` / `Migrate()` in a controlled step (not auto-migrate in
  prod at startup). See `playbooks/database-migration.md`.
- **Transactions** for multi-step writes (`SaveChanges` within an explicit transaction or
  a unit-of-work). Flow `CancellationToken` into every async EF call.
- **Concurrency tokens** (`[Timestamp]`/`rowversion`) on entities where lost updates matter.

## 5. Forbidden Patterns
- ❌ `DbContext` outside repositories (no EF in controllers/services).
- ❌ Lazy loading enabled globally (N+1 generator).
- ❌ Returning tracked entities to the API or mutating across requests.
- ❌ `ToList()` then filtering in memory — filter in the query (server-side).
- ❌ Unbounded queries — always paginate.
- ❌ Raw SQL with string interpolation (use `FromSqlInterpolated`/parameters).
- ❌ Auto-applying migrations to production at app startup.

## 6. Security Requirements
- Parameterized queries only; never concatenate input into SQL.
- Apply row-level authorization in the repository/query (filter by owner/tenant), not
  after fetching. Use global query filters for soft-delete/tenancy where appropriate.

## 7. Performance Requirements
- `AsNoTracking` + projection by default for reads.
- Add indexes for filtered/sorted/joined columns in configuration; review the generated
  SQL with logging in dev. Use `AsSplitQuery()` for large multi-`Include` graphs.
- Batch inserts/updates; avoid per-row round trips. See `rules/06-performance.md`.

## 8. Testing Requirements
- Repository/integration tests run against a **real** database (Testcontainers /
  PostgreSQL), not the in-memory provider (its behavior diverges from real SQL).
- Seed to a known state; wrap each test in a transaction or reset between tests.

## 9. Example
```csharp
// Configuration
public sealed class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Currency).HasMaxLength(3).IsRequired();
        builder.HasIndex(i => new { i.UserId, i.CreatedAt });
        builder.HasOne(i => i.User).WithMany().HasForeignKey(i => i.UserId);
    }
}

// Repository — projection + no-tracking read
public sealed class InvoiceRepository(AppDbContext db) : IInvoiceRepository
{
    public async Task<IReadOnlyList<InvoiceResponse>> ListForUserAsync(
        Guid userId, int skip, int take, CancellationToken cancellationToken) =>
        await db.Invoices
            .AsNoTracking()
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.CreatedAt)
            .Skip(skip).Take(take)
            .Select(i => new InvoiceResponse(i.Id, i.Total, i.Status))
            .ToListAsync(cancellationToken);

    public async Task AddAsync(Invoice invoice, CancellationToken cancellationToken)
    {
        await db.Invoices.AddAsync(invoice, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
    }
}
```

## 10. Review Checklist
- [ ] EF confined to repositories; `DbContext` scoped.
- [ ] Reads use `AsNoTracking` + projection; no entities leak to the API.
- [ ] No lazy loading; relations loaded explicitly; no N+1.
- [ ] Lists paginated; filtering done server-side.
- [ ] Migrations committed and reviewed; not auto-applied in prod.
- [ ] Multi-step writes transactional; `CancellationToken` flowed.
- [ ] Integration tests run on a real database.
