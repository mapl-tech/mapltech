'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsClient } from '@/components/ui/useMediaQuery';
import styles from './NotFound.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * Path-aware recovery for the 404, guessed from the missing path (case does
 * not matter: "/Services/Web-Design" reads as "/services/web-design").
 *
 * - Under /services or /our-work: the nearest real page (the service or case
 *   study whose slug shares the most words with the missing one:
 *   "/services/web-design" finds Web Development), else that index.
 * - Under /blog: a blog search for the slug's most distinctive meaningful
 *   word (4+ letters, not a stop word: "/blog/old-post" has none), else the
 *   search itself. The archive reads ?q= and matches it where words start.
 * - Under any other real section (/pricing, /team, /careers, ... and the
 *   names people guess for them, such as /contact or /jobs): that section.
 * - A top-level slug: the service it names ("/web-development"), else an
 *   article search when it reads like an article's slug (3+ topic words),
 *   else the nearest service or case study by any shared word.
 * - Nothing to go on ("/missing-page-xyz"): no guess. The line then holds the
 *   broken-link report, which otherwise closes the page (BrokenLinkReport),
 *   so no line repeats a destination listed below it.
 *
 * A page-level guess is the page's filled button; "Start a project" then
 * steps back to an outline (NotFound.module.scss, via :has). The 404 is one
 * static page, so the path is only known in the browser: the server HTML
 * (and the hydration pass) carry the report line, then the guess replaces it
 * inside a box reserved for two lines (a one-line button fills it), so the
 * actions under it never move. The root not-found is part of every page's
 * payload, so this file stays tiny: no data imports; the known pages arrive
 * as props (slugs and names only).
 */

/** A page the hint can point to: its slug under the section, and its name. */
export interface HintPage {
  slug: string;
  name: string;
}

const SKIP = new Set([
  'the', 'and', 'for', 'how', 'why', 'what', 'when', 'your', 'you', 'our', 'with', 'from', 'that',
  'this', 'are', 'its', 'into', 'does', 'will', 'can', 'not', 'but', 'all', 'new', 'old', 'older',
  'guide', 'practical', 'complete', 'ultimate', 'tips', 'best', 'blog', 'post', 'posts', 'article',
  'articles', 'news', 'archive', 'category', 'tag', 'author', 'draft', 'copy', 'test', 'update',
  'updated', 'version',
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

/** The words that could be a topic: 3+ characters, not a number, not a stop or page word. */
function topicWords(slug: string): string[] {
  return tokens(slug).filter((word) => word.length > 2 && !/^\d+$/.test(word) && !SKIP.has(word));
}

/**
 * The most distinctive (longest) meaningful word of a slug, 4+ letters:
 * "the-iam-misconfiguration-problem-2026" -> "misconfiguration"; "old-post"
 * -> "" (no guess). The archive requires every word it is given, so one word
 * keeps matches in.
 */
export function slugWords(slug: string): string {
  return topicWords(slug)
    .filter((word) => word.length >= 4)
    .reduce((longest, word) => (word.length > longest.length ? word : longest), '');
}

/** Same word, or one (3+ letters) begins the other: "dev" ~ "development", "website" ~ "web". */
function sameWord(a: string, b: string): boolean {
  return a === b || (a.length >= 3 && b.startsWith(a)) || (b.length >= 3 && a.startsWith(b));
}

/**
 * The known page whose slug shares the most words with the missing one
 * ("ai" counts, so 2-letter words are kept), at least `least` of them; the
 * first in order on a tie, none below that.
 */
export function nearest(missing: string, known: readonly HintPage[], least = 1): HintPage | null {
  const words = tokens(missing).filter((word) => word.length > 1 && !SKIP.has(word));
  let best: HintPage | null = null;
  let bestScore = least - 1;
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
  /** A page guessed from the path itself: shown as the page's filled button. */
  specific?: boolean;
}

/** The site's sections by their first path segment: where a missing page under one points. */
const SECTIONS: Readonly<Record<string, Hint>> = {
  services: { lead: 'Looking for a service?', label: 'See all our services', href: '/services' },
  'our-work': { lead: 'Looking for a project?', label: 'See all our work', href: '/our-work' },
  blog: { lead: 'Looking for an article?', label: 'Search all articles', href: '/blog#archive-q' },
  pricing: { lead: 'Looking for prices?', label: 'See pricing', href: '/pricing' },
  'about-us': { lead: 'Want to know who we are?', label: 'About MAPL TECH', href: '/about-us' },
  team: { lead: 'Looking for someone?', label: 'Meet the team', href: '/team' },
  careers: { lead: 'Looking for a job?', label: 'Careers at MAPL TECH', href: '/careers' },
  'contact-us': { lead: 'Want to reach us?', label: 'Contact MAPL TECH', href: '/contact-us' },
  referral: { lead: 'Want to introduce an agency?', label: 'See the referral program', href: '/referral' },
  privacy: { lead: 'Looking for the privacy policy?', label: 'Read the privacy policy', href: '/privacy' },
  terms: { lead: 'Looking for the terms?', label: 'Read the terms of use', href: '/terms' },
  nigeria: { lead: 'Looking for an office?', label: 'MAPL TECH Nigeria', href: '/nigeria' },
  jamaica: { lead: 'Looking for an office?', label: 'MAPL TECH Jamaica', href: '/jamaica' },
};

/**
 * Other names for those sections: this site's earlier and guessed addresses
 * (the bare ones redirect, config/legacyLinks.ts; anything under them lands
 * here) and other sites' conventions.
 */
const ALIASES: Readonly<Record<string, string>> = {
  service: 'services',
  work: 'our-work',
  portfolio: 'our-work',
  projects: 'our-work',
  'case-studies': 'our-work',
  labs: 'our-work',
  articles: 'blog',
  news: 'blog',
  insights: 'blog',
  prices: 'pricing',
  about: 'about-us',
  contact: 'contact-us',
  jobs: 'careers',
  career: 'careers',
  'privacy-policy': 'privacy',
  'terms-of-service': 'terms',
  'terms-of-use': 'terms',
};

export interface HintPages {
  services: readonly HintPage[];
  cases: readonly HintPage[];
}

const serviceHint = (page: HintPage): Hint => ({
  lead: SECTIONS.services.lead,
  label: `See our ${page.name} service`,
  href: `/services/${page.slug}`,
  specific: true,
});

const caseHint = (page: HintPage): Hint => ({
  lead: SECTIONS['our-work'].lead,
  label: `See the ${page.name} case study`,
  href: `/our-work/${page.slug}`,
  specific: true,
});

/** A blog search for the slug's meaningful word, or null when it has none. */
function articleHint(slug: string): Hint | null {
  const word = slugWords(slug);
  return word
    ? {
        lead: SECTIONS.blog.lead,
        label: `Search the blog for “${word}”`,
        href: `/blog?q=${encodeURIComponent(word)}#archive`,
        specific: true,
      }
    : null;
}

/** The recovery line for a missing path, or null when the path gives nothing to go on. */
export function hintFor(pathname: string, pages: HintPages = { services: [], cases: [] }): Hint | null {
  const [first = '', ...rest] = pathname.toLowerCase().split('/').filter(Boolean);
  const head = first.replace(/\.(html?|php|aspx?)$/, '');
  const section = Object.hasOwn(ALIASES, head) ? ALIASES[head] : head;
  const tail = rest.join('-');
  if (section === 'services') {
    const match = tail ? nearest(tail, pages.services) : null;
    return match ? serviceHint(match) : SECTIONS.services;
  }
  if (section === 'our-work') {
    const match = tail ? nearest(tail, pages.cases) : null;
    return match ? caseHint(match) : SECTIONS['our-work'];
  }
  if (section === 'blog') return articleHint(tail) ?? SECTIONS.blog;
  if (Object.hasOwn(SECTIONS, section)) return SECTIONS[section];
  // A top-level slug: a service it names outright (two of its words), an
  // article's slug, then any service or case study it shares a word with.
  const slug = [head, ...rest].join('-');
  const named = nearest(slug, pages.services, 2);
  if (named) return serviceHint(named);
  if (topicWords(slug).length >= 3) {
    const search = articleHint(slug);
    if (search) return search;
  }
  const service = nearest(slug, pages.services);
  if (service) return serviceHint(service);
  const work = nearest(slug, pages.cases);
  return work ? caseHint(work) : null;
}

/** The path's guess once the browser knows the path (null before then, and when there is none). */
function usePathHint(pages: HintPages): Hint | null {
  const pathname = usePathname() ?? '';
  const known = useIsClient();
  return known ? hintFor(pathname, pages) : null;
}

/**
 * "Tell us about this broken link": an email to the site address. Once the
 * browser knows them, the subject names the path and the body carries the
 * full address and the page the link was on, so it can be fixed at the source.
 */
function ReportLine({ email }: { email: string }) {
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
    <>
      Followed a link that should work?{' '}
      <a href={`mailto:${email}?${query}`} className={styles.reportLink}>
        Tell us about this broken link
      </a>
    </>
  );
}

export default function NotFoundHint({ services = [], cases = [], email }: Partial<HintPages> & { email: string }) {
  const hint = usePathHint({ services, cases });

  return (
    <p className={styles.hint}>
      {!hint ? (
        <ReportLine email={email} />
      ) : hint.specific ? (
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

/** The report at the end of the page, when a guess holds the line it would otherwise take. */
export function BrokenLinkReport({ services = [], cases = [], email }: Partial<HintPages> & { email: string }) {
  const hint = usePathHint({ services, cases });
  if (!hint) return null;
  return (
    <p className={styles.report}>
      <ReportLine email={email} />
    </p>
  );
}
