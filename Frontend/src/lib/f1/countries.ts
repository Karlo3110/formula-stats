/**
 * Country lookups for flags. Event countries arrive as names from the FastF1
 * schedule; driver nationalities as three-letter codes from live timing,
 * which mixes ISO alpha-3 with IOC/FIA codes (NED, MON, GER, SUI...).
 */
const EVENT_COUNTRIES: Readonly<Record<string, string>> = {
  'abu dhabi': 'ae',
  argentina: 'ar',
  australia: 'au',
  austria: 'at',
  azerbaijan: 'az',
  bahrain: 'bh',
  belgium: 'be',
  brazil: 'br',
  canada: 'ca',
  china: 'cn',
  france: 'fr',
  germany: 'de',
  'great britain': 'gb',
  hungary: 'hu',
  italy: 'it',
  japan: 'jp',
  mexico: 'mx',
  monaco: 'mc',
  netherlands: 'nl',
  portugal: 'pt',
  qatar: 'qa',
  russia: 'ru',
  'saudi arabia': 'sa',
  singapore: 'sg',
  'south africa': 'za',
  spain: 'es',
  turkey: 'tr',
  'united arab emirates': 'ae',
  'united kingdom': 'gb',
  'united states': 'us',
  usa: 'us',
  uk: 'gb',
  vietnam: 'vn',
};

const NATIONALITY_CODES: Readonly<Record<string, string>> = {
  ARE: 'ae', ARG: 'ar', AUS: 'au', AUT: 'at', BEL: 'be', BRA: 'br', CAN: 'ca',
  CHE: 'ch', CHN: 'cn', COL: 'co', CZE: 'cz', DEN: 'dk', DEU: 'de', DNK: 'dk',
  ESP: 'es', EST: 'ee', FIN: 'fi', FRA: 'fr', GBR: 'gb', GER: 'de', HUN: 'hu',
  IDN: 'id', IND: 'in', IRL: 'ie', ISR: 'il', ITA: 'it', JPN: 'jp', MCO: 'mc',
  MEX: 'mx', MON: 'mc', NED: 'nl', NLD: 'nl', NOR: 'no', NZL: 'nz', POL: 'pl',
  POR: 'pt', PRT: 'pt', RSA: 'za', RUS: 'ru', SUI: 'ch', SWE: 'se', THA: 'th',
  USA: 'us', VEN: 've', ZAF: 'za',
};

/** ISO alpha-2 for a Grand Prix host country name, or null if unknown. */
export function eventCountryIso2(country: string): string | null {
  return EVENT_COUNTRIES[country.trim().toLowerCase()] ?? null;
}

/** ISO alpha-2 for a driver nationality code (ISO or IOC/FIA alpha-3). */
export function nationalityIso2(code: string | null | undefined): string | null {
  if (!code) return null;
  return NATIONALITY_CODES[code.trim().toUpperCase()] ?? null;
}
