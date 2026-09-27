import { renderLlmsTxt } from '@/lib/llms';

/**
 * /llms.txt: concise, AI-readable index of MAPL TECH, generated at build
 * time from the same data the pages render. Replaces the hand-written
 * public/llms.txt. Served as Markdown and kept out of search indexes; the
 * pages it links to are the indexable surface.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(renderLlmsTxt(), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
