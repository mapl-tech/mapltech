import type { BlogCategory } from '@/data/blog-posts';
import type { EstimateService } from '@/lib/estimate';

/**
 * Pure helpers shared by the blog index island and the post layout. This file
 * deliberately imports only types, so the client bundle never drags in
 * blog-posts.ts, routes.ts or schema.ts.
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

/** First sentence of an excerpt: the "one-line answer" a row shows. */
export function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return match ? match[0].trim() : trimmed;
}

/**
 * Split the post's own opening paragraph (<p class="lead">) from the body so
 * it can be shown as the TL;DR. The words are the author's, verbatim; posts
 * without a lead paragraph get no TL;DR box.
 */
export function splitLead(html: string): { lead: string | null; body: string } {
  const match = html.match(/<p\s+class=["']lead["']\s*>([\s\S]*?)<\/p>/i);
  if (!match) return { lead: null, body: html };
  return {
    lead: match[1].trim(),
    body: html.replace(match[0], '').trim(),
  };
}

/** Anchor ids on every <h2> in the body so the contents list can link to them. */
export function anchorHeadings(html: string): { html: string; headings: { id: string; text: string }[] } {
  const headings: { id: string; text: string }[] = [];
  const seen = new Map<string, number>();
  const out = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (_full, attrs: string | undefined, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    let id = topicSlug(text) || 'section';
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    headings.push({ id, text });
    const existing = attrs ?? '';
    return /\sid=/.test(existing) ? `<h2${existing}>${inner}</h2>` : `<h2${existing} id="${id}">${inner}</h2>`;
  });
  return { html: out, headings };
}
