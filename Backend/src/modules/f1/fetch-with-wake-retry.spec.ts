import { fetchWithWakeRetry, type FetchFn } from './fetch-with-wake-retry';

const REQUEST_URL =
  'http://data-service.railway.internal:8000/api/v1/seasons/2026/schedule';
const INIT: RequestInit = { headers: { Accept: 'application/json' } };
const NO_DELAY = { delayMs: 0 };

function respond(status: number): Response {
  return new Response(JSON.stringify({ status }), { status });
}

function abortError(): Error {
  const error = new Error('The operation was aborted.');
  error.name = 'AbortError';
  return error;
}

function scriptedFetch(
  outcomes: ReadonlyArray<Response | Error>,
): jest.MockedFunction<FetchFn> {
  const mock = jest.fn<Promise<Response>, [string, RequestInit]>();
  for (const outcome of outcomes) {
    if (outcome instanceof Error) {
      mock.mockRejectedValueOnce(outcome);
    } else {
      mock.mockResolvedValueOnce(outcome);
    }
  }
  return mock;
}

describe('fetchWithWakeRetry', () => {
  it('returns the first response when the service is awake', async () => {
    const fetchFn = scriptedFetch([respond(200)]);

    const response = await fetchWithWakeRetry(REQUEST_URL, INIT, {
      ...NO_DELAY,
      fetchFn,
    });

    expect(response.status).toBe(200);
  });

  it('does not retry an ordinary error response', async () => {
    const fetchFn = scriptedFetch([respond(404), respond(200)]);

    const response = await fetchWithWakeRetry(REQUEST_URL, INIT, {
      ...NO_DELAY,
      fetchFn,
    });

    expect(response.status).toBe(404);
  });

  it('retries once when the proxy answers 502 while the service wakes', async () => {
    const fetchFn = scriptedFetch([respond(502), respond(200)]);

    const response = await fetchWithWakeRetry(REQUEST_URL, INIT, {
      ...NO_DELAY,
      fetchFn,
    });

    expect(response.status).toBe(200);
  });

  it('retries once when the connection is refused during boot', async () => {
    const fetchFn = scriptedFetch([
      new TypeError('fetch failed'),
      respond(200),
    ]);

    const response = await fetchWithWakeRetry(REQUEST_URL, INIT, {
      ...NO_DELAY,
      fetchFn,
    });

    expect(response.status).toBe(200);
  });

  it('returns the second failure instead of retrying again', async () => {
    const fetchFn = scriptedFetch([respond(503), respond(503), respond(200)]);

    const response = await fetchWithWakeRetry(REQUEST_URL, INIT, {
      ...NO_DELAY,
      fetchFn,
    });

    expect(response.status).toBe(503);
  });

  it('does not retry a request that timed out', async () => {
    const fetchFn = scriptedFetch([abortError(), respond(200)]);

    await expect(
      fetchWithWakeRetry(REQUEST_URL, INIT, { ...NO_DELAY, fetchFn }),
    ).rejects.toThrow('aborted');
  });
});
