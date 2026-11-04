import { describe, expect, it } from 'vitest';
import { listedProjects } from '@/config/site';
import { SERVICE_META } from '@/lib/estimate';
import { blogPosts } from '@/data/blog-posts';
import { firstSentence } from '@/components/convert/blog-utils';
import { SERVICE_KEYS, topicLabel } from './services';
import { archiveText, startsWord, wordsOf } from './archiveSearch';
import { bestWord, counter, hintFor, namedIn, searchWords, type CountWord, type Hint, type HintPages } from './notFoundGuess';

// The pages the 404 is given, built as app/not-found.tsx builds them (from config).
const PAGES: HintPages = {
  services: SERVICE_KEYS.map((key) => ({ slug: SERVICE_META[key].slug, name: SERVICE_META[key].label })),
  cases: listedProjects().map((project) => ({ slug: project.slug, name: project.title })),
};

/** A fixed archive: counts per word, so the rules are tested apart from the posts. */
const fixed = (table: Record<string, number>): CountWord => (word) => table[word] ?? 0;
const NONE: CountWord = () => 0;
/** What the visitor sees: where the line goes, and whether it is the page's filled button. */
const line = (hint: Hint | null | undefined) => (hint ? { href: hint.href, filled: Boolean(hint.specific) } : hint);

describe('the archive matcher the 404 counts with', () => {
  it('matches where a word starts, accent-free and in any case', () => {
    const text = archiveText('AI agents for Café owners', 'Maintain WCAG accessibility.', 'Automation & AI');
    expect(startsWord(text, 'ai')).toBe(true);
    expect(startsWord(text, 'tain')).toBe(false); // inside "maintain"
    expect(startsWord(text, 'access')).toBe(true); // "accessibility", as you type
    expect(startsWord(text, 'cafe')).toBe(true);
    expect(wordsOf('  WCAG   Café ')).toEqual(['wcag', 'cafe']);
  });

  it('counts the articles holding every word of the query', () => {
    const count = counter([
      archiveText('A WCAG guide', 'Accessibility first.', 'Web Development'),
      archiveText('AI agents', 'Evals before launch.', 'Automation & AI'),
    ]);
    expect(count('wcag')).toBe(1);
    expect(count('access')).toBe(1);
    expect(count('agents evals')).toBe(1);
    expect(count('zzzz')).toBe(0);
    expect(count('')).toBe(0);
  });
});

describe('aliases for the work pages', () => {
  it.each(['/case-studies', '/cases', '/case', '/case-study', '/portfolio'])('%s points to all our work', (path) => {
    expect(line(hintFor(path, PAGES))).toEqual({ href: '/our-work', filled: false });
  });

  it('a case slug under an alias finds its case study', () => {
    expect(line(hintFor('/cases/chha-ncr', PAGES))).toEqual({ href: '/our-work/chha-ncr', filled: true });
    expect(line(hintFor('/case/mapl-tours', PAGES))).toEqual({ href: '/our-work/mapl-tours', filled: true });
  });
});

describe('a case study named in the path comes first', () => {
  it('beats the article word rule (it never needs the archive)', () => {
    const staffing = fixed({ staffing: 3 });
    expect(hintFor('/case-study/lro-staffing', PAGES, { count: staffing })).toMatchObject({
      label: 'See the LRO Staffing case study',
      href: '/our-work/lro-staffing',
    });
    // No counts yet: still answered at once, not left waiting for the archive.
    expect(hintFor('/case-study/lro-staffing', PAGES)).toMatchObject({ href: '/our-work/lro-staffing' });
    expect(hintFor('/blog/lro-staffing', PAGES)).toMatchObject({ href: '/our-work/lro-staffing' });
    expect(hintFor('/mapl-tours-booking-system-launch', PAGES)).toMatchObject({ href: '/our-work/mapl-tours' });
  });

  it('needs the whole slug, word for word', () => {
    expect(namedIn('case-study-lro-staffing', PAGES.cases)?.slug).toBe('lro-staffing');
    expect(namedIn('lro-salary-guide-2026', PAGES.cases)?.slug).toBe('lro-salary-guide');
    expect(namedIn('lro', PAGES.cases)).toBeNull();
    expect(namedIn('chha', PAGES.cases)).toBeNull();
  });

  it('reads its slugs from the pages it is given (config), not a list of its own', () => {
    expect(hintFor('/case-study/lro-staffing', { services: [], cases: [] })).not.toMatchObject({
      href: '/our-work/lro-staffing',
    });
  });
});

describe('a blog search is the filled button only when it finds something', () => {
  it('waits for the archive counts before offering one', () => {
    expect(hintFor('/blog/wcag-guide', PAGES)).toBeUndefined();
  });

  it('offers the search when the word has results', () => {
    expect(hintFor('/blog/wcag-guide', PAGES, { count: fixed({ wcag: 1 }) })).toEqual({
      lead: 'Looking for an article?',
      label: 'Search the blog for “wcag”',
      href: '/blog?q=wcag#archive',
      specific: true,
    });
  });

  it('falls back to the archive itself when nothing matches', () => {
    expect(line(hintFor('/blog/zzzz-yyyy', PAGES, { count: NONE }))).toEqual({ href: '/blog#archive-q', filled: false });
  });

  it('needs no counts when the slug has no meaningful word', () => {
    expect(line(hintFor('/blog/old-post', PAGES))).toEqual({ href: '/blog#archive-q', filled: false });
  });

  it('a top-level article slug without results moves on to the next rule', () => {
    expect(hintFor('/agents-voice-thing', PAGES)).toBeUndefined();
    expect(hintFor('/agents-voice-thing', PAGES, { count: NONE })).toBeNull();
    expect(hintFor('/cloud-cost-review-checklist', PAGES, { count: NONE })).toMatchObject({
      href: '/services/cloud-engineering',
    });
  });
});

describe('the most specific word', () => {
  it('prefers the fewest non-zero results over the longest word', () => {
    const count = fixed({ agents: 7, voice: 2, thing: 0 });
    expect(hintFor('/agents-voice-thing', PAGES, { count })).toMatchObject({ label: 'Search the blog for “voice”' });
    expect(bestWord(['agents', 'voice', 'thing'], count)).toBe('voice');
  });

  it('breaks a tie with the longer word, and skips words with no results', () => {
    expect(bestWord(['cost', 'kubernetes', 'zzzz'], fixed({ cost: 2, kubernetes: 2 }))).toBe('kubernetes');
    expect(bestWord(['zzzz'], NONE)).toBe('');
  });

  it('keeps 4+ letter topic words from a slug, each once', () => {
    expect(searchWords('the-iam-misconfiguration-problem-2026')).toEqual(['misconfiguration', 'problem']);
    expect(searchWords('wcag-wcag-audit')).toEqual(['wcag', 'audit']);
    expect(searchWords('case-study-search-page')).toEqual([]);
  });
});

describe('a search query in the address', () => {
  const count = fixed({ wcag: 1, seo: 1 });

  it('/search?q= searches the blog for q', () => {
    expect(hintFor('/search', PAGES, { search: '?q=wcag', count })).toMatchObject({ href: '/blog?q=wcag#archive' });
    expect(hintFor('/blog/search', PAGES, { search: '?q=WCAG+2.2', count })).toMatchObject({
      label: 'Search the blog for “wcag”',
    });
  });

  it('keeps a typed three-letter word', () => {
    expect(hintFor('/search', PAGES, { search: '?q=seo', count })).toMatchObject({ href: '/blog?q=seo#archive' });
  });

  it('an empty or unmatched q falls back to the slug, then the archive', () => {
    expect(hintFor('/blog/wcag', PAGES, { search: '?q=', count })).toMatchObject({ href: '/blog?q=wcag#archive' });
    expect(hintFor('/search', PAGES, { search: '?q=zzzz', count })).toMatchObject({ href: '/blog#archive-q' });
    expect(hintFor('/search', PAGES)).toMatchObject({ href: '/blog#archive-q' });
  });
});

describe('a leading locale segment', () => {
  it('is dropped before guessing', () => {
    expect(hintFor('/en/blog/wcag', PAGES, { count: fixed({ wcag: 1 }) })).toMatchObject({ href: '/blog?q=wcag#archive' });
    expect(hintFor('/fr/services/web-design', PAGES)).toMatchObject({ href: '/services/web-development' });
    expect(hintFor('/fr-ca/pricing/old', PAGES)).toMatchObject({ href: '/pricing' });
    expect(hintFor('/EN/our-work/chha-ncr', PAGES)).toMatchObject({ href: '/our-work/chha-ncr' });
  });

  it('is only a locale: other short segments stay', () => {
    expect(hintFor('/en', PAGES)).toBeNull();
    expect(hintFor('/ai-automation', PAGES)).toMatchObject({ href: '/services/automation-ai-workflow-setup' });
  });
});

describe('the other rules hold', () => {
  it.each([
    ['/pricing/old', '/pricing'],
    ['/web-development', '/services/web-development'],
    ['/services/web-design', '/services/web-development'],
    ['/jobs/developer', '/careers'],
  ])('%s -> %s', (path, href) => {
    expect(hintFor(path, PAGES, { count: NONE })).toMatchObject({ href });
  });

  it('gives no guess when the path has nothing to go on', () => {
    expect(hintFor('/xyzzy', PAGES, { count: NONE })).toBeNull();
    expect(hintFor('/missing-page-xyz', PAGES, { count: NONE })).toBeNull();
  });
});

describe('on the real archive', () => {
  // The text /blog/search-index.json serves: the archive's rows, built as the archive builds them.
  const count = counter(
    blogPosts.map((post) => archiveText(post.title, firstSentence(post.excerpt), topicLabel(post.category))),
  );

  it.each(['/search?q=wcag', '/en/blog/wcag', '/blog/wcag-accessibility-guide', '/agents-voice-thing'])(
    'the search offered for %s finds at least one article',
    (address) => {
      const [path, query = ''] = address.split('?');
      const hint = hintFor(path, PAGES, { search: query ? `?${query}` : '', count });
      expect(hint?.href).toMatch(/^\/blog\?q=/);
      const word = new URLSearchParams((hint?.href ?? '').split('?')[1]?.split('#')[0]).get('q') ?? '';
      expect(count(word)).toBeGreaterThan(0);
    },
  );
});
