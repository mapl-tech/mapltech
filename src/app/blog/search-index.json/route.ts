import { blogPosts } from '@/data/blog-posts';
import { firstSentence } from '@/components/convert/blog-utils';
import { topicLabel } from '@/components/editorial/services';
import { archiveText } from '@/components/editorial/archiveSearch';

/**
 * /blog/search-index.json: every article's search text (its title, one-line
 * answer and topic), built exactly as the /blog archive builds it, so a count
 * made over it agrees with what the archive lists. The 404 fetches it only
 * when a missing address suggests a blog search, and offers that search only
 * when it finds something (NotFoundHint). The 404 ships with every page, so
 * this text is not bundled into it. Generated at build time from the same
 * data the blog renders, and kept out of search indexes.
 */
export const dynamic = 'force-static';

export function GET(): Response {
  const texts = blogPosts.map((post) => archiveText(post.title, firstSentence(post.excerpt), topicLabel(post.category)));
  return Response.json(texts, {
    headers: {
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
