export const Role = {
  Admin: 'ADMIN',
  Member: 'MEMBER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly role: Role;
}

export interface AccessTokenPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: Role;
}
