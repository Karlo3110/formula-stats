import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Static Open Graph / Twitter card image, generated at build time and reused
// across every route. The brand mark is the same SVG as the favicon.
export const alt =
  'Formula Stats — F1 telemetry, standings & 3D race replays';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARK_SIZE = 96;
const TAGLINE = 'Follow every Grand Prix and explore driver and team standings.';

function brandMarkDataUri(): string {
  const svg = readFileSync(join(process.cwd(), 'src/app/icon.svg'), 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background:
            'radial-gradient(1200px 600px at 80% -10%, #14304f 0%, #0a0e0f 55%)',
          color: '#f7fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <img src={brandMarkDataUri()} width={MARK_SIZE} height={MARK_SIZE} alt="" />
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#f3f6fb',
            }}
          >
            Formula<span style={{ color: '#3b7cf5', marginLeft: 14 }}>Stats</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 36,
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 920,
          }}
        >
          F1 telemetry, standings & 3D race replays
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: '#9fb4c8' }}>{TAGLINE}</div>
      </div>
    ),
    size,
  );
}
