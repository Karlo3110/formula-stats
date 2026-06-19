# AWS Standards

## 1. Overview
AWS hosts backend services and managed infrastructure. Everything is **Infrastructure as
Code**, least-privilege by default, multi-AZ for production, and observable. No
click-ops for anything that must be reproducible.

## 2. Approved Patterns
- **Infrastructure as Code** (Terraform/CDK) for all resources, versioned and reviewed via
  PR. State stored remotely (S3 + DynamoDB lock) and encrypted.
- **IAM least privilege**: scoped roles per service; no wildcards (`*:*`); no long-lived
  user keys for workloads — use instance/task roles and OIDC for CI.
- **Secrets in Secrets Manager / SSM Parameter Store** (encrypted with KMS); injected at
  runtime. Never in code, AMIs, or task definitions as plaintext.
- **Networking**: private subnets for compute and data; public only for load balancers;
  security groups scoped to required ports/sources; no `0.0.0.0/0` ingress except on the
  LB/WAF.
- **Multi-AZ** for production databases (RDS) and stateless services; autoscaling on
  compute.
- **Managed services first** (RDS, ElastiCache, SQS, S3, ECS/EKS, Lambda) over
  self-managed equivalents.
- **Encryption everywhere**: at rest (KMS) and in transit (TLS). S3 buckets private with
  Block Public Access on.
- **Tagging** for ownership, environment, and cost allocation on every resource.

## 3. Forbidden Patterns
- ❌ Click-ops changes to production resources (drift from IaC).
- ❌ Wildcard IAM policies or long-lived access keys for services.
- ❌ Public S3 buckets / databases reachable from the internet.
- ❌ Secrets in code, env files in repo, Lambda env vars in plaintext, or AMIs.
- ❌ Single-AZ production data stores.
- ❌ Security groups open to `0.0.0.0/0` on app/data ports.
- ❌ Unencrypted volumes, buckets, or snapshots.

## 4. Security Requirements
- KMS-managed encryption; rotate keys and secrets. Enforce TLS.
- CloudTrail enabled (audit), GuardDuty/Security Hub for threat detection, Config rules to
  flag drift/non-compliance.
- WAF in front of public endpoints; least-privilege everywhere. See `rules/05-security.md`.

## 5. Reliability / Performance
- Multi-AZ + health-checked autoscaling; backups + tested restores for stateful services
  (RDS automated backups + PITR).
- Right-size and use the cost-appropriate compute (Fargate/Lambda for spiky/idle, EC2/EKS
  for steady high load). Set CloudWatch alarms on the golden signals.

## 6. Cost
- Tag for cost allocation; set budgets/alerts; clean up unused resources; prefer
  serverless/managed to reduce idle spend.

## 7. Observability
- Centralized logs (CloudWatch Logs), metrics, and traces (X-Ray/OpenTelemetry);
  alarms wired to on-call. See `rules/observability/`.

## 8. Deployment
- CI assumes a deploy role via OIDC (no static keys). Immutable artifacts promoted across
  environments. Infra changes go through `plan` review before `apply`.
  See `architecture/deployment-architecture.md`.

## 9. Review Checklist
- [ ] Resource defined in IaC, reviewed; no console-only changes.
- [ ] IAM scoped (no wildcards); no long-lived keys; OIDC for CI.
- [ ] Secrets in Secrets Manager/SSM + KMS; nothing plaintext.
- [ ] Private subnets; scoped security groups; no public data stores.
- [ ] Encryption at rest + in transit; S3 Block Public Access on.
- [ ] Multi-AZ for prod data; backups + restore tested.
- [ ] Tags, alarms, and audit logging in place.
