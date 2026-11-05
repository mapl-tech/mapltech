/**
 * The /our-work index (Nov 2026 award pass).
 *
 * One editorial row per listed project, every row in the same schema and
 * order: client, what we built, sector, one result (only where the case story
 * publishes one), and the real capture. No year: only two projects have a
 * dated source, and a field shown on two rows of seven reads as a gap.
 * Display order and visibility come from `workEntries()`, which reads
 * `listedProjects()`, so the owner's order (LRO Staffing first, CHHA-NCR
 * second) holds and hidden projects can never appear.
 *
 * Sources, field by field:
 * - `built`: condensed from the project's own copy (site.ts description,
 *   stories.ts facts); each line cites its source below.
 * - `sector`: the case story's sector tag (`tags[1]`).
 * - `result`: the case story's first published result, verbatim.
 * - `line`: the service line, from site.ts `category` (the filter chips).
 * - captures: the real screenshots listed in each story's `media`. When a
 *   capture is not the work itself (UNSVCC: the coalition's public site; the
 *   dashboard we built is private), the story's caption travels with it as
 *   `note` and is shown wherever the capture is.
 * A field without a source is absent; the row is one line shorter, never padded.
 */
import { findStory, type CaseStory } from '@/components/case/stories';
import { PROOF } from '@/components/flagship/content';
import type { EstimateService } from '@/lib/estimate';
import { approvedTestimonialFor, workEntries, workFilters, type WorkEntry } from './work-data';
import type { PreviewItem, WorkFilter } from './work-types';

export interface CatalogItem {
  slug: string;
  path: string;
  client: string;
  built: string;
  sector: string;
  /** The service line the filter chips match on. */
  line: EstimateService;
  result?: { value: string; label: string; short?: string };
  /** Real desktop capture (1800×1125), shown in a browser frame. */
  desktop?: string;
  /** Real phone capture (780×1688). */
  mobile?: string;
  /** The address in the browser frame ("lrostaffing.com"). */
  address?: string;
  /** Said beside the capture when the screenshot is not the work itself. */
  note?: string;
  /** Stage names, drawn as a labelled diagram when no screenshot exists. */
  flow?: readonly string[];
  preview: PreviewItem;
}

const BUILT: Partial<Record<string, string>> = {
  // stories.ts facts: "What we built: The complete website"; "Stack: WordPress, custom theme, PHP".
  'lro-staffing': 'The complete website, on a custom WordPress theme',
  // stories.ts facts: "What we built: The complete website"; the tour pages' booking calendar.
  'dodo-island-discoveries': 'The complete website, with tour booking',
  // site.ts: "Full relaunch ... all on a CMS volunteers can maintain themselves".
  'chha-ncr': 'A full relaunch that volunteers can update themselves',
  // site.ts: "Interactive salary guide tool with ... role-based salary benchmarking
  // for recruiters and hiring managers".
  'lro-salary-guide': 'An interactive salary guide for recruiters and hiring managers',
  // site.ts: "Our own product: a travel and tourism company fully managed by AI".
  'mapl-tours': 'Our own product, a travel company run by AI',
  // site.ts: "Event-driven web platform with member portal, registration workflows".
  'focas-canada': 'An event platform with a member portal',
  // site.ts: "End-to-end e-commerce automation: inventory syncing, shipping triggers,
  // and post-purchase communication flows".
  'crowned-spice': 'Online store automation: stock, shipping and follow-up messages',
  // stories.ts facts: "What we built: Internal operations dashboard".
  unsvcc: 'An internal operations dashboard',
};

/** The address shown in the browser frame ("lrostaffing.com"). */
function addressOf(story: CaseStory | undefined, entry: WorkEntry): string | undefined {
  return story?.facts.find((f) => f.term === 'Live')?.detail ?? entry.host;
}

function toItem(entry: WorkEntry): CatalogItem {
  const story = findStory(entry.slug);
  const media = story?.media;
  // No screenshot exists for automation-only work: draw its stages instead (names from the story).
  const flow = media ? undefined : story?.built?.stages.map((stage) => stage.name);
  const note = media?.caption;

  return {
    slug: entry.slug,
    path: entry.path,
    client: story?.client ?? entry.title,
    built: BUILT[entry.slug] ?? story?.tags[0] ?? entry.serviceLabel,
    sector: story?.tags[1] ?? entry.category,
    line: entry.service,
    result: story?.results?.[0],
    desktop: media?.desktop,
    mobile: media?.mobile,
    address: addressOf(story, entry),
    note,
    flow,
    preview: {
      slug: entry.slug,
      src: media?.desktop ?? null,
      flow,
      caption: note,
    },
  };
}

/** Every listed project as an index row, in display order. */
export function catalogItems(): CatalogItem[] {
  return workEntries().map(toItem);
}

/**
 * The filter chips: "All" plus every service line with at least one listed
 * project, with live counts from the config. A line with nothing listed gets
 * no chip (rather than a dead one); it appears on its own once a project in
 * that line is listed.
 */
export function catalogFilters(): WorkFilter[] {
  return workFilters().filter((filter) => filter.key === 'all' || filter.count > 0);
}

export interface CatalogVoice {
  quote: string;
  name: string;
  /** "Operations Director, LRO Staffing". */
  role: string;
  /** The client's photo, when one is supplied. */
  image?: string;
  /** The case study of the project the quote is about. */
  path: string;
  client: string;
}

/**
 * The client voice placed beside the decision: the first listed project, in
 * display order, with an approved testimonial (site.ts `testimonials`; only
 * signed-off quotes carry a headshot, see approvedTestimonialFor).
 */
export function catalogVoice(): CatalogVoice | undefined {
  for (const entry of workEntries()) {
    const t = approvedTestimonialFor(entry);
    if (t) return { quote: t.quote, name: t.name, role: `${t.role}, ${t.company}`, image: t.image || undefined, path: entry.path, client: entry.title };
  }
  return undefined;
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** "seven" for 7; digits past twelve. */
export function countWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/** "Three" for a count word at the start of a sentence. */
export const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

/** "A, B and C" (no serial comma). */
function listWords(words: readonly string[]): string {
  return words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : (words[0] ?? '');
}

/**
 * The rows whose case study publishes a result. Not every case does (most of
 * them record what we built, not a number), so the copy counts them rather
 * than promising "what changed" on every page.
 */
export function resultItems(items: readonly CatalogItem[] = catalogItems()): CatalogItem[] {
  return items.filter((item) => item.result);
}

/**
 * The close's proof: the figures the homepage publishes (flagship/content.ts
 * PROOF.stats), as one line, read from that data, never retyped. The page
 * already names every client in its rows, so the site's client line would
 * only repeat them.
 */
export function figuresLine(): string {
  return PROOF.stats
    .map((stat) => {
      const offices = /^offices:\s*(.+)$/i.exec(stat.label);
      return offices ? `Offices in ${listWords(offices[1].split(/,\s*/))}.` : `${stat.value}${stat.suffix} ${stat.label}.`;
    })
    .join(' ');
}

/** Metadata and JSON-LD share these strings, so the two can never drift. */
export const WORK_PAGE = {
  path: '/our-work',
  title: 'Client work and case studies',
  name: 'Client work and case studies',
  // What every row has (what we built), and how many publish a result: both counted from the case data.
  description: `${capitalize(countWord(catalogItems().length))} projects by MAPL TECH, white-label engineers for agencies: websites, tools and AI automation. Each shows what we built, and ${countWord(resultItems().length)} publish their results.`,
} as const;
