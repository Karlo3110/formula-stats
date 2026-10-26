import { promisify } from 'node:util';
import { gunzip, gzip } from 'node:zlib';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * Serialized values at least this large are stored gzipped. Replays are
 * several MB of JSON numbers and shrink ~5-8x, which is most of the memory
 * Redis holds; small values are not worth the CPU.
 */
export const COMPRESSION_THRESHOLD_BYTES = 8 * 1024;

const GZIP_MAGIC = [0x1f, 0x8b] as const;

function isGzipped(raw: Buffer): boolean {
  return raw[0] === GZIP_MAGIC[0] && raw[1] === GZIP_MAGIC[1];
}

/** Serializes a cache value, gzipping it when it is large. */
export async function encodeCacheValue<T>(value: T): Promise<string | Buffer> {
  const json = JSON.stringify(value);
  if (Buffer.byteLength(json) < COMPRESSION_THRESHOLD_BYTES) {
    return json;
  }
  return gzipAsync(json);
}

/**
 * Restores a value written by `encodeCacheValue`. Plain JSON never starts
 * with the gzip magic bytes, so entries written before compression existed
 * still decode.
 */
export async function decodeCacheValue<T>(raw: Buffer): Promise<T> {
  const json = isGzipped(raw) ? await gunzipAsync(raw) : raw;
  return JSON.parse(json.toString('utf8')) as T;
}
