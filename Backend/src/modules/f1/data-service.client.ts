import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ZodType } from 'zod';

import { DataServiceUnavailableException } from '@/common/exceptions/domain.exception';

import {
  SeasonScheduleSchema,
  SessionResultsSchema,
  TrackMapSchema,
  type SeasonSchedulePayload,
  type SessionResultsPayload,
  type TrackMapPayload,
} from './f1.schemas';

const INTERNAL_KEY_HEADER = 'X-Internal-Key';

/**
 * Server-to-server client for the FastF1 data service. Reached over Railway's
 * private network; treats every response as untrusted and validates it.
 */
@Injectable()
export class DataServiceClient {
  private readonly logger = new Logger(DataServiceClient.name);

  constructor(private readonly config: ConfigService) {}

  getSeasonEvents(season: number): Promise<SeasonSchedulePayload> {
    return this.get(
      `/api/v1/seasons/${season}/events`,
      SeasonScheduleSchema,
    );
  }

  getSessionResults(
    season: number,
    round: number,
    session: string,
  ): Promise<SessionResultsPayload> {
    return this.get(
      `/api/v1/seasons/${season}/rounds/${round}/sessions/${encodeURIComponent(session)}/results`,
      SessionResultsSchema,
    );
  }

  getTrackMap(
    season: number,
    round: number,
    session: string,
  ): Promise<TrackMapPayload> {
    return this.get(
      `/api/v1/seasons/${season}/rounds/${round}/sessions/${encodeURIComponent(session)}/track-map`,
      TrackMapSchema,
    );
  }

  private async get<T>(path: string, schema: ZodType<T>): Promise<T> {
    const baseUrl = this.config.get<string>('DATA_SERVICE_URL');
    if (!baseUrl) {
      throw new DataServiceUnavailableException(
        'DATA_SERVICE_URL is not configured.',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.getOrThrow<number>('DATA_SERVICE_TIMEOUT_MS'),
    );

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: this.buildHeaders(),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new DataServiceUnavailableException(
          `Data service responded ${response.status}.`,
        );
      }
      return schema.parse(await response.json());
    } catch (error) {
      if (error instanceof DataServiceUnavailableException) {
        throw error;
      }
      this.logger.error(
        `Data service request failed: ${path}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new DataServiceUnavailableException();
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    const key = this.config.get<string>('DATA_SERVICE_INTERNAL_KEY');
    if (key) {
      headers[INTERNAL_KEY_HEADER] = key;
    }
    return headers;
  }
}
