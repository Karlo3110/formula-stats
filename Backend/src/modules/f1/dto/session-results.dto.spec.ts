import { SessionResultsSchema } from '../f1.schemas';

import {
  RESULTS_DETAIL_VERSION,
  areStoredResultsCurrent,
  toSessionResultsDto,
} from './session-results.dto';

const LEGACY_ROW = {
  position: 1,
  driver_number: '4',
  abbreviation: 'NOR',
  full_name: 'Lando Norris',
  team_name: 'McLaren',
  points: 25,
  status: 'Finished',
};

const HEADSHOT =
  'https://media.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png';

function createPayload(rows: object[]): unknown {
  return { season: 2026, round_number: 15, session: 'R', results: rows };
}

describe('areStoredResultsCurrent', () => {
  it('serves rows written with the current detail version', () => {
    expect(
      areStoredResultsCurrent([{ detailVersion: RESULTS_DETAIL_VERSION }]),
    ).toBe(true);
  });

  it('re-fetches when any row predates the current detail version', () => {
    expect(
      areStoredResultsCurrent([
        { detailVersion: RESULTS_DETAIL_VERSION },
        { detailVersion: 0 },
      ]),
    ).toBe(false);
  });

  it('re-fetches when nothing is stored', () => {
    expect(areStoredResultsCurrent([])).toBe(false);
  });
});

describe('toSessionResultsDto', () => {
  it('maps the enriched classification fields to camelCase', () => {
    const payload = SessionResultsSchema.parse(
      createPayload([
        {
          ...LEGACY_ROW,
          grid_position: 2,
          laps: 57,
          time_seconds: 5504.742,
          team_color: '#ff8000',
          headshot_url: HEADSHOT,
          country_code: 'GBR',
        },
      ]),
    );

    expect(toSessionResultsDto(payload).results[0]).toEqual(
      expect.objectContaining({
        gridPosition: 2,
        laps: 57,
        timeSeconds: 5504.742,
        teamColor: '#ff8000',
        headshotUrl: HEADSHOT,
        countryCode: 'GBR',
      }),
    );
  });

  it('accepts an older data service payload without the new fields', () => {
    const payload = SessionResultsSchema.parse(createPayload([LEGACY_ROW]));

    expect(toSessionResultsDto(payload).results[0]).toEqual(
      expect.objectContaining({
        gridPosition: null,
        headshotUrl: null,
        countryCode: null,
      }),
    );
  });

  it('rejects a headshot that is not a valid URL', () => {
    expect(() =>
      SessionResultsSchema.parse(
        createPayload([{ ...LEGACY_ROW, headshot_url: 'not a url' }]),
      ),
    ).toThrow();
  });
});
