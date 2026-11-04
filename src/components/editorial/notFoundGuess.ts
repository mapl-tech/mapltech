import { matchesWords, wordsOf } from './archiveSearch';

/**
 * The 404's guess, from the missing path alone (NotFoundHint renders it).
 * Case does not matter ("/Services/Web-Design" reads as
 * "/services/web-design"), and a leading locale ("/en/", "/fr-ca/") is
 * dropped first.
 *
 * - A case study named outright anywhere in the path (its whole slug:
 *   "/case-study/lro-staffing"): that case study, before any other rule.
 * - Under /services or /our-work (and the names people guess for them:
 *   /case-studies, /cases, /portfolio): the nearest real page (the service or
 *   case study whose slug shares the most words with the missing one:
 *   "/services/web-design" finds Web Development), else that index.
 * - Under /blog (or /search): a blog search, only when it finds something.
 *   The words come from ?q= when it has any, else from the slug; of the
 *   meaningful ones (not a stop or page word: "/blog/old-post" has none) it
 *   takes the one finding the fewest articles but at least one, a tie going
 *   to the longer word. Else the search itself.
 * - Under any other real section (/pricing, /team, /careers, ... and the
 *   names people guess for them, such as /contact or /jobs): that section.
 * - A top-level slug: the service it names ("/web-development"), else an
 *   article search when it reads like an article's slug (3+ topic words) and
 *   finds something, else the nearest service or case study by any shared word.
 * - Nothing to go on ("/missing-page-xyz"): no guess (null).
 *
 * "Finds something" is counted with the archive's own matcher
 * (archiveSearch.ts) over the archive's own text, so the search offered shows
 * exactly what /blog then lists. Until those counts are known, a guess that
 * needs them is undefined. Pure and dependency-light: it ships with every page.
 */

/** A page the hint can point to: its slug under the section, and its name. */
export interface HintPage {
  slug: string;
  name: string;
}

export interface HintPages {
  services: readonly HintPage[];
  cases: readonly HintPage[];
}

export interface Hint {
  lead: string;
  label: string;
  href: string;
  /** A page guessed from the path itself: shown as the page's filled button. */
  specific?: boolean;
}

const SKIP = new Set([
  'the', 'and', 'for', 'how', 'why', 'what', 'when', 'your', 'you', 'our', 'with', 'from', 'that',
  'this', 'are', 'its', 'into', 'does', 'will', 'can', 'not', 'but', 'all', 'new', 'old', 'older',
  'guide', 'practical', 'complete', 'ultimate', 'tips', 'best', 'blog', 'post', 'posts', 'article',
  'articles', 'news', 'archive', 'category', 'tag', 'author', 'draft', 'copy', 'test', 'update',
  'updated', 'version',
  // Page words, not topics.
  'page', 'index', 'html', 'php', 'home', 'about', 'contact', 'team', 'careers', 'pricing',
  'services', 'service', 'work', 'search', 'case', 'cases', 'study', 'studies',
]);

/** A path's leading language segment ("en", "fr", "fr-ca"): other sites' convention, not part of the page's name. */
const LOCALE = /^(?:en|fr|es|de|pt|it|nl)(?:[-_][a-z]{2})?$/;

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
 * The words a blog search could use, each once: a slug's topic words of 4+
 * letters ("the-iam-misconfiguration-problem-2026" -> misconfiguration,
 * problem; "old-post" -> none), or of 3+ for a query someone typed ("seo").
 */
export function searchWords(text: string, least = 4): string[] {
  return [...new Set(topicWords(text).filter((word) => word.length >= least))];
}

/** How many archive articles a word finds. */
export type CountWord = (word: string) => number;

/** Counts over the archive's search text (/blog/search-index.json), matched as /blog matches. */
export function counter(texts: readonly string[]): CountWord {
  return (word) => {
    const words = wordsOf(word);
    return words.length ? texts.filter((text) => matchesWords(text, words)).length : 0;
  };
}

/**
 * The word worth searching: the one finding the fewest articles but at least
 * one (the most specific), a tie going to the longer word; '' when none finds
 * anything. The archive requires every word it is given, so one word keeps
 * matches in.
 */
export function bestWord(words: readonly string[], count: CountWord): string {
  let best = '';
  let fewest = Infinity;
  for (const word of words) {
    const found = count(word);
    if (found > 0 && (found < fewest || (found === fewest && word.length > best.length))) {
      best = word;
      fewest = found;
    }
  }
  return best;
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

/** A known page whose whole slug appears in the path, word for word ("lro-staffing" in "/case-study/lro-staffing"). */
export function namedIn(path: string, known: readonly HintPage[]): HintPage | null {
  const words = `-${tokens(path).join('-')}-`;
  return known.find((page) => words.includes(`-${tokens(page.slug).join('-')}-`)) ?? null;
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
  case: 'our-work',
  cases: 'our-work',
  'case-study': 'our-work',
  'case-studies': 'our-work',
  labs: 'our-work',
  articles: 'blog',
  news: 'blog',
  insights: 'blog',
  search: 'blog',
  prices: 'pricing',
  about: 'about-us',
  contact: 'contact-us',
  jobs: 'careers',
  career: 'careers',
  'privacy-policy': 'privacy',
  'terms-of-service': 'terms',
  'terms-of-use': 'terms',
};

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

/** A blog search for the most specific of the words, or null when none finds anything. */
function articleHint(words: readonly string[], count: CountWord): Hint | null {
  const word = bestWord(words, count);
  return word
    ? {
        lead: SECTIONS.blog.lead,
        label: `Search the blog for “${word}”`,
        href: `/blog?q=${encodeURIComponent(word)}#archive`,
        specific: true,
      }
    : null;
}

export interface HintOptions {
  /** The address's query string ("?q=wcag"): a search someone ran on the old address. */
  search?: string;
  /** Article counts from the archive; null or absent until they are known. */
  count?: CountWord | null;
}

/**
 * The recovery line for a missing path: a hint, null when the path gives
 * nothing to go on, or undefined when the guess is a blog search and the
 * archive's counts (`count`) are not known yet.
 */
export function hintFor(
  pathname: string,
  pages: HintPages = { services: [], cases: [] },
  { search = '', count = null }: HintOptions = {},
): Hint | null | undefined {
  const segments = pathname.toLowerCase().split('/').filter(Boolean);
  if (segments.length && LOCALE.test(segments[0])) segments.shift();
  const [first = '', ...rest] = segments;
  const head = first.replace(/\.(html?|php|aspx?)$/, '');
  const section = Object.hasOwn(ALIASES, head) ? ALIASES[head] : head;
  const tail = rest.join('-');
  const slug = [head, ...rest].join('-');

  // A case study named outright wins over every word rule.
  const named = namedIn(slug, pages.cases);
  if (named) return caseHint(named);

  if (section === 'services') {
    const match = tail ? nearest(tail, pages.services) : null;
    return match ? serviceHint(match) : SECTIONS.services;
  }
  if (section === 'our-work') {
    const match = tail ? nearest(tail, pages.cases) : null;
    return match ? caseHint(match) : SECTIONS['our-work'];
  }
  if (section === 'blog') {
    const typed = searchWords(new URLSearchParams(search).get('q') ?? '', 3);
    const words = typed.length ? typed : searchWords(tail);
    if (!words.length) return SECTIONS.blog;
    if (!count) return undefined;
    return articleHint(words, count) ?? SECTIONS.blog;
  }
  if (Object.hasOwn(SECTIONS, section)) return SECTIONS[section];
  // A top-level slug: a service it names outright (two of its words), an
  // article's slug, then any service or case study it shares a word with.
  const service = nearest(slug, pages.services, 2);
  if (service) return serviceHint(service);
  const words = searchWords(slug);
  if (topicWords(slug).length >= 3 && words.length) {
    if (!count) return undefined;
    const found = articleHint(words, count);
    if (found) return found;
  }
  const near = nearest(slug, pages.services);
  if (near) return serviceHint(near);
  const work = nearest(slug, pages.cases);
  return work ? caseHint(work) : null;
}
