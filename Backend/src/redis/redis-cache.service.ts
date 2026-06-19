import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

import { CacheService } from './cache.service';

const SCAN_BATCH_SIZE = 200;

@Injectable()
export class RedisCacheService
  extends CacheService
  implements OnModuleDestroy
{
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis;

  constructor(config: ConfigService) {
    super();
    this.client = new Redis(config.getOrThrow<string>('REDIS_URL'), {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });
    this.client.on('error', (error: Error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    let cursor = '0';
    do {
      const [next, keys] = await this.client.scan(
        cursor,
        'MATCH',
        `${prefix}*`,
        'COUNT',
        SCAN_BATCH_SIZE,
      );
      cursor = next;
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } while (cursor !== '0');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
