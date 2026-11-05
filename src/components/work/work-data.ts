/**
 * Derived data for /our-work and /our-work/[slug].
 *
 * Everything here is read from `portfolioProjects`, `labsProjects`,
 * `testimonials` and `pricing` in src/config/site.ts, the service records in
 * src/config/services.ts and the estimator meta in src/lib/estimate.ts.
 * The only additions are `KNOWN_YEARS` and `caseStudyDetails`, whose sources
 * are cited inline; nothing is estimated. Fields we do not have are simply
 * absent and the page omits the section.
 */
import { caseStudies, labsProjects, listedProjects, portfolioProjects, testimonials } from '@/config/site';
import { getServiceByEstimateKey, type ServiceRecord } from '@/config/services';
import {
  SERVICE_META,
  estimateHref,
  formatMoney,
  parsePriceLabel,
  tiersFor,
  type EstimateService,
  type EstimateSize,
  type EstimateToggles,
  type SizeKey,
} from '@/lib/estimate';

export type PortfolioProject = (typeof portfolioProjects)[number];
export type LabsProject = (typeof labsProjects)[number];
export type Testimonial = (typeof testimonials)[number];

export {
  FILTER_KEYS,
  isWorkFilterKey,
  type WorkEntry,
  type WorkFilter,
  type WorkFilterKey,
} from './work-types';
import { FILTER_KEYS, type WorkEntry, type WorkFilter } from './work-types';

/** `portfolioProjects[].category` → estimator service key (also the `?type=` value). */
export const CATEGORY_TO_SERVICE: Record<string, EstimateService> = {
  'Web Development': 'web',
  'Automation and AI Workflows': 'automation',
  'Custom Internal Tools': 'tools',
  'Cloud Engineering': 'cloud',
};


/**
 * Years we can actually cite. LRO Staffing: the live URL is
 * `/2026-interactive-salary-guide/`. CHHA-NCR: public relaunch announced July
 * 2026 (synthesis §2.1). Every other project has no dated copy in the repo, so
 * the column shows an em dash rather than a guess.
 */
const KNOWN_YEARS: Partial<Record<string, string>> = {
  'lro-staffing': '2026',
  'chha-ncr': '2026',
};

export function hostOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

function serviceFor(project: PortfolioProject): EstimateService {
  return CATEGORY_TO_SERVICE[project.category] ?? 'web';
}

function orderedProjects(): PortfolioProject[] {
  return listedProjects();
}

export function workPath(slug: string): string {
  return `/our-work/${slug}`;
}

export function toWorkEntry(project: PortfolioProject, index: number): WorkEntry {
  const service = serviceFor(project);
  return {
    slug: project.slug,
    path: workPath(project.slug),
    index,
    title: project.title,
    description: project.description,
    category: project.category,
    service,
    serviceLabel: SERVICE_META[service].label,
    year: KNOWN_YEARS[project.slug],
    image: project.image,
    url: project.url ?? undefined,
    host: hostOf(project.url ?? undefined),
    isLab: labsProjects.some((own) => own.slug === project.slug),
    tags: [...project.tags],
  };
}

let cachedEntries: WorkEntry[] | undefined;

/** All portfolio projects in display order, numbered from 01. */
export function workEntries(): WorkEntry[] {
  if (!cachedEntries) cachedEntries = orderedProjects().map((project, i) => toWorkEntry(project, i + 1));
  return cachedEntries;
}

export function findProject(slug: string): PortfolioProject | undefined {
  return portfolioProjects.find((p) => p.slug === slug);
}

export function findEntry(slug: string): WorkEntry | undefined {
  return workEntries().find((e) => e.slug === slug);
}

/** Previous / next entries in display order (wraps around). */
export function neighbours(slug: string): { previous: WorkEntry; next: WorkEntry } | undefined {
  const entries = workEntries();
  const i = entries.findIndex((e) => e.slug === slug);
  if (i === -1 || entries.length < 2) return undefined;
  return {
    previous: entries[(i - 1 + entries.length) % entries.length],
    next: entries[(i + 1) % entries.length],
  };
}

/** Filter chips with live counts computed from the config (a 0 count disables the chip). */
export function workFilters(entries: WorkEntry[] = workEntries()): WorkFilter[] {
  return FILTER_KEYS.map((key) => ({
    key,
    label: key === 'all' ? 'All' : SERVICE_META[key].label,
    count: key === 'all' ? entries.length : entries.filter((e) => e.service === key).length,
  }));
}

/* -------------------------------------------------------------------------- */
/* Pricing hooks                                                              */
/* -------------------------------------------------------------------------- */

/** "From $5,000" for a service line, from the first tier in `pricing`. */
export function startingPriceLabel(service: EstimateService): string | undefined {
  const first = tiersFor(service)[0];
  if (!first) return undefined;
  const parsed = parsePriceLabel(first.price);
  if (parsed.low === null) return undefined;
  return `From ${formatMoney(parsed.low)}`;
}

/**
 * Estimator deep link for one service line, carrying only what is given: a
 * size (`/pricing?svc=web&size.web=growth#estimator`) and any switches
 * (`&cms=1`). With no size the link names none (`/pricing?svc=web#estimator`)
 * and the estimator opens on its first size, as it does for any visitor.
 */
export function estimateLinkFor({
  service,
  size,
  toggles,
}: {
  service: EstimateService;
  size?: SizeKey;
  toggles?: EstimateToggles;
}): string {
  const href = estimateHref({ services: [service], size: size ? ({ [service]: size } as EstimateSize) : {}, toggles });
  if (size) return href;
  // The encoder always writes a size (it fills in the first option): drop it.
  const [path, hash] = href.split('#');
  const [base, query = ''] = path.split('?');
  const params = new URLSearchParams(query);
  params.delete(`size.${service}`);
  const rest = params.toString();
  return `${base}${rest ? `?${rest}` : ''}${hash ? `#${hash}` : ''}`;
}

/**
 * The project brief with this service line already chosen (`/contact-us?svc=web`):
 * brief.ts `readPrefill` reads it, and the brief opens on its size question.
 */
export function scopingCallLinkFor(service: EstimateService): string {
  return `/contact-us?svc=${service}`;
}

export function serviceRecordFor(service: EstimateService): ServiceRecord {
  return getServiceByEstimateKey(service);
}

/* -------------------------------------------------------------------------- */
/* Case-study depth (site.ts `caseStudies` first; tiny derived extras after)  */
/* -------------------------------------------------------------------------- */

export interface CaseStudyQA {
  question: string;
  answer: string;
}

export interface CaseStudyDetail {
  /** Full client name when the case study states one. */
  client?: string;
  /** Only where the project copy names the sector. */
  industry?: string;
  /** Named technologies / integrations. */
  stack?: string[];
  timeline?: string;
  challenge?: CaseStudyQA;
  solution?: { question: string; items: string[] };
  results?: { question: string; items: string[] };
  /** Where the results come from (rendered as a footnote). */
  sourceNote?: string;
}

/**
 * Facts that are derivable from the project's own copy or URL and nothing
 * else. Anything deeper must come from `caseStudies` in site.ts.
 */
const DERIVED_EXTRAS: Partial<Record<string, CaseStudyDetail>> = {
  'lro-staffing': {
    // Description: "for recruiters and hiring managers"; URL: /2026-interactive-salary-guide/
    industry: 'Staffing & recruitment',
    timeline: '2026 interactive salary guide',
  },
  'mapl-tours': {
    // Description: "a travel and tourism company"
    industry: 'Travel & tourism',
  },
  'crowned-spice': {
    // Description: "Online store automation from start to finish"
    industry: 'E-commerce',
  },
};

/** Approved depth for a case study: the site.ts record when one exists, else derived extras. */
export function caseStudyDetail(slug: string): CaseStudyDetail {
  const record = caseStudies.find((c) => c.slug === slug);
  const entry = findEntry(slug);
  const title = entry?.title ?? slug;
  if (!record) return DERIVED_EXTRAS[slug] ?? {};
  return {
    client: record.client,
    industry: record.industry,
    stack: record.stack,
    timeline: record.delivered,
    challenge: { question: `What did ${title} need?`, answer: record.challenge },
    solution: { question: 'What did MAPL TECH build?', items: record.solution },
    results: { question: `What changed for ${title}?`, items: record.results },
    sourceNote: record.sourceNote,
  };
}

/** Extra screenshots that already exist in /public/images for a project (hero image excluded). */
const EXTRA_MEDIA: Partial<Record<string, { src: string; width: number; height: number }[]>> = {
  'lro-staffing': [{ src: '/images/project-lro-staffing.jpg', width: 1290, height: 1443 }],
  'mapl-tours': [{ src: '/images/project-mapl-tours.jpg', width: 1200, height: 596 }],
  unsvcc: [
    { src: '/images/project-unsvcc.webp', width: 2560, height: 1440 },
    { src: '/images/unsvcc-cover.jpg', width: 1200, height: 773 },
  ],
  'tricia-walters': [{ src: '/images/project-trisha-walters.webp', width: 2560, height: 1802 }],
};

export interface CaseMedia {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** Hero image first, then any extra screenshots; alt text names the project and the frame. */
export function caseMedia(entry: WorkEntry): CaseMedia[] {
  const extras = EXTRA_MEDIA[entry.slug] ?? [];
  const all = [{ src: entry.image, width: 1200, height: 800 }, ...extras];
  return all.map((m, i) => ({
    ...m,
    alt: `${entry.title} — ${entry.serviceLabel} by MAPL TECH, screenshot ${i + 1} of ${all.length}`,
  }));
}

/** The approved client quote for this client (site.ts `kind: 'client'`; the audit's verdict is not one). */
export function approvedTestimonialFor(entry: WorkEntry): Testimonial | undefined {
  return testimonials.find((t) => t.kind === 'client' && t.company === entry.title);
}
