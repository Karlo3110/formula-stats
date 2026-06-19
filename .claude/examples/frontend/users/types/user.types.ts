import { z } from 'zod';

/**
 * Source-of-truth schemas for the Users feature. Types are derived from the schemas so the
 * runtime validator and the static type can never drift. API responses are validated
 * against these at the boundary — never asserted with `as`.
 * See rules/frontend/typescript-frontend.md, rules/02-typescript.md §4.
 */

export const UserRoleSchema = z.enum(['USER', 'ADMIN']);
export const UserStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: z.string().datetime(),
});

export const PaginatedUsersSchema = z.object({
  data: z.array(UserSchema),
  meta: z.object({
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
    hasMore: z.boolean(),
  }),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type PaginatedUsers = z.infer<typeof PaginatedUsersSchema>;

export interface UserFilters {
  readonly limit: number;
  readonly offset: number;
  readonly status?: UserStatus;
  readonly search?: string;
}
