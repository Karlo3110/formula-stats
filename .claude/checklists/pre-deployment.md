# Pre-Deployment Checklist

> Run before shipping to production. Backs `architecture/deployment-architecture.md`.
> Goal: a safe, reversible, observable release.

## Build & Pipeline
- [ ] CI fully green: lint, typecheck, unit, integration, E2E, security/dependency scan.
- [ ] The exact artifact tested in CI is the one being promoted (build once, promote) —
      not rebuilt per environment.
- [ ] Artifact is immutable and tagged with the git SHA.

## Configuration & Secrets
- [ ] All required env vars/secrets exist in the target environment (validated at boot).
- [ ] Secrets come from the secret manager; nothing baked into the artifact; correct
      `NEXT_PUBLIC_` boundary.
- [ ] Feature flags set to the intended initial state (ship dark if risky).

## Database Migrations (if any)
- [ ] Migration reviewed for locks; backward-compatible (works with old + new code).
- [ ] Runs as a **separate controlled step before** the new version starts — not at app
      startup.
- [ ] Backfill (if any) is batched, resumable, and tested on production-like data.
- [ ] Applied to staging successfully first.

## Compatibility & Rollout
- [ ] API/schema changes are backward/forward-compatible across the rollout window
      (expand/contract).
- [ ] Rollout strategy chosen (rolling/canary/blue-green) appropriate to risk.
- [ ] Graceful shutdown + readiness gates in place (zero-downtime).

## Rollback
- [ ] One-step rollback verified available (re-promote prior artifact / `rollout undo` /
      traffic switch / flag off).
- [ ] Rollback steps written in the PR's risk/rollback notes.
- [ ] If rollback is impossible (destructive migration), a forward-fix plan is documented.

## Observability & Verification Plan
- [ ] Dashboards and alerts are armed for the affected services/metrics.
- [ ] Smoke tests defined for the critical path post-deploy.
- [ ] A bake/monitoring window is planned; owner is watching error rate, latency, and key
      business metrics after release.

## Communication
- [ ] Stakeholders aware of the deploy and any expected impact/maintenance window.
- [ ] Deploy timed sensibly (avoid high-traffic windows / end-of-day for risky changes).

---
**Gate:** no green CI, no verified rollback, or an untested/blocking migration = do not
ship. After deploy, verify on the live environment before calling it done.
