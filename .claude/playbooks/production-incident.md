# Playbook: Production Incident

> Something is broken in production. Restore service first, find the cause second, prevent
> recurrence third. Stay calm, communicate, and don't make it worse.

## 0. The Order Of Priorities
1. **Stop the bleeding** (restore service / mitigate impact).
2. **Communicate** (stakeholders + status).
3. **Diagnose root cause** (after impact is contained).
4. **Fix forward / prevent recurrence**.
Mitigation beats diagnosis. A fast rollback that restores service beats a slow perfect fix.

## 1. Detect & Triage
- [ ] Confirm it's real (alert, dashboard, report). Establish **severity**: who/what is
      impacted and how badly.
- [ ] Declare an incident; assign an **incident commander** (coordinates) and a **scribe**
      (timeline). For high severity, page on-call.
- [ ] Open a comms channel; post an initial status with known impact and "investigating."

## 2. Mitigate (Stop The Bleeding)
- [ ] Reach for the fastest safe mitigation:
  - **Roll back** to the last known-good deployment (`architecture/deployment-architecture.md`:
    one-step rollback). Usually the first and best move if the incident followed a deploy.
  - **Toggle a feature flag** off.
  - **Scale up / shed load / enable rate limiting / circuit-break** a failing dependency.
- [ ] Verify the mitigation actually restored service (watch the golden signals recover).
- [ ] Update status: impact mitigated / monitoring.

## 3. Diagnose (Once Stable)
- [ ] Use telemetry to find the cause: error spikes (Sentry), latency/saturation
      (dashboards), and the **correlation/trace id** to follow a failing request end to end
      (`rules/observability/`). Correlate with recent deploys/migrations/config changes.
- [ ] Form and test a hypothesis. Don't guess-and-poke production.

## 4. Resolve
- [ ] Apply the real fix following `playbooks/bug-fix.md` (root cause + regression test).
      For an urgent hotfix, still get a review and CI green; never skip safety to rush.
- [ ] If a migration/data corruption is involved, plan remediation/backfill carefully
      (`playbooks/database-migration.md`).
- [ ] Confirm full recovery; close the incident with a final status update.

## 5. Document (During & After)
- [ ] Scribe keeps a **timeline**: detection, actions, effects, resolution.
- [ ] Write a **blameless post-mortem**: impact, timeline, root cause, contributing factors,
      what went well/poorly, and concrete **action items** with owners.
- [ ] Update runbooks/alerts/standards so this class of failure is caught earlier or
      prevented (e.g., a missing alert, a fragile pattern → update `.claude/`).

## 6. Verify & Prevent
- [ ] Confirm metrics are fully normal and stable post-fix.
- [ ] Track post-mortem action items to completion (add monitoring, add the regression test,
      harden the pattern, fix the gap that let it ship).

## Principles
- **Blameless**: focus on systems and process, not individuals.
- **Mitigate before diagnose**; **communicate early and often**.
- **One change at a time** under pressure, observing effect — don't shotgun fixes.
- Every incident must leave the system **measurably harder to break the same way**.

## Definition of Done
Service restored · stakeholders informed throughout · root cause found · real fix shipped
with a regression test · blameless post-mortem written · prevention action items tracked.
