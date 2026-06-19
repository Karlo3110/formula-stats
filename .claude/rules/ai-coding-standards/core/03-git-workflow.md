# Git Workflow

Keep history readable and reversible. These rules are minimal on purpose.

## Branches

- `main` is always deployable. No direct commits to `main`.
- Branch naming: `<type>/<short-description>`.
  - `feat/add-game-removal`
  - `fix/image-url-localhost`
  - `chore/upgrade-prisma`
  - `refactor/extract-auth-service`

## Commits — Conventional Commits

Format: `<type>(<optional scope>): <imperative summary>`

```
feat(auth): add refresh token rotation
fix(env): use NEXT_PUBLIC_API_URL for client requests
refactor(sidebar): extract GameList into reusable component
chore(deps): bump nestjs to latest minor
```

Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `build`, `ci`.

Rules:
- One logical change per commit.
- Summary in the imperative mood, under 72 characters, no trailing period.
- Body (optional) explains **why**, not what.

## Pull requests

- Small and focused. One feature or fix per PR.
- PR description states intent, the approach, and how it was verified.
- All checks (typecheck, lint, tests, build) pass before merge.
- Squash-merge into `main` so each PR is one clean commit.

## Never commit

- Secrets, `.env*` files (except `.env.example`).
- Generated build output, `node_modules`, `bin/`, `obj/`.
- Commented-out code or debug logging.

## Windows note

Use cross-platform tooling. Configure `core.autocrlf=true` on Windows, and enforce LF in
the repository via `.gitattributes`:

```
* text=auto eol=lf
```
