import { UserRecord, UserRole, UserStatus } from '../types/user.types';

/**
 * Domain entity. Encapsulates user invariants and derived behavior so business rules
 * live in the domain, not scattered across services. No framework dependencies.
 * See architecture/backend-architecture.md.
 */
export class User {
  private constructor(private readonly record: UserRecord) {}

  static fromRecord(record: UserRecord): User {
    return new User(record);
  }

  get id(): string {
    return this.record.id;
  }

  get email(): string {
    return this.record.email;
  }

  get fullName(): string {
    return `${this.record.firstName} ${this.record.lastName}`.trim();
  }

  get role(): UserRole {
    return this.record.role;
  }

  get status(): UserStatus {
    return this.record.status;
  }

  get createdAt(): Date {
    return this.record.createdAt;
  }

  isActive(): boolean {
    return this.record.status === UserStatus.Active;
  }

  isAdmin(): boolean {
    return this.record.role === UserRole.Admin;
  }

  /** Returns the raw record for the mapping layer. */
  toRecord(): UserRecord {
    return this.record;
  }
}
