'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsClient } from '@/components/ui/useMediaQuery';
import styles from './NotFound.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * Path-aware recovery for the 404. A missing /services/... or /our-work/...
 * page first looks for the nearest real one (the service or case study whose
 * slug shares the most words with the missing path: "/services/web-design"
 * finds Web Development), else points to that index. A blog path, or a slug
 * long enough to be an article's (3+ topic words), offers a blog search for
 * its most distinctive word (the archive reads ?q= and filters on load).
 * Anything else ("/missing-page-xyz") offers the search itself, unguessed.
 * A specific hint is the page's filled button; "Start a project" then steps
 * back to an outline (NotFound.module.scss, via :has).
 *
 * The 404 is one static page, so the path is only known in the browser. The
 * server HTML (and the hydration pass) carry the generic line, then the
 * path-aware one replaces it inside a box reserved for two lines (a one-line
 * button fills it), so the actions under it never move. The root not-found is
 * part of every page's payload, so this file stays tiny: no data imports; the
 * known pages arrive as props (slugs and names only).
 */

/** A page the hint can point to: its slug under the section, and its name. */
export interface HintPage {
  slug: string;
  name: string;
}

const SKIP = new Set([
  'the', 'and', 'for', 'how', 'why', 'what', 'when', 'your', 'you', 'our', 'with', 'from', 'that',
  'this', 'are', 'its', 'into', 'does', 'will', 'can', 'not', 'but', 'all', 'new', 'guide',
  'practical', 'complete', 'ultimate', 'tips', 'best', 'blog', 'post',
  // Page words, not topics.
  'page', 'index', 'html', 'php', 'home', 'about', 'contact', 'team', 'careers', 'pricing',
  'services', 'service', 'work',
]);

/** A path segment's words: decoded, lower case, split on anything but letters and digits. */
function tokens(text: string): string[] {
  let decoded = text;
  try {
    decoded = decodeURIComponent(text);
  } catch {
    // Malformed escapes: read the raw text.
  }
  return decoded.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/** The words worth searching for: 3+ characters, not a number, not a stop or page word. */
function topicWords(slug: string): string[] {
  return tokens(slug).filter((word) => word.length > 2 && !/^\d+$/.test(word) && !SKIP.has(word));
}

/**
 * The most distinctive (longest) word of a slug:
 * "the-iam-misconfiguration-problem-2026" -> "misconfiguration".
 * The archive requires every word it is given, so one word keeps matches in.
 */
export function slugWords(slug: string): string {
  return topicWords(slug).reduce((longest, word) => (word.length > longest.length ? word : longest), '');
}

/** Same word, or one (3+ letters) begins the other: "dev" ~ "development", "website" ~ "web". */
function sameWord(a: string, b: string): boolean {
  return a === b || (a.length >= 3 && b.startsWith(a)) || (b.length >= 3 && a.startsWith(b));
}

/**
 * The known page whose slug shares the most words with the missing one
 * ("ai" counts, so 2-letter words are kept); the first in order on a tie,
 * none when no word is shared.
 */
export function nearest(missing: string, known: readonly HintPage[]): HintPage | null {
  const words = tokens(missing).filter((word) => word.length > 1 && !SKIP.has(word));
  let best: HintPage | null = null;
  let bestScore = 0;
  for (const page of known) {
    const theirs = tokens(page.slug);
    const score = words.filter((word) => theirs.some((other) => sameWord(word, other))).length;
    if (score > bestScore) {
      best = page;
      bestScore = score;
    }
  }
  return best;
}

interface Hint {
  lead: string;
  label: string;
  href: string;
  /** Guessed from the path itself: shown as the page's filled button. */
  specific?: boolean;
}

const SEARCH: Hint = { lead: 'Looking for an article?', label: 'Search all articles', href: '/blog#archive-q' };

export interface HintPages {
  services: readonly HintPage[];
  cases: readonly HintPage[];
}

/** The recovery line for a missing path. */
export function hintFor(pathname: string, pages: HintPages = { services: [], cases: [] }): Hint {
  const [section = '', ...rest] = pathname.split('/').filter(Boolean);
  const tail = rest.join('-');
  if (section === 'services') {
    const match = tail ? nearest(tail, pages.services) : null;
    return match
      ? { lead: 'Looking for a service?', label: `See our ${match.name} service`, href: `/services/${match.slug}`, specific: true }
      : { lead: 'Looking for a service?', label: 'See all our services', href: '/services' };
  }
  if (section === 'our-work') {
    const match = tail ? nearest(tail, pages.cases) : null;
    return match
      ? { lead: 'Looking for a project?', label: `See the ${match.name} case study`, href: `/our-work/${match.slug}`, specific: true }
      : { lead: 'Looking for a project?', label: 'See all our work', href: '/our-work' };
  }
  // Only a blog path, or a slug that reads like an article's, is worth a guess.
  const slug = section === 'blog' ? tail : [section, ...rest].join('-');
  if (section !== 'blog' && topicWords(slug).length < 3) return SEARCH;
  const word = slugWords(slug);
  if (!word) return SEARCH;
  return {
    lead: SEARCH.lead,
    label: `Search the blog for “${word}”`,
    href: `/blog?q=${encodeURIComponent(word)}#archive`,
    specific: true,
  };
}

export default function NotFoundHint({ services = [], cases = [] }: Partial<HintPages>) {
  const pathname = usePathname() ?? '';
  const known = useIsClient();
  const hint = known ? hintFor(pathname, { services, cases }) : SEARCH;

  return (
    <p className={styles.hint}>
      {hint.specific ? (
        <Link href={hint.href} className={styles.hintButton} data-cta-placement="not_found_hint">
          {hint.label}
          <span aria-hidden="true" className={styles.arrow}>
            <Arrow />
          </span>
        </Link>
      ) : (
        <>
          {hint.lead}{' '}
          <Link href={hint.href} className={styles.hintLink} data-cta-placement="not_found_hint">
            {hint.label}
          </Link>
        </>
      )}
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
