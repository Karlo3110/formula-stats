# Kubernetes Standards

## 1. Overview
Workloads are stateless, declaratively defined, self-healing, and resource-bounded.
Manifests are versioned in git; clusters are reconciled to git (GitOps), never changed by
hand.

## 2. Version Requirements
- Kubernetes **1.28+**. Manifests via Helm or Kustomize. GitOps via Argo CD/Flux.

## 3. Approved Patterns
- **Declarative manifests in git**; apply via CI/GitOps, not `kubectl edit` in prod.
- **Resource `requests` and `limits`** on every container (CPU + memory) — required for
  scheduling and to prevent noisy-neighbor failures.
- **Liveness, readiness, and startup probes** on every workload (back the app endpoints
  from `rules/observability/monitoring-metrics.md`).
- **Non-root, read-only root FS** via `securityContext`; drop all capabilities.
- **Config via ConfigMaps; secrets via Secrets** (sealed/external secrets operator) —
  never plaintext in manifests or images.
- **Horizontal Pod Autoscaler** for scalable services; **PodDisruptionBudget** to protect
  availability during drains.
- **Rolling updates** with `maxUnavailable`/`maxSurge`; graceful shutdown
  (`terminationGracePeriodSeconds`, `SIGTERM` handling, `preStop`).
- **Namespaces per environment/team**; **NetworkPolicies** default-deny ingress/egress.
- **Labels** follow the recommended `app.kubernetes.io/*` scheme.

## 4. Forbidden Patterns
- ❌ Containers without resource requests/limits.
- ❌ Missing health probes.
- ❌ Plaintext secrets in manifests or committed values files.
- ❌ Running privileged / as root / with a writable root FS unnecessarily.
- ❌ `latest` image tags (use immutable SHA tags).
- ❌ `kubectl apply`/`edit` directly against prod (drift from git).
- ❌ `hostNetwork`/`hostPath` unless explicitly justified and reviewed.
- ❌ Storing state in pods (use managed databases/volumes).

## 5. Security Requirements
- RBAC least-privilege per ServiceAccount; no cluster-admin for apps.
- `securityContext`: `runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation:
  false`, `capabilities.drop: [ALL]`.
- NetworkPolicies restrict traffic to what's needed; secrets encrypted at rest.
- Admission policy (OPA/Kyverno) to enforce these rules cluster-wide.

## 6. Performance / Reliability
- Right-size requests/limits from observed usage; revisit with metrics.
- HPA targets and PDBs tuned to real traffic; spread replicas across zones
  (topology spread constraints).

## 7. Example (Deployment excerpt)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: billing-api
  labels: { app.kubernetes.io/name: billing-api }
spec:
  replicas: 3
  strategy: { type: RollingUpdate, rollingUpdate: { maxUnavailable: 0, maxSurge: 1 } }
  template:
    spec:
      securityContext: { runAsNonRoot: true, runAsUser: 1001 }
      containers:
        - name: api
          image: registry/billing-api@sha256:<digest>
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
          readinessProbe: { httpGet: { path: /health/ready, port: 3000 }, initialDelaySeconds: 5 }
          livenessProbe:  { httpGet: { path: /health/live,  port: 3000 }, initialDelaySeconds: 10 }
          securityContext:
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
            capabilities: { drop: ["ALL"] }
          envFrom: [{ configMapRef: { name: billing-config } }]
```

## 8. Review Checklist
- [ ] Requests/limits set; all three probes present.
- [ ] Non-root, read-only FS, caps dropped, no privilege escalation.
- [ ] Secrets via Secret manager, not plaintext; config via ConfigMap.
- [ ] Immutable image tags (SHA); rolling update + graceful shutdown.
- [ ] HPA + PDB for scalable services; NetworkPolicy in place.
- [ ] Manifests in git; applied via GitOps, not manual edits.
