/**
 * Services family (award pass, Nov 2026): the copy and the derived facts
 * behind /services and the four /services/* pages.
 *
 * Sources, and the only ones:
 *  - prices, tiers, retainers, hourly rates and bundles: `pricing` in
 *    src/config/site.ts, read through src/config/services.ts and
 *    src/lib/estimate.ts, so a price change there changes every page here;
 *  - capabilities, process stages, FAQs, the live site's hero promises, its
 *    section titles and its closing asks: services.ts;
 *  - one-line summaries and deliverables: the homepage copy in
 *    src/components/flagship/content.ts (LAYERS, SERVICES_INTRO, WORK_INTRO);
 *  - case facts: src/components/case/stories.ts (listed projects only).
 * Every sentence written here is cited inline. Nothing is estimated.
 *
 * Punctuation is normalised at render time by `cleanCopy` (a spaced hyphen
 * used as a dash becomes a colon or a comma, numeric ranges get an en dash,
 * apostrophes curl), because the config keeps ASCII ranges the price parser
 * reads. Wording is fixed at the source; the spec fails if banned or retired
 * words come back. FAQ JSON-LD is built from the same cleaned strings the
 * page renders, so markup and structured data cannot disagree.
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
import { listedProjects, pricing, testimonials } from '@/config/site';
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

/** The date this family was rebuilt (JSON-LD dateModified); the sitemap uses routes.ts REDESIGN_DATE. */
export const SERVICES_REVISED = '2026-11-01';

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

/** The scoping line every price on the site closes with (services.ts cost answers). */
export const QUOTE_LINE = 'You get a fixed quote after a 20-minute scoping call.';

/* ------------------------------------------------------------------ */
/* Per-service copy                                                     */
/* ------------------------------------------------------------------ */

export interface Exhibit {
  src: string;
  alt: string;
  caption: string;
}

interface ServiceCopy {
  /** H1: the service's canonical name (SERVICE_META label, the same on every page of the site). */
  name: string;
  /** What the line is in one phrase: the hero label and the index kicker. */
  role: string;
  /** Outcome-first hero lede, under 30 words. */
  lede: string;
  /** One sentence for the index row and the ItemList description. */
  summary: string;
  /** The entry tier's headline inclusions, composed from its feature list. */
  entryIncludes: string;
  /** Who the line is for: the entry tier's own description (site.ts), phrased as an audience. */
  who: string;
  /** Lede under "What we build". */
  deliverIntro: string;
  /** Label for services.ts `stack` (automation's stack lists deliverables, not technologies). */
  stackLabel: string;
  /** Case studies that prove this line, lead case first (stories.ts slugs). */
  proofSlugs: readonly string[];
  /** Cloud shows only MAPL Tours' published infrastructure facts. */
  proofFilter?: { headline: string; results: RegExp; stages: readonly string[] };
  /** Show Alita Fabiano's quote (LRO Staffing is the client behind this line's lead case). */
  quote: boolean;
  /** Real work for the index preview; null draws the pipeline diagram instead (cloud has no screen). */
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
    role: 'What customers see',
    // content.ts LAYERS[0].summary · services.ts FAQ "we build pixel-perfect from Figma, Sketch, or XD files" · content.ts HERO.lede
    lede: 'Custom-coded sites that load fast, rank, and pass an accessibility audit on launch day. Built from your designs, shipped under your brand.',
    summary: 'Custom-coded and headless sites that load fast, rank, and pass an accessibility audit on launch day.',
    // Starter features: "Custom-coded responsive website (up to 7 pages)", "Mobile-first, pixel-perfect build"
    entryIncludes: 'Up to 7 custom-coded pages, built mobile-first',
    // Starter: "For agencies that need a sharp, fast site with no template bloat"
    who: 'Agencies that need a sharp, fast site with no template bloat.',
    // services.ts oneLiner
    deliverIntro: 'Custom-coded sites engineered for speed, accessibility and long-term maintainability.',
    stackLabel: 'Built with',
    proofSlugs: ['lro-staffing', 'chha-ncr', 'focas-canada'],
    quote: true,
    exhibit: {
      src: '/images/cases/lro-desktop.jpg',
      alt: 'The LRO Staffing homepage built by MAPL TECH: “Building Careers. Strengthening Organizations.” above a job search panel.',
      caption: 'LRO Staffing’s website, built by MAPL TECH.',
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
    role: 'What moves the work',
    // content.ts LAYERS[1].summary + deliverable "Integrations with the tools the team already uses"
    lede: 'CRM workflows, AI intake and agents that take the manual work out of your client’s week, wired into the tools their team already uses.',
    summary: 'CRM workflows, AI intake and agents that take the manual work out of your client’s week.',
    // Foundation Automation features: "CRM setup & configuration", "Lead routing workflows", "3-5 core automations"
    entryIncludes: 'CRM setup, lead routing and 3–5 core automations',
    // Foundation Automation: "For agencies doing CRM work and follow-ups by hand"
    who: 'Agencies doing CRM work and follow-ups by hand.',
    // services.ts sections.capabilities.subtitle
    deliverIntro: 'Not just Zapier connections: real engineering that connects the entire operational stack.',
    stackLabel: 'Covers',
    proofSlugs: ['mapl-tours', 'crowned-spice'],
    quote: false,
    exhibit: {
      src: '/images/cases/tours-desktop.jpg',
      alt: 'The MAPL Tours homepage, “Discover Jamaica beyond the resort.”, over aerial footage of the coast.',
      // content.ts WORK[1].outcome
      caption: 'MAPL Tours, our own travel company, with AI handling quoting, booking and follow-up.',
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
    role: 'What the team works in',
    // content.ts LAYERS[2].summary + deliverable "Role-based access from day one"
    lede: 'Dashboards, client portals and ops systems built around how the team actually works, with role-based access from day one.',
    summary: 'Dashboards, client portals and ops systems built around how the team actually works.',
    // Internal Dashboards features: "Real-time reporting", "Role-based access control"
    entryIncludes: 'Real-time reporting with role-based access control',
    // Internal Dashboards: "Give your team real-time visibility into the numbers that matter most" + feature "Real-time reporting"
    who: 'Teams that need real-time reporting on the numbers that matter most.',
    // services.ts sections.capabilities.subtitle
    deliverIntro: 'Off-the-shelf software forces you to adapt. We build tools that adapt to you.',
    stackLabel: 'Built with',
    proofSlugs: ['lro-salary-guide', 'unsvcc'],
    quote: true,
    exhibit: {
      src: '/images/cases/salary-desktop.jpg',
      alt: 'The LRO 2026 Interactive Salary Guide built by MAPL TECH, with its filters and charts.',
      caption: 'The LRO Interactive Salary Guide, built by MAPL TECH.',
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
    role: 'What it all runs on',
    // content.ts LAYERS[3].summary + deliverable "AWS, Google Cloud or Azure, written as code"
    lede: 'Infrastructure as code, CI/CD, monitoring and migrations on AWS, Google Cloud or Azure, so the thing you shipped stays up.',
    summary: 'Infrastructure as code, CI/CD, monitoring and migrations, so the thing you shipped stays up.',
    // Starter Cloud Setup features: provider setup, "Basic CI/CD pipeline configuration", "Uptime monitoring & alerting"
    entryIncludes: 'AWS, GCP or Azure setup, a CI/CD pipeline and uptime monitoring',
    // Starter Cloud Setup: "For agencies ready to move off shared hosting and into reliable, scalable infrastructure"
    who: 'Agencies ready to move off shared hosting and into reliable, scalable infrastructure.',
    // services.ts sections.capabilities.subtitle
    deliverIntro: 'Production-grade infrastructure engineering, not just spinning up servers and hoping for the best.',
    stackLabel: 'Built with',
    proofSlugs: ['mapl-tours'],
    // Only what stories.ts publishes about MAPL Tours' delivery and production: the tests in its CI/CD
    // pipeline and live payments (as results), its review step and payment guardrails (as stages; the
    // "Tests" stage would repeat the tests result).
    proofFilter: {
      // stories.ts facts: Owner MAPL TECH; Status "Live, taking real payments".
      headline: 'Our own travel company, live and taking real payments.',
      results: /tests|payments/i,
      stages: ['Review', 'Money'],
    },
    quote: false,
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
  /** 1-based position in services.ts order (web, automation, tools, cloud): the index numeral. */
  index: number;
  /** "01" */
  numeral: string;
  /** The live site's hero headline for this line, as a statement ("Web development that actually performs."). */
  promise: string;
  /** The live site's process heading ("From brief to browser, step by step."). */
  processTitle: string;
  /** The live site's closing ask for this line (services.ts ctaBand), plus the quote line. */
  close: { title: string; lede: string };
  tiers: readonly ServiceTier[];
  recurring: readonly ServiceRecurringLine[];
  /** Lowest one-time price across the line's tiers. */
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
  const index = services.findIndex((s) => s.slug === record.slug) + 1;
  return {
    ...copy,
    slug: record.slug,
    service: record.estimateKey,
    path: record.path,
    record,
    index,
    numeral: String(index).padStart(2, '0'),
    promise: statement(record.heroTitle),
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

/** The four lines in services.ts order: web, automation, tools, cloud. */
export const LAYER_VIEWS: readonly LayerView[] = services.map(toView);

export function layerView(slug: ServiceSlug): LayerView {
  return LAYER_VIEWS.find((view) => view.slug === slug) ?? toView(getService(slug));
}

/** Lowest one-time price on the whole price list ($3,500 today). */
export const LOWEST_FROM = Math.min(...LAYER_VIEWS.map((view) => view.from));

/** Lowest monthly line across all four lines ($500 today, web Essential Care). */
export const LOWEST_MONTHLY = Math.min(
  ...LAYER_VIEWS.map((view) => view.lowestMonthly?.amount ?? Number.POSITIVE_INFINITY),
);

/** Post-launch support stated for web builds ("30–90 days"), without its "depending on tier" tail. */
export function supportWindow(view: LayerView): string | null {
  return view.record.postLaunchSupport ? cleanCopy(view.record.postLaunchSupport.replace(/ depending on tier/, '')) : null;
}

/* ------------------------------------------------------------------ */
/* Tiers                                                                */
/* ------------------------------------------------------------------ */

export interface TierView {
  id: string;
  name: string;
  /** Tier description from site.ts, cleaned: who the tier is for. */
  who: string;
  /** "$5,000", "$3,500–$5,000", "$20,000+", "Custom" */
  price: string;
  /** Under the price: what kind of number it is. */
  priceNote: string;
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
 * Lines without a stated timeline return an empty map, and the page shows none.
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
  const startingAt = view.service === 'web';
  return view.tiers.map((tier, index) => {
    const parsed = parsePriceLabel(tier.price);
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
      price: parsed.isCustom ? 'Custom' : cleanCopy(tier.price),
      priceNote: parsed.isCustom
        ? 'Scoped with you on a call'
        : startingAt
          ? 'Starting price'
          : parsed.openEnded
            ? 'Published range, open-ended'
            : 'Published range',
      isCustom: parsed.isCustom,
      builds,
      features: tier.features.filter((feature) => feature !== builds).map(cleanCopy),
      timeline: timeline ? { label: `${timeline.min}–${timeline.max} weeks`, ...timeline } : null,
      href: parsed.isCustom ? '/contact-us' : tierEstimateHref(view.service, index),
    };
  });
}

/**
 * One GEO-quotable sentence naming every tier and its price, straight from the table:
 * "Web Development at MAPL TECH: from $5,000 for Starter, from $8,500 for … Enterprise is priced per project."
 */
export function tierSentence(view: LayerView): string {
  const tiers = tierViews(view);
  const priced = tiers.filter((tier) => !tier.isCustom);
  const custom = tiers.filter((tier) => tier.isCustom);
  const from = view.service === 'web' ? 'from ' : '';
  const parts = priced.map((tier) => `${from}${tier.price} for ${tier.name}`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
  const tail = custom.length ? ` ${custom.map((tier) => tier.name).join(' and ')} is priced per project.` : '';
  return `${view.name} at MAPL TECH: ${list}.${tail}`;
}

/* ------------------------------------------------------------------ */
/* What we build, how we build it, FAQ                                  */
/* ------------------------------------------------------------------ */

export function capabilityViews(view: LayerView) {
  return view.record.capabilities.map((capability) => ({
    title: sentenceCase(capability.title),
    text: cleanCopy(capability.description),
  }));
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
  /** Price answers in the homepage FAQ's list form: the direct sentence, one figure per line, the quote line. */
  list?: { lead: string; points: readonly string[]; close?: string };
}

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

/**
 * services.ts composes the price answers from the tier table: every inclusion
 * of every tier in one paragraph, which repeats the tier list a screen above.
 * On these pages the answer gives what was asked (the price of each tier, the
 * quote line) and the inclusions stay in the tier list. Only answers in the
 * composed shape are listed (each tier, or each plan, named with its price);
 * anything else, like the web page's own question, keeps its words.
 */
function priceList(view: LayerView, answer: string): FaqView['list'] {
  const tiers = tierViews(view);
  const tierShape = tiers.every((tier, i) => answer.includes(`${tier.name} (${cleanCopy(view.tiers[i].price)})`));
  if (tierShape && tiers.length > 1) {
    return {
      lead: `From ${view.fromMoney}, across ${COUNT_WORDS[tiers.length]?.toLowerCase() ?? tiers.length} tiers.`,
      points: tiers.map((tier) => `${tier.name}: ${tier.price}`),
      close: answer.match(/You get a fixed quote[^.]*\./)?.[0],
    };
  }
  const plans = view.recurring;
  const planShape =
    plans.length > 0 &&
    /^\w+ monthly \w+ options: /.test(answer) &&
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
    // Questions exactly as services.ts writes them: that is how agencies search, and the JSON-LD carries the same words.
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
  media: { desktop: string; mobile?: string; alt: string; caption?: string } | null;
  /** The live address, for the browser frame's address bar ("lrostaffing.com"). */
  url?: string;
  results: readonly { value: string; label: string }[];
  stages: readonly { name: string; text: string }[];
  stack?: string;
  /** The line narrowed this case to specific facts (cloud: delivery and production only). */
  focused: boolean;
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

export function proofCases(view: LayerView): ProofCase[] {
  const out: ProofCase[] = [];
  for (const slug of view.proofSlugs) {
    const story = findStory(slug);
    if (!story || !listed.has(slug)) continue;
    const filter = view.proofFilter;
    const results = (story.results ?? []).filter((result) => !filter || filter.results.test(result.label));
    const stages = (story.built?.stages ?? []).filter((stage) => !filter || filter.stages.includes(stage.name));
    out.push({
      slug,
      client: story.client,
      kind: caseKind(story.tags),
      headline: filter?.headline ?? story.headline,
      href: `/our-work/${slug}`,
      media: story.media
        ? { desktop: story.media.desktop, mobile: story.media.mobile, alt: story.media.alt, caption: story.media.caption }
        : null,
      url: story.facts.find((fact) => fact.href)?.detail,
      results,
      stages,
      stack: story.facts.find((fact) => fact.term === 'Stack')?.detail,
      focused: Boolean(filter),
    });
  }
  return out;
}

const alita = testimonials.find((t) => t.name === 'Alita Fabiano');

/** The one approved client quote (site.ts testimonials), word for word; only the apostrophes curl. */
export const CLIENT_QUOTE = alita ? { ...alita, quote: cleanCopy(alita.quote) } : null;

/* ------------------------------------------------------------------ */
/* Index: how we work, and the partnerships                             */
/* ------------------------------------------------------------------ */

const web = LAYER_VIEWS.find((view) => view.service === 'web');

/**
 * How an engagement runs. Every term is stated in services.ts or site.ts:
 * the fixed quote (services.ts cost answers), the written plan before the
 * build (every line's Phase 01-02 copy), milestone payments (the shared
 * payment-plans FAQ) and post-launch support (web `postLaunchSupport`, every
 * line's retainers, `hourlyRates`).
 */
export const ENGAGEMENT = [
  {
    title: 'Public prices, fixed quotes.',
    text: 'Every tier on these pages shows its price. Scope your project with us on a 20-minute call and the quote you get is fixed.',
  },
  {
    title: 'You see the plan before we build.',
    text: 'Discovery ends in a written plan you can review: a project spec, a system design, a requirements spec or an architecture plan. Code comes after.',
  },
  {
    title: 'Paid in milestones.',
    text: 'Projects are typically split into a deposit to start, a mid-project payment and a final payment at launch, worked out around your cash flow.',
  },
  {
    title: 'Support after launch.',
    text: `Web builds include ${(web && supportWindow(web)) ?? '30–90 days'} of post-launch support. After that, every service line has a monthly plan from ${formatMoney(LOWEST_MONTHLY)} a month, and hourly work runs ${humanPrice(pricing.hourlyRates.standard)}.`,
  },
] as const;

export interface PartnershipView {
  name: string;
  /** "$4,000–$7,500 a month" */
  price: string;
  description: string;
  features: readonly string[];
}

/** The two monthly partnerships (site.ts `pricing.bundles`), as published. */
export const PARTNERSHIPS: readonly PartnershipView[] = pricing.bundles.map((bundle) => ({
  name: bundle.name,
  price: humanPrice(bundle.price),
  description: `${cleanCopy(bundle.description)}.`,
  features: bundle.features.map(cleanCopy),
}));

/** The single-line floor under the partnerships: the cheapest monthly plan and the hourly rates. */
export const RATES = {
  monthlyFrom: `${formatMoney(LOWEST_MONTHLY)} a month`,
  hourly: humanPrice(pricing.hourlyRates.standard),
  emergency: humanPrice(pricing.hourlyRates.emergency),
} as const;

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
