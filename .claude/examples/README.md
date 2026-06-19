# Golden Examples

Production-ready reference implementations that embody every standard in this system.
When starting new work, copy the *shape* of these examples. They demonstrate, end to end:

- Clean Architecture & layer separation (`controller → service → repository`)
- Strong typing, explicit return types, no `any`
- Input validation, typed domain exceptions, central error handling
- Transactions, pagination, no N+1
- Dependency injection and testability
- Tests that assert behavior, beside the code

## Contents

### `backend/` — A complete NestJS feature module (`users`)
A self-contained feature showing the full request lifecycle:
```
backend/users/
├── users.module.ts              # wiring
├── users.controller.ts          # thin HTTP transport
├── users.service.ts             # business logic + orchestration
├── users.repository.ts          # the only ORM-touching layer
├── dto/                         # validated request DTOs + response DTOs
├── entities/                    # domain entity
├── exceptions/                  # typed domain exceptions
├── types/                       # feature types
└── users.service.spec.ts        # behavior-focused unit tests
```

### `frontend/` — A complete Next.js feature slice (`users`)
```
frontend/users/
├── UsersPage.tsx                # Server Component: composition + data fetch
├── components/                  # feature components (client where needed)
├── hooks/                       # TanStack Query hooks
├── api/                         # typed, Zod-validated API client + query keys
└── types/                       # feature types
```

## How To Use
- Mirror the structure and naming for your own features (`rules/04-file-organization.md`,
  `rules/03-naming-conventions.md`).
- Keep the layer boundaries intact — the value of the example is the *separation*, not the
  domain.
- Pair with the matching playbook (`playbooks/new-feature.md`, `playbooks/api-endpoint.md`,
  `playbooks/new-page.md`).

> These are illustrative reference files. Import paths/aliases assume the canonical
> structure; adapt them to the actual project's `tsconfig` path aliases.
