import type { MetadataRoute } from 'next';

/**
 * Web app manifest. A complete manifest is one of the signals of a polished,
 * legitimate site that ad networks and search engines look for.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Formula Stats — F1 telemetry, standings & 3D race replays',
    short_name: 'Formula Stats',
    description:
      'Formula 1 telemetry, championship standings, driver stats, and 3D race replays. Learn the sport and follow every Grand Prix.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0e0f',
    theme_color: '#0a0e0f',
    categories: ['sports', 'education', 'entertainment'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
