# Database Standards

PostgreSQL everywhere. Same conventions, same base entity, same auth schema in every
project. Read with `core/02-naming-conventions.md` and `core/05-security-baseline.md`.

## Naming

- Tables: snake_case, plural — `users`, `user_profiles`, `refresh_tokens`.
- Columns: snake_case — `created_at`, `display_name`.
- Primary key column: `id`.
- Foreign keys: `<singular>_id` — `user_id`.
- Booleans: `is_`/`has_` prefix — `is_active`.
- Indexes: `idx_<table>_<columns>`; unique: `uq_<table>_<columns>`.
- Join tables: both singular names, alphabetical — `permissions_roles`.

## Primary keys and IDs

- Every table has `id` of type `uuid`, generated as **UUID v7** (time-ordered, index-friendly,
  non-enumerable). UUID v7 gives the scalability of random IDs with the locality of
  sequential ones.
- Never expose sequential integer IDs to clients.

## Mandatory columns on every table (base entity)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK, UUID v7. |
| `created_at` | `timestamptz` | Set on insert, never updated. |
| `updated_at` | `timestamptz` | Set on every update. |
| `deleted_at` | `timestamptz null` | Soft delete; `null` = active. |

- Always store timestamps as `timestamptz` (UTC). Never naive timestamps.
- Soft delete by default for user-facing entities. Queries exclude `deleted_at is not null`
  unless explicitly retrieving deleted rows.

## Types and constraints

- Use the narrowest correct type. `text` for strings (no arbitrary `varchar(255)`), with
  length enforced by `check` constraints when there is a real limit.
- Enumerations: prefer a `check` constraint with a small fixed set, or a lookup table when
  values carry metadata. Avoid Postgres native `enum` types (hard to alter).
- All foreign keys have an explicit `on delete` behavior and a covering index.
- Money as `numeric(19,4)`, never floating point.
- Mark `not null` aggressively; nullable is the exception and must be justified.

## Relationships and integrity

- Foreign key constraints are always present (no application-only relationships).
- Index every foreign key.
- Unique business keys (e.g. `users.email`) get a unique index.

## Migrations

- All schema changes go through versioned migrations (Prisma Migrate / EF Core Migrations).
  No manual production DDL.
- **Never edit an already-applied migration.** Add a new one.
- Migrations are forward-only in production; destructive changes are done in safe steps
  (add column → backfill → switch reads/writes → drop old) to avoid downtime.
- The schema in source control is the single source of truth.

## No business logic in the database

- No stored procedures or triggers for business rules. Logic lives in the service layer.
- Triggers are acceptable only for mechanical concerns (e.g. maintaining `updated_at`).

## Querying

- Select only the columns used (`select`/projection). No `select *` reaching the app.
- Paginate all list endpoints (see `backend/api-contract.md`). Never return unbounded sets.
- Add indexes based on real query patterns; do not over-index.

## Canonical auth schema (same in every project)

```
users
  id                uuid pk
  email             text not null            -- uq_users_email
  password_hash     text null                -- null if external/social auth only
  display_name      text not null
  status            text not null default 'PENDING_VERIFICATION'
                                             -- account state machine (see below)
  email_verified_at timestamptz null
  last_login_at     timestamptz null
  created_at        timestamptz not null
  updated_at        timestamptz not null
  deleted_at        timestamptz null

roles
  id              uuid pk
  name            text not null            -- uq_roles_name (e.g. ADMIN, MEMBER)
  created_at      timestamptz not null
  updated_at      timestamptz not null

permissions
  id              uuid pk
  name            text not null            -- uq_permissions_name (e.g. user:delete)
  created_at      timestamptz not null
  updated_at      timestamptz not null

roles_users            -- join: a user has many roles
  role_id         uuid fk -> roles(id)
  user_id         uuid fk -> users(id)
  primary key (role_id, user_id)

permissions_roles      -- join: a role has many permissions
  permission_id   uuid fk -> permissions(id)
  role_id         uuid fk -> roles(id)
  primary key (permission_id, role_id)

refresh_tokens
  id              uuid pk
  user_id         uuid fk -> users(id)     -- idx_refresh_tokens_user_id
  token_hash      text not null            -- store HASH, never the raw token
  expires_at      timestamptz not null
  revoked_at      timestamptz null         -- rotation: old token revoked on refresh
  created_at      timestamptz not null
  updated_at      timestamptz not null
```

Auth model rules:
- Passwords hashed with argon2id (or bcrypt). The raw password never stored or logged.
- Refresh tokens stored as a hash. On each refresh, the used token is revoked and a new one
  issued (rotation). Detect reuse of a revoked token as a compromise signal.
- RBAC resolved via `users → roles → permissions`. Authorization checks use permissions.

## Account state machine (`users.status`)

A single `status` column models the account lifecycle. Transitions are enforced in the
service layer, never set arbitrarily by clients.

| Status | Meaning | Can authenticate |
| --- | --- | --- |
| `PENDING_VERIFICATION` | Registered, email not yet confirmed. | No (or limited) |
| `ACTIVE` | Verified and in good standing. | Yes |
| `SUSPENDED` | Temporarily blocked (admin or abuse). | No |
| `LOCKED` | Locked after repeated failed logins. | No, until unlock |
| `DEACTIVATED` | User-initiated deactivation. | No |

Allowed transitions (examples): `PENDING_VERIFICATION → ACTIVE` (on email verify),
`ACTIVE → LOCKED` (failed-login threshold), `LOCKED → ACTIVE` (unlock/cooldown),
`ACTIVE ↔ SUSPENDED` (admin), `ACTIVE → DEACTIVATED` (user). Every login checks `status`
and rejects non-`ACTIVE` accounts with the appropriate error.

Ephemeral auth tokens (email verification codes, password-reset tokens) are short-lived and
stored in **Redis with a TTL** (`backend/caching-redis.md`), not in long-lived DB tables.
Only durable records (users, refresh tokens) live in PostgreSQL.

## Multi-tenancy (when applicable)

- If the product is multi-tenant, every tenant-scoped table includes `tenant_id uuid not null`
  with an index, and every query filters by the current tenant. Decide tenancy at project
  start; do not retrofit.

## Example Prisma base model

```prisma
model User {
  id              String    @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  email           String    @unique
  passwordHash    String?   @map("password_hash")
  displayName     String    @map("display_name")
  status          String    @default("PENDING_VERIFICATION")
  emailVerifiedAt DateTime? @map("email_verified_at") @db.Timestamptz
  lastLoginAt     DateTime? @map("last_login_at") @db.Timestamptz
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz

  @@map("users")
}
```
