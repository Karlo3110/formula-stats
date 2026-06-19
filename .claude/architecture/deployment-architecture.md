# Deployment Architecture

## Purpose
Define how code goes from a merged PR to production safely, repeatably, and reversibly.
Deployments are automated, observable, and boring — the exciting part should be the
feature, not the release.

## Principles
- **Build once, promote the same artifact.** The image/bundle tested in CI is the exact
  one that reaches production — never rebuilt per environment.
- **Immutable artifacts**, tagged with the git SHA. Configuration comes from the
  environment, not the artifact (`rules/infrastructure/docker.md`).
- **Everything automated through CI/CD.** No manual builds or hand-deploys to production.
- **Reversible.** Every deploy has a one-step rollback.
- **Progressive where risk warrants** (canary/rolling/blue-green).

## Environments
```
local → CI (ephemeral) → preview (per PR) → staging → production
```
- **Preview** — automatic per-PR deploy (Vercel preview / ephemeral env) for review + E2E.
- **Staging** — production-like; final integration/smoke tests; runs prod migrations first.
- **Production** — multi-AZ, monitored, alerted.
Each environment has isolated data, secrets, and config (`rules/05-security.md`).

## Pipeline (Gates)
```
PR ▶ lint ▶ typecheck ▶ unit+integration tests ▶ security scan (deps + image) ▶ build artifact
   ▶ deploy PREVIEW ▶ E2E ▶  (merge) ▶ deploy STAGING ▶ smoke ▶ deploy PROD ▶ post-deploy checks
```
A red gate blocks promotion. The same green artifact flows rightward.

## Database Migrations In Deploys
- Migrations run as a **separate, controlled step before** the new app version starts —
  never auto-applied at app startup in prod (`rules/backend/entity-framework.md`,
  `rules/data/postgresql.md`).
- Use **expand/contract** so schema and code stay compatible across the rollout window:
  add (backward-compatible) → deploy code that uses it → backfill → remove the old shape in
  a later release. This keeps deploys zero-downtime and rollbacks safe.
  See `playbooks/database-migration.md`.

## Release Strategies
- **Rolling** (default for stateless services): replace instances gradually with health
  checks (`rules/infrastructure/kubernetes.md`).
- **Canary / rolling releases**: route a small % to the new version, watch metrics, then
  ramp (Vercel rolling releases, mesh traffic splitting).
- **Blue-green**: stand up the new version alongside, switch traffic, keep the old for
  instant rollback.
- **Feature flags** decouple deploy from release — ship dark, enable gradually, kill
  instantly without redeploying.

## Rollback
- One-step: re-promote the previous artifact (Vercel: promote prior deployment; K8s:
  `rollout undo`; blue-green: switch back).
- Forward-fix only when rollback is impossible (e.g., a destructive migration — which is
  why migrations are expand/contract and backward-compatible).
- Rollback steps are written in the PR's risk/rollback notes
  (`rules/10-git-and-version-control.md`).

## Zero-Downtime Requirements
- Graceful shutdown (drain in-flight, `SIGTERM`); readiness gates before receiving traffic.
- Backward/forward-compatible API and schema across the rollout window.
- Health + readiness probes wired (`rules/observability/monitoring-metrics.md`).

## Post-Deploy Verification
- Automated smoke tests on the critical path; watch error rate, latency, and key business
  metrics for a defined bake period; alerts armed. Auto-rollback on SLO breach where
  supported.

## Security In The Pipeline
- CI authenticates to cloud via OIDC short-lived roles — no static keys
  (`rules/infrastructure/aws.md`). Secrets injected at deploy from the secret manager.
  Dependency + image scanning gate the build (`rules/05-security.md`).

## Anti-Patterns
- ❌ Rebuilding per environment; deploying an untested artifact.
- ❌ Manual production deploys / dashboard click-ops.
- ❌ Auto-migrating prod at app startup; backward-incompatible migration + code in one shot.
- ❌ No rollback path; mutating running prod instead of redeploying.
- ❌ Secrets baked into artifacts; long-lived CI cloud keys.

## Related
`rules/infrastructure/` (Docker, Kubernetes, Vercel, AWS), `playbooks/database-migration.md`,
`playbooks/production-incident.md`, `rules/10-git-and-version-control.md`.
