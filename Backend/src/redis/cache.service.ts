/**
 * Caching / ephemeral-state abstraction. Business code depends on this interface,
 * never on the Redis client directly (.claude/rules/backend/caching-redis.md).
 */
export abstract class CacheService {
  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract deleteByPrefix(prefix: string): Promise<void>;
}
