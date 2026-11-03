/**
 * Services family (Nov 2026 simplify pass): the copy and the derived facts
 * behind /services and the four /services/* pages.
 *
 * Sources, and the only ones:
 *  - prices, tiers, retainers, hourly rates and bundles: `pricing` in
 *    src/config/site.ts, read through src/config/services.ts and
 *    src/lib/estimate.ts, so a price change there changes every page here;
 *  - capabilities, process steps, FAQs, section headings and closing asks:
 *    services.ts (the live pages' facts, in plain words);
 *  - the one-line summary of each service and the "How it works" steps on
 *    /services: the homepage copy in src/components/flagship/content.ts
 *    (LAYERS, APPROACH), so the two pages describe both the same way;
 *  - case facts: src/components/case/stories.ts (listed projects only).
 * Every sentence written here is cited inline. Nothing is estimated.
 *
 * Voice: plain English for a diverse audience (short sentences, no jargon,
 * canonical service names in labels). Punctuation is normalised at render
 * time by `cleanCopy` (a spaced hyphen used as a dash becomes a colon or a
 * comma, numeric ranges get an en dash, apostrophes curl), because the config
 * keeps ASCII ranges the price parser reads. Wording is fixed at the source;
 * the spec fails if banned, retired or jargon words come back. FAQ JSON-LD is
 * built from the same cleaned strings the page renders, so markup and
 * structured data cannot disagree.
 */
import type { Metadata } from 'next';
import { absoluteUrl } from '@/config/routes';
import {
  getService,
  serviceRecurringLines,
  serviceTiers,
  services,
  type ServiceRecord,
  type ServiceRecurringLine,
  type ServiceSlug,
  type ServiceTier,
} from '@/config/services';
import { listedProjects, pricing } from '@/config/site';
import {
  SERVICE_META,
  SIZE_OPTIONS,
  estimateHref,
  formatMoney,
  parsePriceLabel,
  type EstimateService,
  type EstimateSize,
  type SizeKey,
} from '@/lib/estimate';
import { findStory } from '@/components/case/stories';
import { APPROACH, LAYERS } from '@/components/flagship/content';

/** The date this family was rebuilt (JSON-LD dateModified); the sitemap uses routes.ts REDESIGN_DATE. */
export const SERVICES_REVISED = '2026-11-02';

/* ------------------------------------------------------------------ */
/* Copy hygiene                                                         */
/* ------------------------------------------------------------------ */

/** Words after a spaced hyphen that read better after a comma than a colon. */
const COMMA_AFTER = /^(so|and|all|baked|for|not)\b/;

/**
 * Config strings → visible copy: "3-4 weeks" → "3–4 weeks", "$3,500-$5,000" →
 * "$3,500–$5,000", "from scratch - custom themes" → "from scratch: custom
 * themes", "automatically - so your team" → "automatically, so your team",
 * "what's" → "what’s".
 */
export function cleanCopy(text: string): string {
  return text
    .replace(/(\d)\s*-\s*(\$?\d)/g, '$1–$2')
    .replace(/\s+-\s+(\S)/g, (_match, next: string, offset: number, whole: string) =>
      COMMA_AFTER.test(whole.slice(offset).replace(/^\s+-\s+/, '')) ? `, ${next}` : `: ${next}`,
    )
    .replace(/(\w)'/g, '$1’');
}

const ACRONYM = /^[A-Z0-9/&+.]{2,}[,.]?$/;

/** Title Case config headings → the site's sentence case, keeping acronyms ("CRM", "AI-powered", "CI/CD"). */
export function sentenceCase(title: string): string {
  return title
    .split(' ')
    .map((word, i) =>
      word
        .split('-')
        .map((part, j) => {
          if (ACRONYM.test(part)) return part;
          const lower = part.toLowerCase();
          return i === 0 && j === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
        })
        .join('-'),
    )
    .join(' ');
}

/** A config heading as a display statement: sentence case, clean punctuation, closing full stop. */
function statement(heading: string): string {
  const text = cleanCopy(sentenceCase(heading));
  return /[.?!]$/.test(text) ? text : `${text}.`;
}

/** "$750/month" → "$750 a month", "$65-$120/hour" → "$65–$120 an hour". */
export function humanPrice(label: string): string {
  return cleanCopy(label)
    .replace(/\s*\/\s*month/i, ' a month')
    .replace(/\s*\/\s*hour/i, ' an hour');
}

function lowOf(label: string): number | null {
  return parsePriceLabel(label).low;
}

/** The line every price on these pages closes with (services.ts cost answers). */
export const QUOTE_LINE = 'You get a fixed quote after a 20-minute call.';

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

/* ------------------------------------------------------------------ */
/* Per-service copy                                                     */
/* ------------------------------------------------------------------ */

export interface Exhibit {
  src: string;
  alt: string;
}

interface ServiceCopy {
  /** The service's canonical name (SERVICE_META label, the same on every page of the site): the hero eyebrow. */
  name: string;
  /** What the service is, in a few everyday words: the /services index kicker. */
  role: string;
  /** Hero lede under the promise, under 30 words; it adds to the H1 rather than repeating it. */
  lede: string;
  /** The entry tier's headline inclusions, composed from its feature list. */
  entryIncludes: string;
  /**
   * "What we build": the four strongest of the six services.ts capabilities, by title, in reading order. A
   * point that repeats the section's heading or intro stays out (that heading or intro already says it).
   */
  buildPoints: readonly string[];
  /** Label for the technology chips under "What we build"; null shows none (automation's list repeats its capabilities). */
  stackLabel: string | null;
  /** Case studies that prove this service, lead case first (stories.ts slugs); two at most. */
  proofSlugs: readonly string[];
  /** The one case study the /services row links to (stories.ts slug); null when the service has none of its own. */
  example: string | null;
  /** Cloud shows only MAPL Tours' published delivery facts. */
  proofFilter?: { headline: string; results: RegExp };
  /** Real work for the index preview; null draws the release diagram instead (cloud has no screen). */
  exhibit: Exhibit | null;
  meta: { title: string; description: string };
  og: { src: string; width: number; height: number; alt: string };
}

/** The site-wide share image (regenerated by the lead, 1200x630), for pages without a work capture of their own. */
const SHARE_IMAGE = {
  src: '/images/og-flagship.jpg',
  width: 1200,
  height: 630,
  alt: 'MAPL TECH: engineering for agencies, with public prices.',
};

const COPY: Record<ServiceSlug, ServiceCopy> = {
  'web-development': {
    name: SERVICE_META.web.label,
    role: 'Websites and web apps',
    // FAQ "we build them exactly from Figma, Sketch or XD files" · the live lede "Built from your designs, shipped
    // under your brand." (speed, accessibility and the brand are the H1's promise).
    lede: 'We build each site exactly from your designs. Your client gets a site that is easy to use and easy to update.',
    // Starter features: "Custom-coded website that works on every screen (up to 7 pages)", "Designed for phones first"
    entryIncludes: 'Up to 7 custom-coded pages, built for phones first',
    // Out: "Phones first" (says "we design", but agencies bring the designs) and "Solid behind the scenes" (weakest).
    buildPoints: ['Built for the people who run it', 'Fast pages', 'Works on every device', 'Accessible to everyone'],
    stackLabel: 'Built with',
    proofSlugs: ['lro-staffing', 'chha-ncr'],
    example: 'lro-staffing',
    exhibit: {
      src: '/images/cases/lro-desktop.jpg',
      alt: 'The LRO Staffing homepage built by MAPL TECH: “Building Careers. Strengthening Organizations.” above a job search panel.',
    },
    meta: {
      title: 'Custom Web Development for Agencies',
      description:
        'Web Development for agencies from $5,000: custom-coded sites, Starter typically live in 3–4 weeks. Four public tiers, real case studies, a fixed quote.',
    },
    og: {
      src: '/images/cases/lro-desktop.jpg',
      width: 1800,
      height: 1125,
      alt: 'The LRO Staffing website, built by MAPL TECH.',
    },
  },
  'automation-ai-workflow-setup': {
    name: SERVICE_META.automation.label,
    role: 'Less manual work',
    // services.ts oneLiner ("From simple automations to custom AI agents") · content.ts LAYERS deliverable
    // "Lead routing, follow-ups and reporting on autopilot" (taking repetitive work away is the H1's promise).
    lede: 'We connect the tools your team already uses, then automate follow-ups, sorting new leads and reports. From simple automations to custom AI agents.',
    // Foundation Automation features: "CRM setup for your team", "New leads sent to the right person
    // automatically", "3 to 5 key automations"
    entryIncludes: 'CRM setup, new leads sent to the right person, and 3 to 5 key automations',
    // Out: "Custom connections" (repeats "All your tools, connected") and "Built for bigger teams" (top tier only).
    buildPoints: ['A CRM that does the follow-up', 'All your tools, connected', 'AI that sorts new enquiries', 'AI agents that act'],
    stackLabel: null,
    proofSlugs: ['mapl-tours', 'crowned-spice'],
    example: 'mapl-tours',
    exhibit: {
      src: '/images/cases/tours-desktop.jpg',
      alt: 'The MAPL Tours homepage, “Discover Jamaica beyond the resort.”, over aerial footage of the coast.',
    },
    meta: {
      title: 'Automation & AI Workflow Setup for Agencies',
      description:
        'Automation & AI for agencies from $3,500: CRM setup, lead routing, AI intake and custom agents. Public tiers, real work and a fixed quote after one call.',
    },
    og: {
      src: '/images/cases/tours-desktop.jpg',
      width: 1800,
      height: 1125,
      alt: 'MAPL Tours, the travel company MAPL TECH built and runs.',
    },
  },
  'custom-internal-tools': {
    name: SERVICE_META.tools.label,
    role: 'Dashboards and portals',
    // services.ts oneLiner (dashboards, client portals and reporting tools) · ctaBand "Tired of workarounds and
    // spreadsheets? ... We will build the tool that fixes it, for good." (fitting how you work is the H1's promise).
    lede: 'Dashboards, client portals and reporting tools that replace spreadsheets and workarounds.',
    // Internal Dashboards features: "Live reports", "Access levels for each role"
    entryIncludes: 'Live reports, with access levels for each role',
    // Out: "Secure from the start" and "Grows with you" (the section intro says both).
    buildPoints: ['Dashboards', 'Client portals', 'Operations and reporting', 'Works with your tools'],
    stackLabel: 'Built with',
    proofSlugs: ['lro-salary-guide', 'unsvcc'],
    example: 'lro-salary-guide',
    exhibit: {
      src: '/images/cases/salary-desktop.jpg',
      alt: 'The LRO 2026 Interactive Salary Guide built by MAPL TECH, with its filters and charts.',
    },
    meta: {
      title: 'Custom Internal Tools for Agencies',
      description:
        'Custom Internal Tools for agencies from $5,000: dashboards, client portals and ops systems with role-based access. Public tiers and a fixed quote.',
    },
    og: {
      src: '/images/cases/salary-desktop.jpg',
      width: 1800,
      height: 1125,
      alt: 'The LRO Interactive Salary Guide, built by MAPL TECH.',
    },
  },
  'cloud-engineering': {
    name: SERVICE_META.cloud.label,
    role: 'Hosting that stays online',
    // services.ts capabilities: AWS, Google Cloud or Azure · oneLiner "so your agency stops worrying about downtime,
    // traffic spikes or broken releases" (the points below answer each worry).
    lede: 'We set up and run your hosting on AWS, Google Cloud or Azure. Your agency stops worrying about downtime, traffic spikes and broken updates.',
    // Starter Cloud Setup features: "Cloud setup on AWS, Google Cloud or Azure", "Basic automatic testing and
    // deployment", "Alerts if the site goes down"
    entryIncludes: 'Cloud setup on AWS, Google Cloud or Azure, automatic deployment and downtime alerts',
    // The four that answer the lede's worries. Out: "Written down as code" (technical) and "Security and compliance".
    buildPoints: ['Moving to the cloud', 'Tested updates', 'Monitoring', 'Predictable costs'],
    stackLabel: 'Built with',
    proofSlugs: ['mapl-tours'],
    // No cloud case study exists: the /services row shows no example.
    example: null,
    // Only what stories.ts publishes about MAPL Tours' delivery and production: the tests every change passes
    // and live payments.
    proofFilter: {
      // stories.ts facts: Owner MAPL TECH; Status "Live, taking real payments".
      headline: 'Our own travel company, live and taking real payments.',
      results: /tests|payments/i,
    },
    exhibit: null,
    meta: {
      title: 'Cloud Engineering for Agencies',
      description:
        'Cloud Engineering for agencies from $5,000: AWS, GCP or Azure as code, CI/CD pipelines and monitoring. Public tiers and a fixed quote after one call.',
    },
    og: SHARE_IMAGE,
  },
};

/* ------------------------------------------------------------------ */
/* Service views                                                        */
/* ------------------------------------------------------------------ */

export interface LayerView extends ServiceCopy {
  slug: ServiceSlug;
  service: EstimateService;
  path: string;
  record: ServiceRecord;
  /** One sentence for the index row and the ItemList description: the homepage's own (content.ts LAYERS). */
  summary: string;
  /** H1: the service's promise in plain words, eight words or fewer, with its main keyword (services.ts heroTitle). */
  headline: string;
  /** "What we build" heading (services.ts capabilities title). */
  buildTitle: string;
  /** Lede under "What we build" (services.ts capabilities subtitle). */
  deliverIntro: string;
  /** "How it works" heading for this service's four steps. */
  processTitle: string;
  /** The closing ask for this service (services.ts ctaBand), plus the quote line. */
  close: { title: string; lede: string };
  tiers: readonly ServiceTier[];
  recurring: readonly ServiceRecurringLine[];
  /** Lowest one-time price across the service's tiers. */
  from: number;
  /** "From $5,000" */
  fromLabel: string;
  /** "$5,000" */
  fromMoney: string;
  entryTier: ServiceTier;
  /** Cheapest monthly line. */
  lowestMonthly: { name: string; amount: number } | null;
  /** Estimator deep link with this service preselected. */
  estimate: string;
}

function lowestFrom(tiers: readonly ServiceTier[]): number {
  const lows = tiers.map((tier) => lowOf(tier.price)).filter((n): n is number => n !== null);
  return Math.min(...lows);
}

function cheapestMonthly(lines: readonly ServiceRecurringLine[]): LayerView['lowestMonthly'] {
  let best: LayerView['lowestMonthly'] = null;
  for (const line of lines) {
    const low = lowOf(line.price);
    if (low !== null && (!best || low < best.amount)) best = { name: line.name, amount: low };
  }
  return best;
}

function toView(record: ServiceRecord): LayerView {
  const copy = COPY[record.slug];
  const tiers = serviceTiers(record);
  const recurring = serviceRecurringLines(record);
  const from = lowestFrom(tiers);
  const layer = LAYERS.find((item) => item.service === record.estimateKey);
  return {
    ...copy,
    slug: record.slug,
    service: record.estimateKey,
    path: record.path,
    record,
    summary: layer ? cleanCopy(layer.summary) : cleanCopy(record.oneLiner),
    headline: statement(record.heroTitle),
    buildTitle: statement(record.sections.capabilities.title),
    deliverIntro: cleanCopy(record.sections.capabilities.subtitle),
    processTitle: statement(record.sections.process.title),
    close: { title: cleanCopy(sentenceCase(record.ctaBand.heading)), lede: `${cleanCopy(record.ctaBand.body)} ${QUOTE_LINE}` },
    tiers,
    recurring,
    from,
    fromLabel: `From ${formatMoney(from)}`,
    fromMoney: formatMoney(from),
    entryTier: tiers[0],
    lowestMonthly: cheapestMonthly(recurring),
    estimate: estimateHref({ services: [record.estimateKey] }),
  };
}

/** The four services in services.ts order: web, automation, tools, cloud. */
export const LAYER_VIEWS: readonly LayerView[] = services.map(toView);

export function layerView(slug: ServiceSlug): LayerView {
  return LAYER_VIEWS.find((view) => view.slug === slug) ?? toView(getService(slug));
}

/** Lowest one-time price on the whole price list ($3,500 today). */
export const LOWEST_FROM = Math.min(...LAYER_VIEWS.map((view) => view.from));

/** Lowest monthly line across all four services ($500 today, web Essential Care). */
export const LOWEST_MONTHLY = Math.min(
  ...LAYER_VIEWS.map((view) => view.lowestMonthly?.amount ?? Number.POSITIVE_INFINITY),
);

/** Support after launch stated for web builds ("30–90 days"), without its "depending on tier" tail. */
export function supportWindow(view: LayerView): string | null {
  return view.record.postLaunchSupport ? cleanCopy(view.record.postLaunchSupport.replace(/ depending on tier/, '')) : null;
}

/* ------------------------------------------------------------------ */
/* Tiers                                                                */
/* ------------------------------------------------------------------ */

/** How many inclusions a tier card shows before the rest fold into "What’s included". */
export const TIER_HIGHLIGHTS = 3;

export interface TierView {
  id: string;
  name: string;
  /** Tier description from site.ts, cleaned: who the tier is for. */
  who: string;
  /** "$5,000", "$3,500–$5,000", "$12,000–$25,000+", "Custom"; a floor ("$20,000+") shows its amount, after "From". */
  price: string;
  /** A starting price ("$5,000", "$20,000+"): the card reads "From $5,000". Ranges and Custom read as they are. */
  isFloor: boolean;
  /** Under the price, for Custom only: how it is priced. */
  priceNote: string | null;
  isCustom: boolean;
  /** "Everything in Starter" when the tier builds on the one before it. */
  builds: string | null;
  features: readonly string[];
  /** Typical timeline, web only (services.ts `typicalTimeline`). */
  timeline: { label: string; min: number; max: number } | null;
  /** Estimator deep link with this tier preselected, or the project brief for Custom. */
  href: string;
}

/**
 * Per-tier timelines parsed from services.ts `typicalTimeline`
 * ("3–4 weeks Starter · 5–8 weeks Growth / E-Commerce · 8–14 weeks Advanced and Enterprise").
 * Services without a stated timeline return an empty map, and the page shows none.
 */
export function tierTimelines(record: ServiceRecord): Map<string, { min: number; max: number }> {
  const out = new Map<string, { min: number; max: number }>();
  if (!record.typicalTimeline) return out;
  const tiers = serviceTiers(record);
  for (const segment of record.typicalTimeline.split('·')) {
    const match = segment.trim().match(/^(\d+)\s*[–-]\s*(\d+)\s*weeks\s+(.+)$/);
    if (!match) continue;
    const [, min, max, who] = match;
    const names = who.split(/\s+and\s+/).map((name) => name.trim().toLowerCase());
    for (const tier of tiers) {
      if (names.some((name) => tier.name.toLowerCase().startsWith(name))) {
        out.set(tier.name, { min: Number(min), max: Number(max) });
      }
    }
  }
  return out;
}

function sizeKeyFor(service: EstimateService, tierIndex: number): SizeKey | undefined {
  return SIZE_OPTIONS[service].find((option) => option.tierIndex === tierIndex)?.key;
}

export function tierEstimateHref(service: EstimateService, tierIndex: number): string {
  const key = sizeKeyFor(service, tierIndex);
  const size = (key ? { [service]: key } : {}) as EstimateSize;
  return estimateHref({ services: [service], size });
}

export function tierViews(view: LayerView): TierView[] {
  const timelines = tierTimelines(view.record);
  return view.tiers.map((tier, index) => {
    const parsed = parsePriceLabel(tier.price);
    // One amount ("$5,000", a web starting price) or an open end ("$20,000+") is a floor; two amounts are a range.
    const isFloor = !parsed.isCustom && parsed.low !== null && (parsed.high === null || parsed.high === parsed.low);
    const builds = tier.features.find((feature) => /^everything in /i.test(feature)) ?? null;
    const timeline = timelines.get(tier.name);
    return {
      id: `tier-${tier.name
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`,
      name: tier.name,
      who: cleanCopy(tier.description),
      price: parsed.isCustom ? 'Custom' : isFloor && parsed.low !== null ? formatMoney(parsed.low) : cleanCopy(tier.price),
      isFloor,
      priceNote: parsed.isCustom ? 'Priced with you on a call' : null,
      isCustom: parsed.isCustom,
      builds,
      features: tier.features.filter((feature) => feature !== builds).map(cleanCopy),
      timeline: timeline ? { label: `${timeline.min}–${timeline.max} weeks`, ...timeline } : null,
      href: parsed.isCustom ? '/contact-us' : tierEstimateHref(view.service, index),
    };
  });
}

/** "What it costs" heading, from the table: "Four tiers, from $5,000." */
export function costTitle(view: LayerView): string {
  const count = COUNT_WORDS[view.tiers.length] ?? String(view.tiers.length);
  return `${count} tiers, from ${view.fromMoney}.`;
}

/* ------------------------------------------------------------------ */
/* What we build, how it works, FAQ                                     */
/* ------------------------------------------------------------------ */

/** The four points under "What we build", in `buildPoints` order (a title services.ts lacks is skipped). */
export function capabilityViews(view: LayerView) {
  return view.buildPoints.flatMap((title) => {
    const capability = view.record.capabilities.find((item) => item.title === title);
    return capability ? [{ title: sentenceCase(capability.title), text: cleanCopy(capability.description) }] : [];
  });
}

export function stageViews(view: LayerView) {
  return view.record.processSteps.map((step) => ({
    name: sentenceCase(step.title),
    text: cleanCopy(step.description),
  }));
}

export function stackLine(view: LayerView): string[] {
  return view.record.stack.map(cleanCopy);
}

/** The FAQ exactly as rendered; the FAQPage JSON-LD is built from this same array. */
export interface FaqView {
  question: string;
  /** The whole answer as one string, the words shown: the FAQPage JSON-LD reads this. */
  answer: string;
  /** Price answers in list form: the direct sentence, one figure per line, the quote line. */
  list?: { lead: string; points: readonly string[]; close?: string };
}

/**
 * services.ts composes the price answers from the tier table: every inclusion
 * of every tier in one paragraph, which repeats the tier list a screen above.
 * On these pages the answer gives what was asked (the price of each tier, the
 * quote line) and the inclusions stay in the tier list. Only answers in the
 * composed shape are listed (each tier, or each plan, named with its price);
 * anything else keeps its words.
 */
function priceList(view: LayerView, answer: string): FaqView['list'] {
  const tiers = tierViews(view);
  const tierShape = tiers.every((tier, i) => answer.includes(`${tier.name} (${cleanCopy(view.tiers[i].price)})`));
  if (tierShape && tiers.length > 1) {
    return {
      lead: `From ${view.fromMoney}, across ${COUNT_WORDS[tiers.length]?.toLowerCase() ?? tiers.length} tiers.`,
      points: tiers.map((tier) =>
        tier.isCustom
          ? `${tier.name}: priced per project`
          : `${tier.name}: ${tier.isFloor ? `from ${tier.price}` : tier.price}`,
      ),
      close: answer.match(/You get a fixed quote[^.]*\./)?.[0],
    };
  }
  const plans = view.recurring;
  const planShape =
    plans.length > 0 &&
    /^\w+ monthly plans?: /.test(answer) &&
    plans.every((plan) => !plan.description && answer.includes(`${plan.name} (${cleanCopy(plan.price)})`));
  if (planShape) {
    return {
      lead: `${answer.slice(0, answer.indexOf(':'))}.`,
      points: plans.map((plan) => `${plan.name}: ${humanPrice(plan.price)}`),
    };
  }
  return undefined;
}

export function faqItems(view: LayerView): FaqView[] {
  return view.record.faqs.map((faq) => {
    // Questions exactly as services.ts writes them; the JSON-LD carries the same words.
    const question = faq.question;
    const answer = cleanCopy(faq.answer);
    const list = priceList(view, answer);
    if (!list) return { question, answer: answer.replace(/\s*\/\s*month\b/g, ' a month') };
    const words = [list.lead, ...list.points.map((point) => `${point}.`), list.close];
    return { question, answer: words.filter(Boolean).join(' '), list };
  });
}

/* ------------------------------------------------------------------ */
/* Proof                                                                */
/* ------------------------------------------------------------------ */

export interface ProofCase {
  slug: string;
  client: string;
  kind: string;
  headline: string;
  href: string;
  /** Real captures of the live product (public/images/cases): desktop 1800x1125, phone 780x1688. */
  media: { desktop: string; mobile?: string; alt: string } | null;
  /** The live address, for the browser frame's address bar ("lrostaffing.com"). */
  url?: string;
  results: readonly { value: string; label: string }[];
  stages: readonly { name: string; text: string }[];
}

const listed = new Set(listedProjects().map((project) => project.slug));

/**
 * One-line label: the sector (stories.ts `tags[1]`). The type tag ("Website",
 * "Internal tools") is a short form of a service name, which the site no longer
 * uses, and the page already names the service; /our-work drops it the same way.
 * MAPL TECH's own product says so first.
 */
function caseKind(tags: readonly string[]): string {
  const sector = tags[1] ?? '';
  return tags[0] === 'Our own product' ? [tags[0], sector].filter(Boolean).join(' · ') : sector;
}

/** The one real project beside a /services row: a listed case study, or null (Cloud has none of its own). */
export function rowExample(view: LayerView): { client: string; href: string } | null {
  if (!view.example || !listed.has(view.example)) return null;
  const story = findStory(view.example);
  return story ? { client: story.client, href: `/our-work/${view.example}` } : null;
}

export function proofCases(view: LayerView): ProofCase[] {
  const out: ProofCase[] = [];
  for (const slug of view.proofSlugs) {
    const story = findStory(slug);
    if (!story || !listed.has(slug)) continue;
    const filter = view.proofFilter;
    const results = (story.results ?? []).filter((result) => !filter || filter.results.test(result.label));
    out.push({
      slug,
      client: story.client,
      kind: caseKind(story.tags),
      headline: filter?.headline ?? story.headline,
      href: `/our-work/${slug}`,
      media: story.media ? { desktop: story.media.desktop, mobile: story.media.mobile, alt: story.media.alt } : null,
      url: story.facts.find((fact) => fact.href)?.detail,
      results,
      // What was built, for a case with no published numbers (a filtered case keeps to its numbers).
      stages: filter ? [] : (story.built?.stages ?? []),
    });
  }
  return out.slice(0, 2);
}

/* ------------------------------------------------------------------ */
/* Index: how it works, and the partnerships pointer                    */
/* ------------------------------------------------------------------ */

/** The homepage's "How it works" (content.ts APPROACH): one process, described the same way on both pages. */
export const INDEX_STEPS: readonly { title: string; text: string }[] = APPROACH.steps;

/** Lowest monthly partnership (site.ts `pricing.bundles`): "$4,000 a month". */
export const PARTNERSHIP_FROM = `${formatMoney(
  Math.min(...pricing.bundles.map((bundle) => lowOf(bundle.price) ?? Number.POSITIVE_INFINITY)),
)} a month`;

/* ------------------------------------------------------------------ */
/* Metadata                                                             */
/* ------------------------------------------------------------------ */

function pageMetadata(path: string, title: string, description: string, og: ServiceCopy['og']): Metadata {
  const url = absoluteUrl(path);
  const full = `${title} | MAPL TECH`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_CA',
      url,
      siteName: 'MAPL TECH',
      title: full,
      description,
      images: [{ url: og.src, width: og.width, height: og.height, alt: og.alt }],
    },
    twitter: { card: 'summary_large_image', site: '@mapltech', title: full, description, images: [og.src] },
  };
}

/** Title, 140-160 character description, self-canonical, Open Graph and Twitter for one service page. */
export function serviceMetadata(slug: ServiceSlug): Metadata {
  const view = layerView(slug);
  return pageMetadata(view.path, view.meta.title, view.meta.description, view.og);
}

/** "Web Development from $5,000, Automation & AI from $3,500, …" from the live table, in canonical names. */
function fromList(): string {
  const [webView, automationView, toolsView, cloudView] = [
    'web-development',
    'automation-ai-workflow-setup',
    'custom-internal-tools',
    'cloud-engineering',
  ].map((slug) => layerView(slug as ServiceSlug));
  const backEnd =
    toolsView.from === cloudView.from
      ? `${toolsView.name} and ${cloudView.name} from ${toolsView.fromMoney}`
      : `${toolsView.name} from ${toolsView.fromMoney}, ${cloudView.name} from ${cloudView.fromMoney}`;
  return `${webView.name} from ${webView.fromMoney}, ${automationView.name} from ${automationView.fromMoney}, ${backEnd}`;
}

export const PRICE_SUMMARY = fromList();

export const INDEX_META = {
  title: 'Services for Agencies',
  name: 'MAPL TECH services for agencies',
  description: `${PRICE_SUMMARY}. Public prices, fixed quotes, for agencies.`,
} as const;

export function indexMetadata(): Metadata {
  return pageMetadata('/services', INDEX_META.title, INDEX_META.description, SHARE_IMAGE);
}
