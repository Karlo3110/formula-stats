import { apiClient } from '@/lib/api/client';
import {
  PaginatedUsers,
  PaginatedUsersSchema,
  User,
  UserFilters,
  UserSchema,
} from '../types/user.types';

/**
 * Typed API client for the Users feature. The single boundary between the app and the
 * backend. Every response is validated with Zod before it is returned — callers receive
 * data already proven to match the type. See rules/frontend/typescript-frontend.md §3.
 *
 * `apiClient` (in lib/api/client) attaches auth centrally and returns parsed JSON as
 * `unknown`; validation happens here.
 */
export const userApi = {
  async list(filters: UserFilters): Promise<PaginatedUsers> {
    const raw = await apiClient.get('/v1/users', {
      params: {
        limit: filters.limit,
        offset: filters.offset,
        status: filters.status,
        search: filters.search,
      },
    });
    return PaginatedUsersSchema.parse(raw);
  },

  async getById(id: string): Promise<User> {
    const raw = await apiClient.get(`/v1/users/${id}`);
    return UserSchema.parse(raw);
  },

  async getMe(): Promise<User> {
    const raw = await apiClient.get('/v1/users/me');
    return UserSchema.parse(raw);
  },
};
