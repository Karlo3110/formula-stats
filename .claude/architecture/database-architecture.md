# Database Architecture

## Purpose
Define how data is modeled, accessed, and evolved so the database is a reliable,
performant, integrity-enforcing source of truth — and remains so as the system scales over
years.

## Principles
- **The database enforces integrity.** Constraints (`NOT NULL`, `UNIQUE`, `CHECK`, foreign
  keys) live in the schema, not only in app code. App validation is a second layer, never
  the only one.
- **PostgreSQL is the system of record.** Redis and other stores are caches/derivations and
  must be reconstructable from it (`rules/data/redis.md`).
- **Access only through repositories** (`backend-architecture.md`) — the ORM is confined to
  one layer.
- **Schema is versioned** via reviewed, forward-only migrations.

## Data Modeling
- Normalize to 3NF by default; denormalize **deliberately** for proven read performance,
  documenting the trade-off and how the copy stays consistent.
- One aggregate = one ownership boundary; cross-aggregate references by id.
- Choose types deliberately: money = `numeric`/integer minor units (never float); time =
  `timestamptz` UTC; enums for fixed states; `jsonb` for genuinely schemaless data (not as
  an escape hatch for things that should be columns). See `rules/data/postgresql.md`.
- Identifiers: consistent PK strategy (UUIDv7 or identity bigint). FKs always constrained
  with an explicit `ON DELETE` policy.

## Indexing Strategy
- Index columns used in `WHERE`, `JOIN`, `ORDER BY`, and all foreign keys.
- Composite indexes ordered by selectivity and query shape; partial indexes for hot
  filtered subsets; unique indexes to enforce business uniqueness.
- Indexes cost writes/storage — add for measured query needs, remove unused/duplicate ones.
  Validate with `EXPLAIN ANALYZE`.

## Access Patterns
- **Pagination always** (keyset/cursor for large sets); no unbounded reads.
- **No N+1** — load relations in one query; project only needed columns
  (`rules/06-performance.md`).
- **Transactions** for every multi-statement write — atomic or nothing.
- **Connection pooling** (PgBouncer/ORM pool); never a connection per request.

## Consistency & Concurrency
- Strong consistency within an aggregate via transactions.
- Optimistic concurrency (version column / `xmin`) where concurrent updates can clobber
  each other.
- Cross-service/eventual consistency handled via events + outbox, not distributed
  transactions (`event-architecture.md`).

## Migrations (Evolution)
- Forward-only, small, reviewed; never edit an applied migration.
- For large tables, prefer non-blocking changes: `CREATE INDEX CONCURRENTLY`; add column
  nullable → backfill in batches → add constraint; expand/contract for renames/type
  changes. Review every migration for locks. See `playbooks/database-migration.md`.

## Reliability
- Automated backups + **tested** restores; point-in-time recovery for prod.
- Multi-AZ for production (`rules/infrastructure/aws.md`). Retention/archival policy for
  large historical tables (partitioning where appropriate).

## Security
- Least-privilege DB roles (app role can't alter schema in prod); TLS; credentials from the
  secret manager. Row-level filtering by owner/tenant (consider RLS for multi-tenant).
  Encrypt sensitive columns; never log PII query params. See `rules/05-security.md`.

## Anti-Patterns
- ❌ Integrity enforced only in app code; "logical" FKs without constraints.
- ❌ `float` money; naive timestamps without timezone.
- ❌ Unbounded queries; N+1; per-request connections.
- ❌ `jsonb` for data that should be relational columns.
- ❌ Editing applied migrations; blocking DDL on big tables in a hot path.
- ❌ Redis (or a cache) treated as the source of truth.

## Example
See `rules/data/postgresql.md` §9 for schema + transactional write examples.

## Related
`backend-architecture.md`, `event-architecture.md`, `rules/data/`,
`playbooks/database-migration.md`.
