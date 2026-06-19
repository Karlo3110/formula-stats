# Git & Version Control

> History is documentation. A clean, intention-revealing history lets anyone understand
> *why* the code is the way it is, bisect a regression, and review changes safely.

---

## 1. Branching Model

- `main` is always deployable. It is protected: no direct pushes, no force-pushes.
- Work happens on short-lived branches off `main`, named `type/short-description`:
  - `feat/invoice-pdf-export`
  - `fix/login-rate-limit`
  - `chore/bump-nest-11`
  - `refactor/extract-payment-service`
- Keep branches small and short-lived (ideally < 2 days). Long-lived branches drift and
  produce painful merges. Rebase on `main` frequently.

---

## 2. Conventional Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <imperative summary, ≤ 72 chars>

<body: what & why, wrapped at 72 cols. Not "how" — the diff shows how.>

<footer: BREAKING CHANGE: …, Refs: #123>
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `revert`.

```
feat(billing): add idempotent invoice charge endpoint

Charging could double-bill when Stripe retried a webhook. Add an
idempotency key keyed on the invoice id so repeat deliveries are no-ops.

Refs: #482
```

- **Imperative mood**: "add", not "added"/"adds".
- One logical change per commit. A commit should build and pass tests on its own.
- Never mix a refactor with a behavior change in one commit (`rules/00` §8).

---

## 3. Commit Hygiene

- Commit small and often locally; tidy the branch before review (squash WIP/"fix typo"
  noise into meaningful commits).
- Never commit: secrets, `.env*` (except `.env.example`), build artifacts, `node_modules`,
  large binaries, or commented-out code. Keep `.gitignore` current.
- If a secret is ever committed, treat it as leaked: rotate it, then purge history.

---

## 4. Pull Requests

- Every change merges via PR. No direct commits to `main`.
- A PR is **small and focused** — one feature or fix. If you can't review it in ~20
  minutes, split it.
- The PR description states: **what** changed, **why**, how it was **tested**, and any
  **risk / rollback** notes. Link the issue.
- The author completes `checklists/pr-review.md` before requesting review.
- CI (lint, typecheck, tests, security scan) must be green. A red pipeline blocks merge.
- At least one approving review from someone who didn't write the code.

---

## 5. Merging

- **Squash-merge** feature branches into `main` so history is one clean commit per PR with
  a Conventional Commit title. (Use merge commits only for long-running release branches.)
- Delete the branch after merge.
- Never force-push a shared branch. Rewrite history only on your own un-shared branch.

---

## 6. Reviews

- Review for correctness, security, readability, and adherence to these standards — not
  personal style (the linter owns style).
- Be specific and kind; suggest, don't decree. Distinguish blocking issues from nits
  (prefix nits with `nit:`).
- The author addresses or explicitly responds to every comment before merge. Unresolved
  threads block merge.

---

## 7. Releases & Tags

- Tag releases with semantic versioning: `vMAJOR.MINOR.PATCH`.
- Generate the changelog from Conventional Commits.
- A `revert` is a first-class, traceable action (`git revert`), never a silent
  force-push that erases history.

---

## 8. Co-Authoring & Attribution

When pairing or when an AI agent contributes, attribute it in the commit trailer so
authorship is honest and traceable:

```
Co-Authored-By: Name <email>
```
