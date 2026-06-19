# Docker Standards

## 1. Overview
Containers are reproducible, minimal, and immutable. An image is built once and promoted
unchanged through environments; configuration comes from the environment, not the image.

## 2. Version Requirements
- Multi-stage builds. Pinned base image **digests** (not floating `latest`).
- BuildKit enabled. A `.dockerignore` that excludes `node_modules`, `.git`, `.env*`, tests,
  and build artifacts.

## 3. Approved Patterns
- **Multi-stage builds**: a build stage with dev deps/toolchain, a slim runtime stage that
  copies only the built artifact and production dependencies.
- **Minimal base images**: `node:20-slim`/`alpine`, distroless, or `mcr.microsoft.com/dotnet/aspnet`.
- **Run as non-root**: create and switch to an unprivileged user.
- **Layer ordering for cache**: copy lockfiles and install deps before copying source, so
  dependency layers cache across code changes.
- **One process per container**; let the orchestrator handle restarts and scaling.
- **`HEALTHCHECK`** defined; **`EXPOSE`** documents ports.
- **Read-only root filesystem** where possible; writable paths via mounted volumes.
- Configuration and secrets injected at runtime (env / mounted secrets), never baked in.

## 4. Forbidden Patterns
- ❌ `FROM image:latest` or unpinned bases.
- ❌ Running as root.
- ❌ Secrets, `.env`, or credentials copied into the image or in build args that persist.
- ❌ Installing dev/build tooling in the runtime image.
- ❌ `ADD` from URLs; use `COPY` (and verified downloads).
- ❌ `apt-get upgrade`/unpinned package installs that make builds non-reproducible.
- ❌ Mutating running containers (`docker exec` fixes) instead of rebuilding.

## 5. Security Requirements
- Non-root user; drop Linux capabilities; read-only FS where feasible.
- Scan images for CVEs in CI (Trivy/Grype); fail on highs/criticals.
- Pin digests; rebuild regularly to pick up base-image patches.
- No secrets in layers — verify with history inspection. Use BuildKit secret mounts for
  build-time credentials so they don't persist.

## 6. Performance / Size
- Keep images small (slim/distroless, multi-stage, prune caches in the same layer).
- Order layers for maximum cache reuse; combine related `RUN` steps; clean apt lists.

## 7. Example
```dockerfile
# ---- build ----
FROM node:20-slim@sha256:<digest> AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# ---- runtime ----
FROM node:20-slim@sha256:<digest> AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN useradd --system --uid 1001 appuser
COPY --from=build --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appuser /app/dist ./dist
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node dist/health-check.js || exit 1
CMD ["node", "dist/main.js"]
```

## 8. Testing / CI
- Build in CI; run the image and hit its health endpoint before publishing.
- Tag images with the immutable git SHA; promote the same digest across environments.

## 9. Review Checklist
- [ ] Multi-stage; pinned base digest; `.dockerignore` present.
- [ ] Non-root user; minimal runtime image; no build tooling in runtime.
- [ ] No secrets/`.env` in the image; CVE scan passes.
- [ ] `HEALTHCHECK` defined; config injected at runtime.
- [ ] Layers ordered for cache; image size reasonable.
