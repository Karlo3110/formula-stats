import path from 'node:path';
import type { NextConfig } from 'next';

import { IMAGE_HOSTS } from './src/lib/f1/media-hosts';

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray parent lockfiles.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: 'https', hostname, pathname: '/**' })),
  },
};

export default nextConfig;
