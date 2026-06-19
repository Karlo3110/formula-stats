# Playbook: Database Migration

> Evolve the schema with zero downtime, no data loss, and a safe rollback. Migrations are
> the riskiest routine change we make — treat them with care.

## 1. Plan
- [ ] Define the schema change and **why**. Model it per `architecture/database-architecture.md`
      and `rules/data/postgresql.md` (types, constraints, indexes, naming).
- [ ] Classify the change:
  - **Additive** (new nullable column, new table, new index) — low risk.
  - **Destructive/altering** (drop/rename column, change type, add NOT NULL/unique to
    existing data) — high risk; requires **expand/contract**.
- [ ] Assess table size and lock impact. Large tables need non-blocking strategies.
- [ ] Plan backward compatibility: the schema must work with **both** the old and new app
      versions during the rollout window (`architecture/deployment-architecture.md`).

## 2. Implement (Expand → Migrate → Contract)
For anything beyond a simple additive change, split across releases:
- [ ] **Expand** — add the new shape backward-compatibly (new column nullable; new table;
      `CREATE INDEX CONCURRENTLY`). Deploy. Old code still works.
- [ ] **Backfill** — populate/migrate data in **batches** (not one giant locking
      statement); make it resumable and idempotent.
- [ ] **Migrate code** — switch the app to read/write the new shape. Deploy.
- [ ] **Contract** — in a later release, drop the old column/constraint once nothing uses
      it. Deploy.

Generate via the ORM (`prisma migrate dev` / `dotnet ef migrations add`), **review the
generated SQL** for locks, and commit it. Never edit an applied migration
(`rules/data/postgresql.md` §8).

## 3. Test
- [ ] Run the migration against a copy of production-like data; time it; check locks.
- [ ] Test the backfill on a realistic dataset; verify correctness and resumability.
- [ ] Integration tests run against the migrated schema (real DB, not in-memory).
- [ ] Verify rollback/down path or the contract-later plan.

## 4. Document
- [ ] PR notes the strategy (additive vs. expand/contract), lock impact, backfill plan, and
      rollback. Update `shared/`/entity types and the data model docs.

## 5. Deploy
- [ ] Migrations run as a **separate controlled step before** the new app version starts —
      never auto-applied at app startup in prod (`rules/backend/entity-framework.md`).
- [ ] Apply to staging first, then production. Sequence releases for expand/contract.
- [ ] Have the rollback ready (re-promote prior app version; the schema stays
      backward-compatible so this is safe).

## 6. Verify
- [ ] Confirm schema + data post-migration; spot-check backfilled rows.
- [ ] Watch DB metrics (locks, latency, errors), app error rate, and query performance
      (`rules/observability/monitoring-metrics.md`).
- [ ] Confirm the new indexes are used (`EXPLAIN ANALYZE`).

## Definition of Done
Schema correct + constrained + indexed · backward-compatible across rollout · backfill
verified · migration reviewed for locks + committed · applied via controlled step · rollback
ready · verified in prod.

## Anti-Patterns
❌ Editing applied migrations · ❌ blocking DDL on big tables in a hot path · ❌ destructive
change + dependent code in one release · ❌ unbatched backfill · ❌ auto-migrate at startup.
