# Next.js Rules

App Router only. Read with `frontend/react.md`, `frontend/design-system.md`, and
`core/04-env-and-config.md`.

## Folder structure (canonical)

```
src/
├── app/                      # Routing and composition ONLY
│   ├── (auth)/login/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── api/                  # Route handlers (server)
│   │   └── health/route.ts
│   ├── layout.tsx
│   └── globals.css           # Design tokens (see design-system)
├── components/
│   ├── ui/                   # Reusable primitives (Button, Input, Heading, Text...)
│   └── <feature>/            # Feature-specific composed components
├── hooks/                    # Reusable hooks (useUser, useAuth...)
├── services/                 # API calls only
├── lib/                      # Framework-agnostic utilities + config
│   ├── config/
│   ├── http-client.ts
│   └── utils/
├── stores/                   # Zustand stores
├── types/                    # Shared types (*.types.ts)
└── styles/                   # Token definitions if not in globals.css
```

Do not invent new top-level folders. Extend these.

## Pages are routing and composition only

A `page.tsx` may: read route params, compose components, and pass data down. It must not
contain business logic, data transformation, or inline API calls.

```tsx
// app/dashboard/page.tsx
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function DashboardPage(): JSX.Element {
  return <DashboardView />;
}
```

The real work lives in `DashboardView` (composition) and the hooks/services it uses.

## Server vs Client components

- Default to Server Components. Add `"use client"` only when a component needs state,
  effects, browser APIs, or event handlers.
- `"use client"` goes at the top of the smallest component that needs it, not the page.
- Server-only secrets are read only in server components, route handlers, or server actions.
  Never import server config into a client component (see `core/04-env-and-config.md`).

## Data fetching

- Server Components fetch via server-side service functions directly.
- Client Components fetch via hooks wrapping TanStack Query (see `frontend/react.md`).
- Mutations use server actions or service calls through a typed http client.
- Never call `fetch` inside a page or a presentational component.

## HTTP client

A single typed client reads the base URL from validated config. No raw `fetch` with literal
URLs scattered across the app.

```ts
// lib/http-client.ts
import { clientConfig } from "@/lib/config/client-config";

async function request<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(`${clientConfig.apiUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  return (await response.json()) as TResponse;
}

export const httpClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  // patch, put, delete ...
} as const;
```

## Route handlers (`app/api/.../route.ts`)

- Validate input with zod.
- Keep them thin: validate, call a service, return the standard response shape.
- Protect them by default; mark public ones explicitly.

## Metadata, loading, error

- Every route defines `metadata` (title, description) where relevant.
- Provide `loading.tsx` and `error.tsx` for routes with async data.

## Images and assets

- Use `next/image`. Construct remote URLs from the validated public base URL, never a
  hardcoded host. Configure `images.remotePatterns` for external buckets.
