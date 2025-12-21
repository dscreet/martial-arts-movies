import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://image.tmdb.org/t/p/**')],
    unoptimized: process.env.CI === 'true', // to prevent timeout issues in ci
    // unoptimized: true,
  },
  /* config options here */
};

export default nextConfig;
