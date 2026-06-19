import type { User } from '@prisma/client';

import type { Role } from '@/common/types/authenticated-user';

/** Client-facing user shape. Internal fields (passwordHash, deletedAt) are excluded. */
export interface UserResponseDto {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role as Role,
    status: user.status,
    isEmailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt.toISOString(),
  };
}
