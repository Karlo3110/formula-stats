# AI Coding Standards

A fixed, reusable engineering ruleset for React, Next.js, NestJS, and .NET projects.
Drop this folder into any repository and an AI agent (or a human) will produce code with
consistent structure, naming, security, and design.

## What this is

A set of focused, single-responsibility rule files. Each technology has its own file so
the agent only loads what is relevant. `CLAUDE.md` is the master entry point and lists the
non-negotiable rules.

## Structure

```
ai-coding-standards/
├── CLAUDE.md                       # Master entry — read first
├── README.md                       # This file
├── core/
│   ├── 00-principles.md            # Universal engineering rules
│   ├── 01-typescript.md            # TypeScript rules (no any, explicit typing)
│   ├── 02-naming-conventions.md    # Naming for every layer
│   ├── 03-git-workflow.md          # Commits, branches, PRs
│   ├── 04-env-and-config.md        # env/ folder, secrets, config validation
│   ├── 05-security-baseline.md     # Mandatory security defaults
│   └── 06-solid.md                 # SOLID principles with examples
├── frontend/
│   ├── react.md                    # React component rules
│   ├── nextjs.md                   # Next.js App Router rules
│   ├── design-system.md            # Colors, typography, spacing, components
│   ├── routing-layouts-guards.md   # Layouts, routing, guards, auth state, utils
│   ├── graphql-codegen.md          # GraphQL folder + codegen + typed operations
│   └── i18n.md                     # Translations
├── backend/
│   ├── api-contract.md             # Shared REST request/response/error contract
│   ├── graphql.md                  # GraphQL + REST/GraphQL decision matrix
│   ├── websockets.md               # Real-time rules
│   ├── caching-redis.md            # Redis caching strategy
│   ├── nestjs.md                   # NestJS layering and rules
│   └── dotnet.md                   # ASP.NET Core layering and rules
└── database/
    └── database-standards.md       # Schema, migrations, auth tables, account states
```

## How to bootstrap a new project

1. Copy `ai-coding-standards/` into the new repository.
2. Create a project `CLAUDE.md` at the repo root containing:
   ```
   Follow every rule in ./ai-coding-standards/CLAUDE.md and the technology files it links.
   This is a <Next.js | NestJS | .NET> project. Read the matching rule files before writing code.
   ```
3. Scaffold the folder structure described in the relevant technology file.
4. Copy `.env.example` patterns from `core/04-env-and-config.md`.
5. Apply the base database schema (base entity + auth tables) from `database/database-standards.md`.
6. Start shipping.

## Why these choices

The stack is fixed on purpose. A single, opinionated, scalable stack means every project
starts from the same shape: same auth, same database conventions, same design system, same
request/response contract. That repeatability is what makes shipping fast and safe.

See `CLAUDE.md` for the canonical stack and the ten overriding rules.
