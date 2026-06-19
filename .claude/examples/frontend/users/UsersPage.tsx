import { Suspense } from 'react';

import { UserTable } from './components/UserTable';

/**
 * Route composition root — a Server Component. It owns layout and composition; the
 * interactive, data-driven table is a client leaf. The page ships almost no JS itself.
 *
 * Place this at app/users/page.tsx in a real project. Static shell renders instantly;
 * the client table streams in under Suspense.
 * See architecture/frontend-architecture.md, rules/frontend/nextjs.md.
 */
export default function UsersPage(): JSX.Element {
  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-muted-foreground">Manage and review platform users.</p>
      </header>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-muted" />}>
        <UserTable />
      </Suspense>
    </main>
  );
}
