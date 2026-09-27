import { renderLlmsFullTxt } from '@/lib/llms';

/**
 * /llms-full.txt: the complete AI-readable index (services with every tier,
 * work, team, careers, all blog posts). Generated at build time from site
 * data and capped at 80KB by renderLlmsFullTxt(). Not indexable itself.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(renderLlmsFullTxt(), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
