import type { MetadataRoute } from 'next';
import { absoluteUrl, allRoutes } from '@/config/routes';

/**
 * Every indexable URL with a real ISO lastModified.
 * Routes and dates live in src/config/routes.ts (static pages) and
 * src/data/blog-posts.ts (posts). No changeFrequency/priority: Google ignores
 * both, and a stale lastModified is worse than none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return allRoutes().map(({ path, lastModified }) => ({
    url: absoluteUrl(path),
    lastModified,
  }));
}
