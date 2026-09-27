import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/routes';

/**
 * Crawl policy.
 *
 * - Everyone may fetch the pages plus the static chunks and the image
 *   optimiser (`/_next/static/`, `/_next/image`): blocking `/_next/` blinds
 *   Google's renderer to CSS and JS and hurts rendering-dependent signals.
 * - `/api/` is never indexable.
 * - The AI search crawlers that send referral traffic and cite sources
 *   (OAI-SearchBot, Claude-SearchBot, PerplexityBot, Applebot for Siri and
 *   Spotlight) get explicit allow groups so a future `*` tightening cannot
 *   accidentally lock them out.
 *
 * Decision, recorded for the September 2026 redesign: training-only
 * crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot) stay on the default
 * `*` allow. MAPL TECH wants to be recommended by assistants, and models
 * that never saw the site cannot recommend it; nothing here is proprietary.
 * If that position changes, add a disallow group for those agents below.
 */
const PUBLIC_ALLOW = ['/', '/_next/static/', '/_next/image'];
const PUBLIC_DISALLOW = ['/api/'];

const AI_SEARCH_BOTS = ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'Applebot'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: PUBLIC_ALLOW,
        disallow: PUBLIC_DISALLOW,
      },
      ...AI_SEARCH_BOTS.map((userAgent) => ({
        userAgent,
        allow: PUBLIC_ALLOW,
        disallow: PUBLIC_DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
