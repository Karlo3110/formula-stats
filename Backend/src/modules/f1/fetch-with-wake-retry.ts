/**
 * The data service sleeps when idle (Railway Serverless). The request that
 * wakes it can fail while the container boots: Railway's proxy answers 502/503
 * or the connection is refused. One delayed retry covers that cold start.
 */
const WAKING_STATUSES: ReadonlySet<number> = new Set([502, 503]);

export const WAKE_RETRY_DELAY_MS = 2_000;

export type FetchFn = (url: string, init: RequestInit) => Promise<Response>;

export interface WakeRetryOptions {
  fetchFn?: FetchFn;
  delayMs?: number;
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attempt(
  fetchFn: FetchFn,
  url: string,
  init: RequestInit,
): Promise<Response | null> {
  try {
    const response = await fetchFn(url, init);
    return WAKING_STATUSES.has(response.status) ? null : response;
  } catch (error) {
    if (isTimeout(error)) {
      throw error;
    }
    return null;
  }
}

/** Fetches `url`, retrying once if the service is still waking up. */
export async function fetchWithWakeRetry(
  url: string,
  init: RequestInit,
  { fetchFn = fetch, delayMs = WAKE_RETRY_DELAY_MS }: WakeRetryOptions = {},
): Promise<Response> {
  const first = await attempt(fetchFn, url, init);
  if (first) {
    return first;
  }
  await wait(delayMs);
  return fetchFn(url, init);
}
