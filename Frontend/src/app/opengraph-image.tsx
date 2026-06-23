import { ImageResponse } from 'next/og';

// Static Open Graph / Twitter card image, generated at build time and reused
// across every route. Self-contained (no asset files) so social previews look
// professional out of the box.
export const alt =
  'Formula Stats — F1 telemetry, standings & 3D race replays';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{ width: 12, height: 56, borderRadius: 999, background: '#2f7bf6' }}
          />
          <div
            style={{
              fontSize: 30,
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: '#9fb4c8',
            }}
          >
            Formula Stats
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

        <div style={{ marginTop: 28, fontSize: 30, color: '#9fb4c8', maxWidth: 880 }}>
          Follow every Grand Prix, explore driver and constructor standings, and
          learn how the sport works.
        </div>
      </div>
    ),
    size,
  );
}
