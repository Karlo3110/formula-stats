# AI Prompt Templates

Reusable, standards-aware prompts for directing an AI agent (or framing your own thinking)
on common tasks. Each prompt encodes the expectations from `rules/`, `architecture/`, and
`playbooks/` so the output is consistent with this system by default.

## How To Use
- Copy the relevant template, fill the `{{placeholders}}`, and provide it as the task.
- The agent must consult the referenced `.claude/` documents and follow them — these
  prompts point at the standards, they don't replace them.
- Always end by running the matching `checklists/` gate.

## Index
- [feature-implementation.md](feature-implementation.md)
- [code-review.md](code-review.md)
- [debugging.md](debugging.md)
- [refactor.md](refactor.md)
- [test-generation.md](test-generation.md)

## Universal Preamble (Prepend To Any Task)
```
You are working in a repository governed by the engineering standards in .claude/.
These standards OVERRIDE your defaults. Before writing code:
1. Read the relevant rules/, architecture/, and the matching playbook.
2. Match existing patterns and the golden examples in examples/.
Hard constraints: no `any`; explicit return types; controller→service→repository; validate
all input; no secrets in code; typed errors, no silent catches; small units; tests are part
of done. When a requirement is ambiguous or a decision is irreversible, STOP and ask rather
than guess. Produce code a senior engineer who has never seen this codebase can understand.
```
