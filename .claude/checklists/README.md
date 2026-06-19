# Checklists

The **gates**. A checklist is the final, scannable verification that work meets the
standard before it advances. Copy the relevant list into your PR description (or run it
mentally) and confirm every box.

A checklist is a safety net, not a substitute for judgment — but an unchecked box is a
blocking issue until it's resolved or explicitly waived with a reason.

## Index
- [definition-of-done.md](definition-of-done.md) — is this work actually complete?
- [pr-review.md](pr-review.md) — the review gate (author + reviewer)
- [security-review.md](security-review.md) — for anything touching auth, data, input, money
- [performance-review.md](performance-review.md) — for data/UI-heavy or hot-path changes
- [accessibility-review.md](accessibility-review.md) — for any frontend UI
- [pre-deployment.md](pre-deployment.md) — before shipping to production

## When To Use Which
| Change type | Run |
|-------------|-----|
| Any PR | definition-of-done + pr-review |
| Auth / data / input / payments | + security-review |
| Queries, lists, hot paths, UI lists | + performance-review |
| Any user-facing UI | + accessibility-review |
| Before a production deploy | pre-deployment |
