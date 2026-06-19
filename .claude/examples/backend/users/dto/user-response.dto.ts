import { UserRole, UserStatus } from '../types/user.types';

/**
 * Response DTO — the public shape sent to clients. We never serialize the entity/record
 * directly: that would leak internal fields (e.g., passwordHash) and couple the wire
 * format to storage. See architecture/api-architecture.md.
 */
export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO-8601
}

/** Standard list envelope. See architecture/api-architecture.md. */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}
