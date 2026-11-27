import { STORIES } from '@/components/case/stories';
import { findEntry } from '@/components/work/work-data';

/**
 * The listed case study that quotes a testimonial in the same words
 * (stories.ts `quote`: Alita Fabiano on LRO Staffing's, the audit's verdict on
 * CHHA-NCR's), so a reader can check the words against the work. None when
 * the case is not listed on /our-work. Used wherever a testimonial is shown in
 * full (the homepage's "In their words", the white-label page's quote).
 */
export function caseFor(quote: string): { slug: string; href: string; client: string } | null {
  const story = STORIES.find((s) => s.quote?.text === quote);
  const entry = story ? findEntry(story.slug) : undefined;
  return story && entry ? { slug: story.slug, href: entry.path, client: story.client } : null;
}
