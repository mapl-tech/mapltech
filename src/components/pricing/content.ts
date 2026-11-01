/**
 * /pricing copy and facts (flagship redesign, Nov 2026).
 *
 * Every price on the page is read from `pricing` in src/config/site.ts through
 * the estimator engine, so the hero, the estimator, the price list and the
 * OfferCatalog JSON-LD can never disagree. Hand-written lines are grounded in
 * a tier's own feature list (cited inline). Copy rules: no em dashes, no hype
 * verbs, "Price your project" and "Book a call" are the only CTA labels.
 */
import { pricing, testimonials } from '@/config/site';
import {
  FIXED_QUOTE_NOTE,
  SERVICE_META,
  formatMoney,
  formatRange,
  parsePriceLabel,
  recurringLinesFor,
  tiersFor,
  type EstimateService,
} from '@/lib/estimate';

export const PRICING_PATH = '/pricing';
export const PRICING_URL = 'https://mapltech.com/pricing';

export const PRICING_TITLE = 'Pricing: public prices and a project estimator';

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

/** "$5,000", "$3,500–$5,000", "$12,000–$25,000+", "Custom quote": a site.ts label for display. */
export function priceText(label: string): string {
  const parsed = parsePriceLabel(label);
  if (parsed.isCustom) return 'Custom quote';
  if (parsed.high === null || parsed.high === parsed.low) return `${formatMoney(parsed.low ?? 0)}${parsed.openEnded ? '+' : ''}`;
  return formatRange(parsed.low, parsed.high, { openEnded: parsed.openEnded });
}

/** Tier names with non-breaking hyphens, so "E-Commerce" and "AI-Powered" never split across lines. */
export const keepHyphens = (text: string): string => text.replace(/-/g, '‑');

/**
 * site.ts descriptions use a spaced hyphen as a dash ("a brochure site - they
 * need"); the visible copy sets it as a colon, per the no-dash copy rule.
 */
export const cleanDash = (text: string): string => text.replace(/\s+-\s+/g, ': ');

/**
 * site.ts copy as shown on the page. site.ts carries the canonical service
 * names itself now, so only the dash rule applies.
 */
export const canonicalCopy = (text: string): string => cleanDash(text);

/** Lowest number published across a list of price labels (custom labels are skipped). */
function lowest(labels: readonly string[]): number {
  const lows = labels.map((label) => parsePriceLabel(label).low).filter((n): n is number => typeof n === 'number');
  return Math.min(...lows);
}

/** "$25,000+" / "$18,000" / "custom-quoted Enterprise builds": the top of a service line. */
function ceilingOf(service: EstimateService): string {
  const tiers = tiersFor(service);
  const top = tiers[tiers.length - 1];
  const parsed = parsePriceLabel(top.price);
  if (parsed.isCustom) return `custom-quoted ${top.name} builds`;
  if (parsed.high === null) return `${formatMoney(parsed.low ?? 0)}+`;
  return `${formatMoney(parsed.high)}${parsed.openEnded ? '+' : ''}`;
}

export interface ServiceFacts {
  service: EstimateService;
  /** Anchor of the service line in the price list (kept from the previous page). */
  id: string;
  name: string;
  from: number;
  fromLabel: string;
  /** The entry tier in one line, grounded in that tier's feature list. */
  entry: string;
  tierCount: number;
  monthlyFrom: number;
  /** Answer-first sentence for the price list (GEO): range of tiers + monthly floor. */
  answer: string;
  href: string;
  linkLabel: string;
}

// Services are always named by SERVICE_META[key].label (the canonical names).
const SERVICE_COPY: Record<EstimateService, { id: string; entry: string }> = {
  // Starter: "Custom-coded responsive website (up to 7 pages)"
  web: { id: 'web-development', entry: 'Starter: a custom-coded site, up to 7 pages' },
  // Foundation Automation: "CRM setup & configuration", "3-5 core automations"
  automation: { id: 'automation', entry: 'Foundation: CRM setup and 3 to 5 core automations' },
  // Internal Dashboards: "Custom data visualization", "Real-time reporting"
  tools: { id: 'internal-tools', entry: 'A custom dashboard with real-time reporting' },
  // Starter Cloud Setup: "Cloud provider setup (AWS, GCP, or Azure)"
  cloud: { id: 'cloud-engineering', entry: 'Starter setup on AWS, GCP or Azure' },
};

function factsFor(service: EstimateService): ServiceFacts {
  const copy = SERVICE_COPY[service];
  const meta = SERVICE_META[service];
  const tiers = tiersFor(service);
  const from = lowest(tiers.map((tier) => tier.price));
  const monthlyFrom = lowest(recurringLinesFor(service).map((line) => line.price));
  const recurring = meta.recurringLabel === 'Maintenance' ? 'Maintenance' : 'Retainers';
  return {
    service,
    id: copy.id,
    name: meta.label,
    from,
    fromLabel: formatMoney(from),
    entry: copy.entry,
    tierCount: tiers.length,
    monthlyFrom,
    answer: `There are ${NUMBER_WORDS[tiers.length].toLowerCase()} ${meta.label} tiers, from ${formatMoney(from)} to ${ceilingOf(service)}. ${recurring} ${recurring === 'Maintenance' ? 'starts' : 'start'} at ${formatMoney(monthlyFrom)} a month.`,
    href: meta.path,
    linkLabel: `${meta.label} in detail`,
  };
}

export const SERVICES: readonly ServiceFacts[] = (['web', 'automation', 'tools', 'cloud'] as const).map(factsFor);

export const factsOf = (service: EstimateService): ServiceFacts =>
  SERVICES.find((entry) => entry.service === service) ?? factsFor(service);

/* ------------------------------------------------------------------ */
/* Monthly lines: bundles and hourly                                     */
/* ------------------------------------------------------------------ */

const bundleRange = (label: string) => {
  const parsed = parsePriceLabel(label);
  return formatRange(parsed.low, parsed.high);
};

export const BUNDLES_ANSWER = `${NUMBER_WORDS[pricing.bundles.length]} monthly partnerships cover several service lines at once: ${pricing.bundles
  .map((bundle) => `${bundle.name} at ${bundleRange(bundle.price)} a month`)
  .join(' and ')}.`;

const standard = parsePriceLabel(pricing.hourlyRates.standard);
const emergency = parsePriceLabel(pricing.hourlyRates.emergency);

export const HOURLY = {
  answer: `Standard work is ${formatRange(standard.low, standard.high)} an hour. Urgent fixes and AI specialist work are ${formatRange(emergency.low, emergency.high)} an hour.`,
  // Names match the OfferCatalog JSON-LD (src/lib/schema.ts offerCatalog) word for word.
  rates: [
    { name: 'Standard hourly rate', price: pricing.hourlyRates.standard, description: 'Development and systems work across all four service lines.' },
    {
      name: 'Emergency hourly rate',
      price: pricing.hourlyRates.emergency,
      description: 'Urgent fixes, AI agent development and specialised work. The estimator’s Rush option adds this rate.',
    },
  ],
} as const;

export const HOURLY_FROM = formatMoney(standard.low ?? 0);
export const BUNDLES_FROM = formatMoney(lowest(pricing.bundles.map((bundle) => bundle.price)));

/* ------------------------------------------------------------------ */
/* Hero                                                                  */
/* ------------------------------------------------------------------ */

const web = factsOf('web');
const automation = factsOf('automation');
const tools = factsOf('tools');
const cloud = factsOf('cloud');

const toolsAndCloud =
  tools.from === cloud.from
    ? `${tools.name} and ${cloud.name} from ${tools.fromLabel}`
    : `${tools.name} from ${tools.fromLabel}, ${cloud.name} from ${cloud.fromLabel}`;

/** Canonical service names and the four starting prices, read from site.ts (140-160 characters). */
const FROM_PRICES = `${web.name} from ${web.fromLabel}, ${automation.name} from ${automation.fromLabel}, ${toolsAndCloud}`;

export const PRICING_DESCRIPTION = `${FROM_PRICES}. Price your project in the estimator.`;

export const HERO = {
  eyebrow: 'Pricing',
  title: 'What it costs, before you ask.',
  // Answer-first (GEO): the first sentence under the H1 is the price list. 25 words.
  lede: `${FROM_PRICES}. Answer five questions for the range that fits your project. No email needed.`,
  trust: `Ranges come straight from the price list below. ${FIXED_QUOTE_NOTE.replace('20-min', '20-minute')}.`,
} as const;

/** "22 September 2026", formatted without Intl so server and client agree byte for byte. */
export function longDate(iso: string): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

/* ------------------------------------------------------------------ */
/* Estimator, quote steps, close                                          */
/* ------------------------------------------------------------------ */

export const ESTIMATOR = {
  title: 'Price your project.',
  lede: 'Each answer maps to a published tier, so the range moves as you go. You see it before we ask for an email.',
} as const;

/**
 * What happens after the estimate. Sources: FIXED_QUOTE_NOTE (estimate.ts);
 * the call covers the brief the contact page asks for (goal, current state,
 * timeline); milestone payments and the 30-90 day post-launch support come
 * from the pricing FAQ and the web tier feature lists in site.ts.
 */
export const QUOTE_STEPS = {
  title: 'From a range to a fixed quote.',
  lede: 'The estimate is where the conversation starts. Here is everything that happens after it.',
  steps: [
    { name: 'Price it here', text: 'The estimator gives you a range from the published price list. No email, no call.' },
    {
      name: 'A 20-minute scoping call',
      text: 'We walk through the scope with you: what the build has to do, what you already have, and when it needs to ship.',
    },
    {
      name: 'A fixed quote',
      text: 'You get one price for the agreed scope, usually paid in milestones: a deposit to start, a payment mid-project and the final payment at launch.',
    },
    {
      name: 'Launch, then support',
      text: `${web.name} plans include 30 to 90 days of post-launch support, depending on the tier. Monthly maintenance after that is optional.`,
    },
  ],
} as const;

export const PRICE_LIST = {
  title: 'The full price list.',
  lede: 'Every package, retainer and rate, in plain text. The estimator reads from this same list.',
} as const;

export const FAQ_COPY = {
  title: 'Pricing questions, answered plainly.',
  lede: 'What agency owners ask us about cost, timelines and payment before they book a call.',
} as const;

export const CLOSE = {
  title: 'Take your number to a 20-minute call.',
  lede: 'We turn the range into a fixed quote for your scope, and the work ships under your brand.',
} as const;

/** The one approved client quote (site.ts `testimonials`, LRO Staffing). */
export const PROOF = testimonials.find((entry) => entry.company === 'LRO Staffing') ?? null;
