import { User } from '../types/user.types';

interface UserRowProps {
  user: User;
  onSelect: (id: string) => void;
}

/**
 * Presentational row. Typed props, no data fetching, no business logic — it renders and
 * raises an event. A leaf this simple needs no 'use client' of its own; it inherits the
 * client boundary from its interactive parent (UserTable). See rules/frontend/react.md.
 */
export function UserRow({ user, onSelect }: UserRowProps): JSX.Element {
  return (
    <tr
      className="cursor-pointer border-b border-border hover:bg-accent"
      onClick={() => onSelect(user.id)}
    >
      <td className="px-4 py-3 font-medium">{user.fullName}</td>
      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
      <td className="px-4 py-3">
        <StatusBadge status={user.status} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: User['status'] }): JSX.Element {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
      {label}
    </span>
  );
}
