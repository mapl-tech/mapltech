/**
 * Route registry for mapltech.com.
 *
 * Single source of truth for every indexable path and its last-modified date.
 * `src/app/sitemap.ts`, the llms.txt routes and the JSON-LD builders in
 * `src/lib/schema.ts` all read from here, so the sitemap, the AI-readable index
 * and the structured data can never disagree about which URLs exist.
 *
 * Dates are ISO 8601 calendar dates (YYYY-MM-DD). `REDESIGN_DATE` marks pages
 * reworked in the September 2026 interactive redesign; blog dates come from the
 * post data and are never guessed. Do not use `new Date()` here: a sitemap
 * whose every entry is "modified today" tells crawlers nothing.
 */
import { siteConfig } from '@/config/site';
import { blogPosts } from '@/data/blog-posts';

export const SITE_URL = siteConfig.url;

/** Pages touched by the 2026 interactive redesign carry this lastModified. */
export const REDESIGN_DATE = '2026-09-22';

export interface RouteEntry {
  /** Path relative to the site root, always starting with '/'. */
  path: string;
  /** ISO 8601 calendar date, YYYY-MM-DD. */
  lastModified: string;
}

/**
 * Static (non-blog) routes in sitemap order.
 * Keep every entry: removing a URL here removes it from the sitemap.
 */
export const staticRoutes: readonly RouteEntry[] = [
  { path: '/', lastModified: REDESIGN_DATE },

  // Service pages. `/services` itself is a redirect stub to
  // /services/web-development and was not touched by the redesign
  // (last commit 2026-02-28).
  { path: '/services', lastModified: '2026-02-28' },
  { path: '/services/web-development', lastModified: REDESIGN_DATE },
  { path: '/services/automation-ai-workflow-setup', lastModified: REDESIGN_DATE },
  { path: '/services/custom-internal-tools', lastModified: REDESIGN_DATE },
  { path: '/services/cloud-engineering', lastModified: REDESIGN_DATE },

  // High-value pages
  { path: '/pricing', lastModified: REDESIGN_DATE },
  { path: '/our-work', lastModified: REDESIGN_DATE },
  { path: '/labs', lastModified: REDESIGN_DATE },
  { path: '/about-us', lastModified: REDESIGN_DATE },
  { path: '/contact-us', lastModified: REDESIGN_DATE },

  // Blog index
  { path: '/blog', lastModified: REDESIGN_DATE },

  // Regional pages
  { path: '/nigeria', lastModified: REDESIGN_DATE },
  { path: '/jamaica', lastModified: REDESIGN_DATE },

  // Supporting pages
  { path: '/careers', lastModified: REDESIGN_DATE },
  { path: '/team', lastModified: REDESIGN_DATE },
  { path: '/referral', lastModified: REDESIGN_DATE },
  { path: '/privacy', lastModified: REDESIGN_DATE },
  { path: '/terms', lastModified: REDESIGN_DATE },
];

/**
 * Absolute URL for a site path. Absolute http(s) URLs pass through untouched.
 * '/' maps to the bare origin (no trailing slash) to match the existing
 * canonical `https://mapltech.com`.
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (path === '' || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

const MONTHS: Record<string, number> = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Normalise a human date ("August 31, 2026", "March 05, 2026") or an ISO
 * string to a YYYY-MM-DD calendar date without any timezone drift.
 * Throws on input it cannot read so a bad date fails the build instead of
 * shipping as `Invalid Date`.
 */
export function toISODate(input: string): string {
  const s = input.trim();

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const human = s.match(/^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (human) {
    const month = MONTHS[human[1].toLowerCase()];
    if (month) return `${human[3]}-${pad2(month)}-${pad2(Number(human[2]))}`;
  }

  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`toISODate: cannot parse "${input}"`);
  }
  return `${parsed.getUTCFullYear()}-${pad2(parsed.getUTCMonth() + 1)}-${pad2(parsed.getUTCDate())}`;
}

/** One route per blog post, dated from the post itself. */
export function blogRoutes(): RouteEntry[] {
  return blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    lastModified: toISODate(post.date),
  }));
}

let cachedRoutes: RouteEntry[] | undefined;
let cachedIndex: Map<string, string> | undefined;

/** Every indexable route, static first then blog, de-duplicated by path. */
export function allRoutes(): RouteEntry[] {
  if (!cachedRoutes) {
    const seen = new Set<string>();
    cachedRoutes = [...staticRoutes, ...blogRoutes()].filter((route) => {
      if (seen.has(route.path)) return false;
      seen.add(route.path);
      return true;
    });
  }
  return cachedRoutes;
}

function routeIndex(): Map<string, string> {
  if (!cachedIndex) {
    cachedIndex = new Map(allRoutes().map((route) => [route.path, route.lastModified]));
  }
  return cachedIndex;
}

/** Strip origin, query and fragment; collapse trailing slashes (except root). */
export function normalizePath(pathOrUrl: string): string {
  let path = pathOrUrl.startsWith(SITE_URL) ? pathOrUrl.slice(SITE_URL.length) : pathOrUrl;
  path = path.split('#')[0].split('?')[0];
  if (path === '') return '/';
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path.startsWith('/') ? path : `/${path}`;
}

/** ISO lastModified for a path or absolute mapltech.com URL, if it is indexable. */
export function routeLastModified(pathOrUrl: string): string | undefined {
  return routeIndex().get(normalizePath(pathOrUrl));
}

/** True when the path (or mapltech.com URL) is in the sitemap. */
export function isSitemapPath(pathOrUrl: string): boolean {
  return routeIndex().has(normalizePath(pathOrUrl));
}
