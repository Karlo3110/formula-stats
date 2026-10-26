import {
  COMPRESSION_THRESHOLD_BYTES,
  decodeCacheValue,
  encodeCacheValue,
} from './cache-codec';

interface ReplayLike {
  session: string;
  progress: number[];
  speed: number[];
  position: number[];
  status: number[];
}

const SAMPLE_COUNT = 5_000;

function buildLargeReplay(): ReplayLike {
  const samples = Array.from({ length: SAMPLE_COUNT }, (_, i) => i);
  return {
    session: 'R',
    progress: samples.map((i) => Math.round(i * 67.3) / 10),
    speed: samples.map((i) => 180 + ((i * 37) % 140)),
    position: samples.map((i) => 3 + Math.floor(i / 1_000)),
    status: samples.map(() => 0),
  };
}

function toBuffer(encoded: string | Buffer): Buffer {
  return typeof encoded === 'string' ? Buffer.from(encoded, 'utf8') : encoded;
}

describe('cache codec', () => {
  describe('encodeCacheValue', () => {
    it('stores small values as plain JSON', async () => {
      const encoded = await encodeCacheValue({ season: 2026 });

      expect(encoded).toBe('{"season":2026}');
    });

    it('stores large values compressed well below their JSON size', async () => {
      const replay = buildLargeReplay();
      const jsonBytes = Buffer.byteLength(JSON.stringify(replay));

      const encoded = await encodeCacheValue(replay);

      expect(jsonBytes).toBeGreaterThan(COMPRESSION_THRESHOLD_BYTES);
      expect(toBuffer(encoded).length).toBeLessThan(jsonBytes / 2);
    });
  });

  describe('decodeCacheValue', () => {
    it('round-trips a large compressed value', async () => {
      const replay = buildLargeReplay();

      const decoded = await decodeCacheValue<ReplayLike>(
        toBuffer(await encodeCacheValue(replay)),
      );

      expect(decoded).toEqual(replay);
    });

    it('round-trips a small plain value', async () => {
      const value = { code: 'VER', points: 25 };

      const decoded = await decodeCacheValue<typeof value>(
        toBuffer(await encodeCacheValue(value)),
      );

      expect(decoded).toEqual(value);
    });

    it('reads plain JSON entries written before compression existed', async () => {
      const legacy = Buffer.from(JSON.stringify({ round: 18 }), 'utf8');

      const decoded = await decodeCacheValue<{ round: number }>(legacy);

      expect(decoded).toEqual({ round: 18 });
    });
  });
});
