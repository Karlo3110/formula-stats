/**
 * Feature-level domain types for the Users module.
 * Pure types — no framework imports. See rules/02-typescript.md, rules/03-naming-conventions.md.
 */

export enum UserRole {
  User = 'USER',
  Admin = 'ADMIN',
}

export enum UserStatus {
  Active = 'ACTIVE',
  Suspended = 'SUSPENDED',
  Deleted = 'DELETED',
}

/** The shape returned by the persistence layer (a domain entity, not the API response). */
export interface UserRecord {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Identity extracted from a verified auth token. See architecture/authentication-architecture.md. */
export interface AuthenticatedUser {
  readonly id: string;
  readonly roles: readonly UserRole[];
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
}
