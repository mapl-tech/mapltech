import type { BlogCategory } from '@/data/blog-posts';
import type { EstimateService } from '@/lib/estimate';
import { LEGACY_LINKS } from '@/config/legacyLinks';

/**
 * Pure helpers shared by the blog index island and the post template. Apart
 * from the dependency-free legacy link map, this file imports only types, so
 * the client bundle never drags in blog-posts.ts, routes.ts or schema.ts.
 */

/** Mirrors schema.ts slugify() (kept local to avoid pulling schema into the client). */
export function topicSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The service line a post category routes to; Industry posts have none. */
export function categoryService(category: BlogCategory): EstimateService | null {
  switch (category) {
    case 'Web Development':
      return 'web';
    case 'Automation & AI':
      return 'automation';
    case 'Internal Tools':
      return 'tools';
    case 'Cloud Engineering':
      return 'cloud';
    default:
      return null;
  }
}

/** First sentence of an excerpt: the one-line answer an archive row shows. */
export function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return match ? match[0].trim() : trimmed;
}

/**
 * Split the post's own opening paragraph (<p class="lead">) from the body.
 * The words are the author's, verbatim; posts without one return lead null.
 */
export function splitLead(html: string): { lead: string | null; body: string } {
  const match = html.match(/<p\s+class=["']lead["']\s*>([\s\S]*?)<\/p>/i);
  if (!match) return { lead: null, body: html };
  return {
    lead: match[1].trim(),
    body: html.replace(match[0], '').trim(),
  };
}

/** Plain text of an HTML fragment (tags dropped, whitespace collapsed). */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Anchor ids on every <h2> in the body so the contents list can link to them.
 * Existing ids are respected; duplicates get a numeric suffix.
 */
export function anchorHeadings(html: string): { html: string; headings: { id: string; text: string }[] } {
  const headings: { id: string; text: string }[] = [];
  const seen = new Map<string, number>();
  const out = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (_full, attrs: string | undefined, inner: string) => {
    const text = plainText(inner);
    const existing = attrs ?? '';
    const given = existing.match(/\sid=["']([^"']+)["']/i)?.[1];
    let id = given ?? (topicSlug(text) || 'section');
    if (!given) {
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count + 1}`;
    }
    headings.push({ id, text });
    return given ? `<h2${existing}>${inner}</h2>` : `<h2${existing} id="${id}">${inner}</h2>`;
  });
  return { html: out, headings };
}

/** The project brief (layout/chrome.ts PROJECT_HREF, kept literal so this file stays import-free). */
const BRIEF_PATH = '/contact-us';

/** `?svc=web` added to a link's query-and-hash tail, unless it already names a service. */
function withService(rest: string, service: EstimateService): string {
  const hashAt = rest.indexOf('#');
  const query = hashAt === -1 ? rest : rest.slice(0, hashAt);
  const hash = hashAt === -1 ? '' : rest.slice(hashAt);
  if (/[?&]svc=/.test(query)) return rest;
  return `${query}${query.startsWith('?') ? '&' : '?'}svc=${service}${hash}`;
}

/**
 * Internal links some posts were written with before the service pages got
 * their final slugs (LEGACY_LINKS): the template rewrites them to the live
 * page at render time (blog-posts.ts stays the source of record).
 * next.config.ts redirects the same paths for links from outside the site.
 * With the post's service, the body's links to the brief ("get in touch")
 * open it with that service chosen, as the close's button does (brief.ts
 * reads ?svc=).
 */
export function repairLinks(html: string, service?: EstimateService | null): string {
  return html.replace(/href=(["'])(\/[^"'#?]*)([^"']*)\1/g, (full, quote: string, path: string, rest: string) => {
    const bare = path.replace(/\/+$/, '') || '/';
    const live = LEGACY_LINKS[bare] ?? bare;
    if (service && live === BRIEF_PATH) return `href=${quote}${live}${withService(rest, service)}${quote}`;
    return live !== bare ? `href=${quote}${live}${rest}${quote}` : full;
  });
}

/**
 * Tables become a labelled, keyboard-scrollable region so a wide table scrolls
 * inside the measure instead of widening the page (no post has one yet; the
 * generator may add them).
 */
export function wrapTables(html: string): string {
  return html
    .replace(/<table/gi, '<div data-table-scroll role="region" tabindex="0" aria-label="Table, scrolls sideways"><table')
    .replace(/<\/table>/gi, '</table></div>');
}

/**
 * Split the body just before its Nth <h2> (0-based) so a block can sit between
 * two sections without touching the post's own markup. Short posts split
 * before their last heading; a post with no headings is returned whole.
 */
export function splitBeforeHeading(html: string, index: number): [string, string] {
  const starts: number[] = [];
  const pattern = /<h2[\s>]/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html))) starts.push(match.index);
  if (starts.length < 2) return [html, ''];
  const at = starts[Math.min(index, starts.length - 1)];
  return [html.slice(0, at), html.slice(at)];
}

/** Everything the post template needs from the raw HTML, in one pass (`service`: the post's service line). */
export function preparePost(
  html: string,
  service?: EstimateService | null,
): {
  before: string;
  after: string;
  headings: { id: string; text: string }[];
} {
  const { html: anchored, headings } = anchorHeadings(wrapTables(repairLinks(html.trim(), service)));
  const [before, after] = splitBeforeHeading(anchored, 2);
  return { before, after, headings };
}
