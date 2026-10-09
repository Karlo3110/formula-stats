import path from 'node:path';
import type { NextConfig } from 'next';

import { IMAGE_HOSTS } from './src/lib/f1/media-hosts';

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray parent lockfiles.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Headshots and flags are already sized by their CDNs; serving them directly
    // avoids paying for an image optimization per source image and size.
    // Hosts are still allow-listed by safeImageUrl().
    unoptimized: true,
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: 'https', hostname, pathname: '/**' })),
  },
};

export default nextConfig;
