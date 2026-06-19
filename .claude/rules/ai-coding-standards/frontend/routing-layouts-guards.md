# Routing, Layouts, Guards, and Utilities

Read with `frontend/nextjs.md`, `frontend/react.md`, and `core/05-security-baseline.md`.

## Layout structure

```
src/app/
├── layout.tsx                 # Root layout: providers, fonts, html/body, i18n
├── (public)/                  # Route group: unauthenticated pages
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/                     # Route group: authenticated app
│   ├── layout.tsx             # App shell: nav/sidebar/header, requires auth
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
└── (marketing)/               # Optional: public marketing pages
    └── page.tsx
```

- **Route groups** `(name)` organize routes and apply a shared layout without affecting the
  URL. Use them to separate public, authenticated, and marketing areas.
- Layouts compose shared chrome (nav, sidebar, footer) and providers. Layouts are
  composition only — no business logic or data transformation (`frontend/nextjs.md`).
- Shared chrome pieces (`AppSidebar`, `AppHeader`) are reusable components in
  `components/`, not inline in the layout.

## Routing rules

- File-based routing only. No client-side route tables.
- Route segments are kebab-case.
- Dynamic segments are typed; params are validated where they drive data fetching.
- Navigation uses `next/link` and the router; never raw `window.location` for in-app nav.

## Route guards

Two layers, both required for protected areas:

1. **Edge guard (middleware):** `middleware.ts` checks for a valid session/token on
   protected path patterns and redirects unauthenticated users to login before any page
   renders. This is the primary gate.
2. **Layout/server guard:** the authenticated route group's layout (or a server component)
   re-verifies the session server-side and provides the user to the tree. Never rely on the
   client alone.

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES: ReadonlyArray<string> = ["/dashboard", "/settings"];

export function middleware(request: NextRequest): NextResponse {
  const isProtected = PROTECTED_PREFIXES.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );
  const hasSession = Boolean(request.cookies.get("session"));

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/settings/:path*"] };
```

- Role-based route access (admin areas) is enforced server-side in the layout/server
  component, not just hidden in the UI. Hiding a link is UX, not security.
- The backend independently authorizes every request regardless of frontend guards.

## Auth state (client)

Model auth as an explicit state machine, not scattered booleans. Hold it in a single store
(Zustand) or context, populated from the server-verified session.

```ts
type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: AuthenticatedUser }
  | { status: "unauthenticated" };
```

- Components branch on `status`; there is no ambiguous "is the user maybe logged in" state.
- Access tokens are kept in memory; the refresh token lives in an httpOnly cookie and is
  never readable by JS (`backend/api-contract.md`).
- A single token-refresh routine handles 401s and re-auth; components never manage tokens.

## Utilities (`lib/utils/`) and singletons

```
src/lib/utils/
├── date.ts          # date formatting/parsing helpers
├── format.ts        # number/currency/string formatting
├── cn.ts            # class merge (design-system)
└── ...
```

Rules:
- Utilities are pure, stateless functions grouped by domain. One concern per file.
- When a utility wraps a configured instance that should exist once (e.g. a configured
  date/`Intl` formatter, an analytics client), expose it as a **module-level singleton** —
  created once, imported everywhere. Modules are cached by the runtime, so a single exported
  const is a true singleton.

```ts
// lib/utils/date.ts
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function formatDate(value: Date): string {
  return dateFormatter.format(value);
}
```

- In NestJS, "singleton utility" means a provider with default (singleton) scope, injected
  via DI — not a `new` inside consumers (`core/06-solid.md`).
- Never put React/JSX or component logic in `utils/`. UI lives in `components/`.
