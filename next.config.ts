import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://image.tmdb.org/t/p/**')],
    // unoptimized: process.env.CI === 'true', // to prevent timeout issues in ci
    unoptimized: true, // to prevent the bills...
  },
  async rewrites() {
    return [
      {
        source: '/stats.js',
        destination: 'https://cloud.umami.is/script.js',
      },
    ];
  },
};

export default nextConfig;
