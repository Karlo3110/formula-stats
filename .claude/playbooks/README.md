# Engineering Playbooks

Step-by-step procedures for recurring engineering tasks. A playbook is a **runbook**: it
tells you the order of operations, the standards that apply at each step, and the
definition of done — so the work is consistent regardless of who (or which AI agent) does
it.

Every playbook follows the same spine:

1. **Plan** — understand the requirement, design the change, identify impact.
2. **Implement** — build it per the relevant `rules/` and `architecture/`.
3. **Test** — prove it works and won't regress (`rules/07-testing.md`).
4. **Document** — update docs, types, API specs, changelog.
5. **Deploy** — ship safely (`architecture/deployment-architecture.md`).
6. **Verify** — confirm in the target environment; watch telemetry.

## Index
- [new-feature.md](new-feature.md) — building a new end-to-end capability
- [bug-fix.md](bug-fix.md) — diagnosing and fixing a defect
- [api-endpoint.md](api-endpoint.md) — adding an HTTP endpoint
- [database-migration.md](database-migration.md) — evolving the schema safely
- [stripe-integration.md](stripe-integration.md) — payment work
- [authentication-feature.md](authentication-feature.md) — auth/identity work
- [new-page.md](new-page.md) — adding a frontend page
- [background-job.md](background-job.md) — async/queued work
- [refactor.md](refactor.md) — improving structure without changing behavior
- [production-incident.md](production-incident.md) — responding to an outage

> Pair each playbook with `checklists/` (the gate) and the matching `examples/` (the shape).
