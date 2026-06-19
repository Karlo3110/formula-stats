# File & Module Organization

> Where code lives, how big it gets, and how it is split. Predictable structure means a
> new engineer can find anything in seconds.

---

## 1. Canonical Repository Structure

```
/
├── Frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # App Router routes (pages, layouts, route handlers)
│   │   ├── components/
│   │   │   ├── ui/           # Primitives: Button, Input, Modal
│   │   │   └── features/     # Feature-specific composed components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/
│   │   │   ├── api/          # Typed API client functions
│   │   │   ├── utils/        # Pure utility functions
│   │   │   └── constants/    # App constants
│   │   ├── types/            # Shared TypeScript types
│   │   ├── styles/           # Global styles, theme
│   │   └── providers/        # React context providers
│   ├── public/
│   └── .env.local
│
├── Backend/                  # NestJS application
│   ├── src/
│   │   ├── modules/          # Feature modules (see §3)
│   │   │   └── [feature]/
│   │   │       ├── [feature].module.ts
│   │   │       ├── [feature].controller.ts
│   │   │       ├── [feature].service.ts
│   │   │       ├── [feature].repository.ts
│   │   │       ├── dto/
│   │   │       ├── entities/
│   │   │       └── types/
│   │   ├── common/           # Shared cross-cutting code
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   └── utils/
│   │   ├── config/           # Configuration module
│   │   ├── database/         # DB setup, migrations, base repository
│   │   └── main.ts
│   └── .env.local
│
├── shared/                   # Types shared between FE and BE (optional)
│   └── types/
│
└── .claude/                  # Engineering standards (this system)
```

**Enforcement:**
- Never create files outside this structure without explicit approval.
- Never flatten modules or merge unrelated features.
- Always create both `Frontend/` and `Backend/` at the project root for full-stack work.

---

## 2. Size Limits

| Unit | Target | Hard ceiling | On exceeding |
|------|--------|--------------|--------------|
| Function | < 50 lines | 80 lines | Extract helpers / split responsibilities |
| Class | < 300 lines | 400 lines | Extract a service / collaborator |
| File | < 500 lines | 600 lines | Split into focused modules |
| Function params | ≤ 3 | 4 | Introduce a parameter object |
| Nesting depth | ≤ 3 | 4 | Guard clauses / extracted functions |
| Cyclomatic complexity | ≤ 10 | 15 | Decompose the function |

These are signals, not bureaucracy. A file approaching the ceiling almost always hides
more than one responsibility. When you hit a limit, **decompose** — extract a service,
a utility, or a submodule — don't just split mechanically.

---

## 3. Feature Module Anatomy (Backend)

Each feature is a self-contained module. Dependencies flow inward
(`controller → service → repository`); nothing in a feature reaches into another
feature's internals.

```
modules/billing/
├── billing.module.ts          # Wires the feature together
├── billing.controller.ts      # HTTP transport only
├── billing.service.ts         # Business logic / orchestration
├── billing.repository.ts      # Data access for this aggregate
├── dto/
│   ├── create-invoice.dto.ts
│   └── invoice-response.dto.ts
├── entities/
│   └── invoice.entity.ts
├── types/
│   └── billing.types.ts
├── exceptions/
│   └── invoice-not-found.exception.ts
├── billing.service.spec.ts    # Unit tests next to the unit
└── billing.e2e-spec.ts        # E2E tests
```

If a module grows beyond ~8 files of one kind, introduce subdomains
(`billing/invoicing/`, `billing/subscriptions/`).

---

## 4. Feature Slice Anatomy (Frontend)

Organize by feature, then by technical role within the feature.

```
components/features/checkout/
├── CheckoutPage.tsx           # Composition root for the feature
├── CheckoutSummary.tsx
├── PaymentForm.tsx
├── hooks/
│   └── use-checkout.ts        # Feature-scoped state/data hooks
├── api/
│   └── checkout-api.ts        # Typed calls for this feature
└── types/
    └── checkout.types.ts
```

Truly shared primitives live in `components/ui/`. Truly shared hooks live in `hooks/`.
Promote code to "shared" only on the third reuse (Rule of Three).

---

## 5. Import Order And Boundaries

Group imports, separated by blank lines, in this order:

```typescript
// 1. Node / external packages
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

// 2. Internal absolute imports (aliased)
import { PrismaService } from '@/database/prisma.service';
import { ConfigService } from '@/config/config.service';

// 3. Relative imports within the feature
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceNotFoundException } from './exceptions/invoice-not-found.exception';
```

- Use path aliases (`@/…`), not deep relative chains (`../../../../`).
- **No circular imports.** If A imports B and B imports A, extract the shared piece into
  a third module. A circular import is always a design error.
- A feature module exports a public surface through its `*.module.ts` (backend) or an
  `index.ts` barrel (frontend). Consumers import the public surface, not internals.

---

## 6. One Primary Export Per File

A file's name matches its primary export (`rules/03-naming-conventions.md` §9). Small,
private helpers tightly coupled to that export may live in the same file. Anything
reusable moves to `utils/`.

Barrel files (`index.ts`) are permitted **only** to define a module's public API. Do not
create barrels that re-export everything — they create import cycles and defeat
tree-shaking.

---

## 7. Colocation

Keep things that change together, close together.
- Tests sit next to the code they test (`*.spec.ts`).
- A component's styles, sub-components, and hooks sit in its feature folder.
- A DTO sits in its module's `dto/`, not in a global `dtos/` dump.

Distance in the file tree should reflect distance in coupling.
