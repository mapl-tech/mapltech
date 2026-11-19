import type { NextConfig } from "next";
import { LEGACY_LINKS } from "./src/config/legacyLinks";

/** Requests to bio.mapltech.com, the video sales page for the social bios (src/app/bio). */
const BIO_HOST = { type: 'host' as const, value: 'bio.mapltech.com' };

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  poweredByHeader: false,
  async redirects() {
    return [
      // Old service paths still linked from older posts and elsewhere (permanent).
      ...Object.entries(LEGACY_LINKS).map(([source, destination]) => ({ source, destination, permanent: true })),
      // bio.mapltech.com has one page, at its root (see rewrites): /bio there goes to the root,
      // and any other page path goes to mapltech.com, so the main site is never served twice.
      // Files (anything with an extension), /_next, /api and /images stay on the subdomain:
      // the page's own scripts, video, images and form use them.
      { source: '/bio', has: [BIO_HOST], destination: '/', permanent: true },
      {
        source: '/:path((?!_next/|api/|images/|bio$)[^.]+)',
        has: [BIO_HOST],
        destination: 'https://mapltech.com/:path',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      // Before the filesystem: "/" would otherwise match the homepage (src/app/(site)/page.tsx).
      beforeFiles: [{ source: '/', has: [BIO_HOST], destination: '/bio' }],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
