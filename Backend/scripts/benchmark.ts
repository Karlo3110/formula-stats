/**
 * Mjerenje performansi i učinka predmemoriranja (poglavlja 6.2 i 6.3).
 *
 * Smjestiti u: Backend/scripts/benchmark.ts
 *
 * Pokretanje iz mape Backend:
 *   npx ts-node scripts/benchmark.ts
 *
 * Varijable se same učitavaju iz env/.env:
 *   API_URL    - bazni URL programskog sučelja (npr. http://localhost:3001/api/v1)
 *   REDIS_URL  - veza na Redis, potrebna za brisanje ključeva pri hladnom mjerenju
 *
 * Skripta za svaku krajnju točku:
 *   1. briše pripadajuće ključeve u Redisu i mjeri hladan zahtjev,
 *   2. šalje N zahtjeva s popunjenom predmemorijom i mjeri toplo vrijeme odziva,
 *   3. ispisuje tablice 10 i 11 u obliku spremnom za umetanje u rad.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Redis } from 'ioredis';

/** Učitava env/.env bez vanjskih ovisnosti. */
function loadEnvFile(relativePath: string): void {
  let contents: string;
  try {
    contents = readFileSync(resolve(process.cwd(), relativePath), 'utf8');
  } catch {
    console.warn(`Upozorenje: ${relativePath} nije pronađen.`);
    return;
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmed: string = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separator: number = trimmed.indexOf('=');
    if (separator <= 0) {
      continue;
    }
    const key: string = trimmed.slice(0, separator).trim();
    const rawValue: string = trimmed.slice(separator + 1).trim();
    const value: string = rawValue.replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('env/.env');

const API_URL: string = process.env.API_URL ?? 'http://localhost:3001/api/v1';
const REDIS_URL: string = process.env.REDIS_URL ?? 'redis://localhost:6379';

const SEASON = 2024;
const ROUND = 1;
const SESSION = 'R';
const WARM_RUNS = 10;
const REQUEST_TIMEOUT_MS = 180_000;

interface Endpoint {
  readonly label: string;
  readonly path: string;
  /** Uzorak ključeva u Redisu koji se briše prije hladnog mjerenja. */
  readonly cachePattern: string;
}

const ENDPOINTS: ReadonlyArray<Endpoint> = [
  {
    label: 'Kalendar sezone',
    path: `/f1/seasons/${SEASON}/events`,
    cachePattern: `f1:events:${SEASON}`,
  },
  {
    label: 'Raspored sesija',
    path: `/f1/seasons/${SEASON}/schedule`,
    cachePattern: `f1:schedule:*:${SEASON}`,
  },
  {
    label: 'Poredak vozača i konstruktora',
    path: `/f1/seasons/${SEASON}/standings`,
    cachePattern: `f1:standings:*:${SEASON}`,
  },
  {
    label: 'Rezultati sesije',
    path: `/f1/seasons/${SEASON}/rounds/${ROUND}/sessions/${SESSION}/results`,
    cachePattern: `f1:results:${SEASON}:${ROUND}:${SESSION}`,
  },
  {
    label: 'Geometrija staze',
    path: `/f1/seasons/${SEASON}/rounds/${ROUND}/sessions/${SESSION}/track-map`,
    cachePattern: `f1:trackmap:*:${SEASON}:${ROUND}:${SESSION}`,
  },
  {
    label: 'Rekonstruirani tijek utrke',
    path: `/f1/seasons/${SEASON}/rounds/${ROUND}/sessions/${SESSION}/replay`,
    cachePattern: `f1:replay:*:${SEASON}:${ROUND}:${SESSION}`,
  },
];

interface Measurement {
  readonly durationMs: number;
  readonly bytes: number;
  readonly status: number;
}

interface EndpointResult {
  readonly label: string;
  readonly coldMs: number;
  readonly warmAvgMs: number;
  readonly warmMinMs: number;
  readonly warmMaxMs: number;
  readonly warmP95Ms: number;
  readonly sizeKb: number;
}

async function measureRequest(url: string): Promise<Measurement> {
  const started: number = performance.now();
  const response: Response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body: string = await response.text();
  const durationMs: number = performance.now() - started;

  if (!response.ok) {
    throw new Error(`${url} -> HTTP ${response.status}`);
  }

  return {
    durationMs,
    bytes: Buffer.byteLength(body, 'utf8'),
    status: response.status,
  };
}

async function deleteKeys(redis: Redis, pattern: string): Promise<void> {
  if (!pattern.includes('*')) {
    await redis.del(pattern);
    return;
  }

  const keys: string[] = [];
  let cursor = '0';
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
    cursor = next;
    keys.push(...batch);
  } while (cursor !== '0');

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

function percentile(values: ReadonlyArray<number>, p: number): number {
  const sorted: number[] = [...values].sort((a, b) => a - b);
  const index: number = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[index] ?? 0;
}

function average(values: ReadonlyArray<number>): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number, decimals = 1): number {
  const factor: number = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

async function measureEndpoint(
  redis: Redis,
  endpoint: Endpoint,
): Promise<EndpointResult> {
  const url = `${API_URL}${endpoint.path}`;

  await deleteKeys(redis, endpoint.cachePattern);
  const cold: Measurement = await measureRequest(url);

  const warm: number[] = [];
  for (let i = 0; i < WARM_RUNS; i += 1) {
    const measurement: Measurement = await measureRequest(url);
    warm.push(measurement.durationMs);
  }

  return {
    label: endpoint.label,
    coldMs: round(cold.durationMs),
    warmAvgMs: round(average(warm)),
    warmMinMs: round(Math.min(...warm)),
    warmMaxMs: round(Math.max(...warm)),
    warmP95Ms: round(percentile(warm, 95)),
    sizeKb: round(cold.bytes / 1024),
  };
}

function printTable10(results: ReadonlyArray<EndpointResult>): void {
  console.log('\nTablica 10. Vrijeme odziva programskih sučelja\n');
  console.log(
    '| Krajnja točka | Prosjek (ms) | Min (ms) | Max (ms) | P95 (ms) | Veličina odgovora (KB) |',
  );
  console.log('|---|---|---|---|---|---|');
  for (const r of results) {
    console.log(
      `| ${r.label} | ${r.warmAvgMs} | ${r.warmMinMs} | ${r.warmMaxMs} | ${r.warmP95Ms} | ${r.sizeKb} |`,
    );
  }
}

function printTable11(results: ReadonlyArray<EndpointResult>): void {
  console.log('\nTablica 11. Usporedba vremena odziva s predmemorijom i bez nje\n');
  console.log(
    '| Krajnja točka | Hladna predmemorija (ms) | Topla predmemorija (ms) | Ubrzanje |',
  );
  console.log('|---|---|---|---|');
  for (const r of results) {
    const speedup: string =
      r.warmAvgMs > 0 ? `${round(r.coldMs / r.warmAvgMs).toFixed(1)}×` : 'n/d';
    console.log(`| ${r.label} | ${r.coldMs} | ${r.warmAvgMs} | ${speedup} |`);
  }
}

async function main(): Promise<void> {
  console.log(`Bazni URL : ${API_URL}`);
  console.log(`Redis     : ${REDIS_URL.replace(/:[^:@]*@/, ':****@')}`);
  console.log(`Ponavljanja (topla predmemorija): ${WARM_RUNS}\n`);

  if (REDIS_URL.includes('.railway.internal')) {
    console.error(
      'GRESKA: REDIS_URL pokazuje na Railwayjevu privatnu mrezu (*.railway.internal),\n' +
        '        koja nije dostupna s lokalnog racunala.\n\n' +
        '        U Railwayu otvori Redis servis -> Variables -> REDIS_PUBLIC_URL\n' +
        '        i tu vrijednost privremeno stavi u env/.env kao REDIS_URL.\n',
    );
    process.exit(1);
  }

  const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    retryStrategy: () => null,
  });
  redis.on('error', () => {
    /* pogreska se obraduje nize */
  });

  try {
    await redis.connect();
    await redis.ping();
  } catch (error) {
    console.error(
      `\nGRESKA: nije moguce spojiti se na Redis (${(error as Error).message}).\n\n` +
        '        Provjeri redom:\n' +
        '        1. je li REDIS_URL naveden u env/.env,\n' +
        '        2. koristi li backend isti Redis (inace mjerenje nije valjano),\n' +
        '        3. ako je Redis na Railwayu, koristi REDIS_PUBLIC_URL.\n',
    );
    redis.disconnect();
    process.exit(1);
  }

  const results: EndpointResult[] = [];

  try {
    for (const endpoint of ENDPOINTS) {
      process.stdout.write(`Mjerim: ${endpoint.label} ... `);
      try {
        const result: EndpointResult = await measureEndpoint(redis, endpoint);
        results.push(result);
        console.log(`OK (hladno ${result.coldMs} ms, toplo ${result.warmAvgMs} ms)`);
      } catch (error) {
        console.log(`NEUSPJESNO: ${(error as Error).message}`);
      }
    }

    printTable10(results);
    printTable11(results);
  } finally {
    redis.disconnect();
  }
}

void main();
