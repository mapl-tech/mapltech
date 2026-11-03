'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsClient } from '@/components/ui/useMediaQuery';
import styles from './NotFound.module.scss';

/**
 * Path-aware recovery for the 404, on every path: a missing /services/... or
 * /our-work/... page points to that index; anything else offers a blog search
 * for the URL's most distinctive word (the archive reads ?q= and filters on
 * load); a URL with no usable word offers the search itself.
 *
 * The 404 is one static page, so the path is only known in the browser. The
 * server HTML (and the hydration pass) carry the generic line, then the
 * path-aware one replaces it inside a box reserved for two lines, so the
 * actions under it never move. The root not-found is part of every page's
 * payload, so this file stays tiny: no data imports.
 */

const SKIP = new Set([
  'the', 'and', 'for', 'how', 'why', 'what', 'when', 'your', 'you', 'our', 'with', 'from', 'that',
  'this', 'are', 'its', 'into', 'does', 'will', 'can', 'not', 'but', 'all', 'new', 'guide',
  'practical', 'complete', 'ultimate', 'tips', 'best', 'blog', 'post',
  // Page words, not topics.
  'page', 'index', 'html', 'php', 'home', 'about', 'contact', 'team', 'careers', 'pricing',
  'services', 'service', 'work',
]);

/**
 * The most distinctive (longest) word of a slug:
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

interface Hint {
  lead: string;
  label: string;
  href: string;
}

const SEARCH: Hint = { lead: 'Looking for an article?', label: 'Search all articles', href: '/blog#archive-q' };

/** The recovery line for a missing path. */
export function hintFor(pathname: string): Hint {
  const [section = '', ...rest] = pathname.split('/').filter(Boolean);
  if (section === 'services') return { lead: 'Looking for a service?', label: 'See all our services', href: '/services' };
  if (section === 'our-work') return { lead: 'Looking for a project?', label: 'See all our work', href: '/our-work' };
  const word = slugWords([section, ...rest].join('-'));
  if (!word) return SEARCH;
  return { lead: SEARCH.lead, label: `Search the blog for “${word}”`, href: `/blog?q=${encodeURIComponent(word)}#archive` };
}

export default function NotFoundHint() {
  const pathname = usePathname() ?? '';
  const known = useIsClient();
  const hint = known ? hintFor(pathname) : SEARCH;

  return (
    <p className={styles.hint}>
      {hint.lead}{' '}
      <Link href={hint.href} className={styles.hintLink} data-cta-placement="not_found_hint">
        {hint.label}
      </Link>
    </p>
  );
}

/**
 * "Tell us about this broken link": an email to the site address. Once the
 * browser knows them, the subject names the path and the body carries the
 * full address and the page the link was on, so it can be fixed at the source.
 */
export function BrokenLinkReport({ email }: { email: string }) {
  const pathname = usePathname() ?? '';
  const known = useIsClient();
  let query = `subject=${encodeURIComponent('Broken link on mapltech.com')}`;
  if (known && pathname) {
    const from = document.referrer ? `\nLinked from: ${document.referrer}` : '';
    query = `subject=${encodeURIComponent(`Broken link: ${pathname}`)}&body=${encodeURIComponent(
      `Page not found: ${window.location.href}${from}\n`,
    )}`;
  }

  return (
    <p className={styles.report}>
      Followed a link that should work?{' '}
      <a href={`mailto:${email}?${query}`} className={styles.reportLink}>
        Tell us about this broken link
      </a>
    </p>
  );
}
