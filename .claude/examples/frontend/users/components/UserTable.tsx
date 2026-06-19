'use client';

import { useRouter } from 'next/navigation';

import { useUsers } from '../hooks/use-users';
import { useUserFilters } from '../hooks/use-user-filters';
import { UserRow } from './UserRow';

/**
 * Client component: owns interactivity (filters, pagination, selection) and consumes the
 * server-state hook. It renders loading/error/empty as real states — never a blank screen.
 * Logic lives in hooks; this component composes and renders.
 * See architecture/frontend-architecture.md, rules/frontend/react.md.
 */
export function UserTable(): JSX.Element {
  const router = useRouter();
  const { filters, setSearch, setOffset } = useUserFilters();
  const { data, isLoading, isError, error, isPlaceholderData } = useUsers(filters);

  if (isLoading) return <TableSkeleton />;
  if (isError) return <ErrorState message={error.message} />;
  if (!data || data.data.length === 0) return <EmptyState />;

  const { meta } = data;

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search users…"
        defaultValue={filters.search ?? ''}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full max-w-sm rounded-md border border-input px-3 py-2"
      />

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border text-sm text-muted-foreground">
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody aria-busy={isPlaceholderData}>
          {data.data.map((user) => (
            <UserRow key={user.id} user={user} onSelect={(id) => router.push(`/users/${id}`)} />
          ))}
        </tbody>
      </table>

      <Pagination
        offset={meta.offset}
        limit={meta.limit}
        total={meta.total}
        hasMore={meta.hasMore}
        onChange={setOffset}
      />
    </div>
  );
}

interface PaginationProps {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
  onChange: (offset: number) => void;
}

function Pagination({ offset, limit, total, hasMore, onChange }: PaginationProps): JSX.Element {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => onChange(Math.max(0, offset - limit))}
          className="rounded-md border border-input px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!hasMore}
          onClick={() => onChange(offset + limit)}
          className="rounded-md border border-input px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function TableSkeleton(): JSX.Element {
  return <div className="h-64 animate-pulse rounded-md bg-muted" aria-label="Loading users" />;
}

function ErrorState({ message }: { message: string }): JSX.Element {
  return (
    <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      Failed to load users: {message}
    </div>
  );
}

function EmptyState(): JSX.Element {
  return <p className="py-12 text-center text-muted-foreground">No users found.</p>;
}
