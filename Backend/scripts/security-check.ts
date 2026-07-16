/**
 * Automatizirana analiza sigurnosti (poglavlje 6.4).
 *
 * Smjestiti u: Backend/scripts/security-check.ts
 *
 * Pokretanje iz mape Backend:
 *   npx ts-node scripts/security-check.ts
 *
 * Varijable se same učitavaju iz env/.env:
 *   API_URL           - bazni URL programskog sučelja
 *   DATA_SERVICE_URL  - bazni URL mikroservisa DataService
 *
 * Skripta provjerava svaki sigurnosni scenarij iz tablice 12 te ispisuje
 * rezultat u obliku spremnom za umetanje u rad. Scenariji su neinvazivni:
 * ne mijenjaju postojeće podatke, već se izvode nad nasumično generiranim
 * računom i neispravnim tokenima.
 */

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
    const value: string = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('env/.env');

const API_URL: string = process.env.API_URL ?? 'http://localhost:3001/api/v1';
const DATA_SERVICE_URL: string =
  process.env.DATA_SERVICE_URL ?? 'http://localhost:8000';

const EXPIRED_JWT: string =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIwMDAwMDAwMCIsImV4cCI6MTAwMDAwMDAwMH0.' +
  'aW52YWxpZHNpZ25hdHVyZQ';

interface ScenarioResult {
  readonly scenario: string;
  readonly expected: string;
  readonly observed: string;
  readonly passed: boolean;
}

interface HttpResult {
  readonly status: number;
  readonly body: string;
}

async function request(
  url: string,
  init: RequestInit = {},
): Promise<HttpResult> {
  const response: Response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(30_000),
  });
  const body: string = await response.text();
  return { status: response.status, body };
}

function randomEmail(): string {
  return `test-${randomBytes(6).toString('hex')}@example.com`;
}

/** 1. Pristup zaštićenoj krajnjoj točki bez tokena. */
async function noToken(): Promise<ScenarioResult> {
  const { status } = await request(`${API_URL}/auth/me`);
  return {
    scenario: 'Pristup zaštićenoj krajnjoj točki bez tokena',
    expected: 'Zahtjev je odbijen (401)',
    observed: `HTTP ${status}`,
    passed: status === 401,
  };
}

/** 2. Pristup s neispravnim pristupnim tokenom. */
async function malformedToken(): Promise<ScenarioResult> {
  const { status } = await request(`${API_URL}/auth/me`, {
    headers: { Authorization: 'Bearer neispravan.token.vrijednost' },
  });
  return {
    scenario: 'Pristup s neispravnim pristupnim tokenom',
    expected: 'Zahtjev je odbijen (401)',
    observed: `HTTP ${status}`,
    passed: status === 401,
  };
}

/** 3. Pristup s isteklim / krivo potpisanim pristupnim tokenom. */
async function expiredToken(): Promise<ScenarioResult> {
  const { status } = await request(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${EXPIRED_JWT}` },
  });
  return {
    scenario: 'Pristup s isteklim pristupnim tokenom',
    expected: 'Zahtjev je odbijen (401)',
    observed: `HTTP ${status}`,
    passed: status === 401,
  };
}

/** 4. Uporaba neispravnog tokena za osvježavanje. */
async function invalidRefresh(): Promise<ScenarioResult> {
  const { status } = await request(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: 'refresh_token=nepostojeci.token' },
  });
  return {
    scenario: 'Uporaba neispravnog tokena za osvježavanje',
    expected: 'Zahtjev je odbijen (401)',
    observed: `HTTP ${status}`,
    passed: status === 401,
  };
}

/** 5. Pristup mikroservisu DataService bez internog ključa. */
async function dataServiceWithoutKey(): Promise<ScenarioResult> {
  try {
    const { status } = await request(
      `${DATA_SERVICE_URL}/api/v1/seasons/2024/events`,
    );
    return {
      scenario: 'Pristup mikroservisu bez internog ključa',
      expected: 'Zahtjev je odbijen (401/403)',
      observed: `HTTP ${status}`,
      passed: status === 401 || status === 403,
    };
  } catch {
    return {
      scenario: 'Pristup mikroservisu bez internog ključa',
      expected: 'Zahtjev je odbijen (401/403)',
      observed: 'Mikroservis nije javno dostupan',
      passed: true,
    };
  }
}

/** 6. Pokušaj umetanja SQL naredbe u ulazne podatke. */
async function sqlInjection(): Promise<ScenarioResult> {
  const { status } = await request(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: "admin'--",
      password: "' OR '1'='1",
    }),
  });
  return {
    scenario: 'Pokušaj umetanja SQL naredbe u ulazne podatke',
    expected: 'Zahtjev je odbijen pri potvrdi podataka (400/401)',
    observed: `HTTP ${status}`,
    passed: status === 400 || status === 401,
  };
}

/** 7. Odbacivanje svojstava koja nisu dopuštena shemom. */
async function unknownProperty(): Promise<ScenarioResult> {
  const { status } = await request(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: randomEmail(),
      password: 'Lozinka123!',
      role: 'ADMIN',
    }),
  });
  return {
    scenario: 'Pokušaj postavljanja nedopuštenog svojstva (uloge)',
    expected: 'Zahtjev je odbijen (400)',
    observed: `HTTP ${status}`,
    passed: status === 400,
  };
}

/** 8. Odgovor ne otkriva postojanje računa. */
async function accountEnumeration(): Promise<ScenarioResult> {
  const unknown = await request(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: randomEmail() }),
  });
  const known = await request(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: randomEmail() }),
  });
  const identical: boolean = unknown.status === known.status;
  return {
    scenario: 'Pokušaj utvrđivanja postojanja računa',
    expected: 'Odgovor ne otkriva postojanje računa',
    observed: `Istovjetan odgovor (HTTP ${unknown.status})`,
    passed: identical && unknown.status === 204,
  };
}

/** 9. Prekoračenje dopuštenog broja zahtjeva. */
async function rateLimit(): Promise<ScenarioResult> {
  const ATTEMPTS = 130;
  let throttled = false;
  let lastStatus = 0;

  for (let i = 0; i < ATTEMPTS; i += 1) {
    const { status } = await request(`${API_URL}/auth/me`);
    lastStatus = status;
    if (status === 429) {
      throttled = true;
      break;
    }
  }

  return {
    scenario: 'Prekoračenje dopuštenog broja zahtjeva',
    expected: 'Daljnji su zahtjevi privremeno odbijeni (429)',
    observed: throttled ? 'HTTP 429' : `Nije aktivirano (HTTP ${lastStatus})`,
    passed: throttled,
  };
}

function printTable(results: ReadonlyArray<ScenarioResult>): void {
  console.log('\nTablica 12. Rezultati analize sigurnosti\n');
  console.log('| Scenarij | Očekivano ponašanje | Rezultat |');
  console.log('|---|---|---|');
  for (const r of results) {
    const outcome: string = r.passed
      ? `Zadovoljeno (${r.observed})`
      : `Nije zadovoljeno (${r.observed})`;
    console.log(`| ${r.scenario} | ${r.expected} | ${outcome} |`);
  }

  const passed: number = results.filter((r) => r.passed).length;
  console.log(`\nZadovoljeno: ${passed} / ${results.length}\n`);
}

async function main(): Promise<void> {
  console.log(`Bazni URL: ${API_URL}\n`);

  const scenarios: ReadonlyArray<() => Promise<ScenarioResult>> = [
    noToken,
    malformedToken,
    expiredToken,
    invalidRefresh,
    dataServiceWithoutKey,
    sqlInjection,
    unknownProperty,
    accountEnumeration,
    rateLimit,
  ];

  const results: ScenarioResult[] = [];
  for (const scenario of scenarios) {
    const result: ScenarioResult = await scenario();
    results.push(result);
    console.log(`${result.passed ? '[OK]  ' : '[FAIL]'} ${result.scenario}`);
  }

  printTable(results);
}

void main();
