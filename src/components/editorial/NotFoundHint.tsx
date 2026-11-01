'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './NotFound.module.scss';

/**
 * Path-aware recovery for the 404. Most stale links here are old article URLs,
 * so a missing /blog/<slug> offers a blog search for the slug's distinctive
 * words (the archive reads ?q= and filters on load). Any other path: nothing.
 */

const SKIP = new Set([
  'the', 'and', 'for', 'how', 'why', 'what', 'when', 'your', 'you', 'our', 'with', 'from', 'that',
  'this', 'are', 'its', 'into', 'does', 'will', 'can', 'not', 'but', 'all', 'new', 'guide',
  'practical', 'complete', 'ultimate', 'tips', 'best', 'blog', 'post',
]);

/**
 * The most distinctive (longest) word of the slug:
 * "the-iam-misconfiguration-problem-2026" -> "misconfiguration".
 * The archive requires every word it is given, so one word keeps matches in.
 */
export function slugWords(slug: string): string {
  let text = slug;
  try {
    text = decodeURIComponent(slug);
  } catch {
    // Malformed escapes: search the raw text.
  }
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !/^\d+$/.test(word) && !SKIP.has(word));
  return words.reduce((longest, word) => (word.length > longest.length ? word : longest), '');
}

export default function NotFoundHint() {
  const pathname = usePathname() ?? '';
  const match = pathname.match(/^\/blog\/([^/]+)/);
  const words = match ? slugWords(match[1]) : '';
  if (!words) return null;

  return (
    <p className={styles.hint}>
      Looking for an article?{' '}
      <Link href={`/blog?q=${encodeURIComponent(words)}#archive`} className={styles.hintLink}>
        Search the blog for &ldquo;{words}&rdquo;
      </Link>
    </p>
  );
}
