/**
 * /pricing copy and facts (flagship redesign, Nov 2026).
 *
 * Every price on the page is read from `pricing` in src/config/site.ts through
 * the estimator engine, so the hero, the estimator, the price list and the
 * OfferCatalog JSON-LD can never disagree. Hand-written lines are grounded in
 * a tier's own feature list (cited inline). Copy rules (simplify pass, Nov
 * 2026): plain words a non-technical reader knows ("package", "monthly plan",
 * "a 20-minute call"), no em dashes, no hype verbs. CTA labels: "Start a
 * project" is the page's primary ask (header, estimate readout, tiers, close
 * band); the estimator keeps "Price your project" as the hero's way into it.
 */
import { pricing } from '@/config/site';
import { nameHyphens } from '@/components/services/keepTogether';
import {
  SERVICE_META,
  TOGGLE_OPTIONS,
  formatMoney,
  formatRange,
  parsePriceLabel,
  recurringLinesFor,
  resolveTier,
  tiersFor,
  type EstimateResult,
  type EstimateService,
  type EstimateToggles,
  type SizeKey,
  type ToggleKey,
} from '@/lib/estimate';

export const PRICING_PATH = '/pricing';
export const PRICING_URL = 'https://mapltech.com/pricing';

export const PRICING_TITLE = 'Pricing: public prices and a project estimator';

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

/**
 * A package without a public price, named as on the service pages (serviceContent.ts CUSTOM_PRICE and
 * CUSTOM_NOTE): the price label, and the line that says how it is priced. Plain ASCII, as JSON-LD needs.
 */
export const CUSTOM_PRICE = 'Custom quote';
export const CUSTOM_NOTE = 'Priced with you on a call';

/** "$5,000", "$3,500–$5,000", "$12,000–$25,000+", "Custom quote": a site.ts label for display. */
export function priceText(label: string): string {
  const parsed = parsePriceLabel(label);
  if (parsed.isCustom) return CUSTOM_PRICE;
  if (parsed.high === null || parsed.high === parsed.low) return `${formatMoney(parsed.low ?? 0)}${parsed.openEnded ? '+' : ''}`;
  return formatRange(parsed.low, parsed.high, { openEnded: parsed.openEnded });
}

/**
 * Tier names with non-breaking hyphens, so "E-Commerce" and "AI-Powered" never split across lines:
 * the site's one rule for names (services/keepTogether nameHyphens), so every page sets the same character.
 */
export const keepHyphens = nameHyphens;

/** "20‑minute" for plain string props (the close band's lede): one rule, shared with the service pages. */
export { keepNumberWords } from '@/components/services/keepTogether';

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

/** "$25,000+" / "$18,000" / "a custom quote for Enterprise builds": the top of a service line. */
function ceilingOf(service: EstimateService): string {
  const tiers = tiersFor(service);
  const top = tiers[tiers.length - 1];
  const parsed = parsePriceLabel(top.price);
  if (parsed.isCustom) return `a custom quote for ${top.name} builds`;
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
  tierCount: number;
  monthlyFrom: number;
  /** Answer-first sentences for the price list (GEO): range of packages + monthly floor. */
  answer: string;
  href: string;
  linkLabel: string;
}

// Services are always named by SERVICE_META[key].label (the canonical names).
const SERVICE_COPY: Record<EstimateService, { id: string }> = {
  web: { id: 'web-development' },
  automation: { id: 'automation' },
  tools: { id: 'internal-tools' },
  cloud: { id: 'cloud-engineering' },
};

function factsFor(service: EstimateService): ServiceFacts {
  const copy = SERVICE_COPY[service];
  const meta = SERVICE_META[service];
  const tiers = tiersFor(service);
  const from = lowest(tiers.map((tier) => tier.price));
  const monthlyFrom = lowest(recurringLinesFor(service).map((line) => line.price));
  const monthly = meta.recurringLabel === 'Maintenance' ? 'Monthly maintenance' : 'Monthly plans';
  return {
    service,
    id: copy.id,
    name: meta.label,
    from,
    fromLabel: formatMoney(from),
    tierCount: tiers.length,
    monthlyFrom,
    answer: `${NUMBER_WORDS[tiers.length]} packages, from ${formatMoney(from)} to ${ceilingOf(service)}. ${monthly} from ${formatMoney(monthlyFrom)} a month.`,
    href: meta.path,
    linkLabel: `More about ${meta.label}`,
  };
}

export const SERVICES: readonly ServiceFacts[] = (['web', 'automation', 'tools', 'cloud'] as const).map(factsFor);

export const factsOf = (service: EstimateService): ServiceFacts =>
  SERVICES.find((entry) => entry.service === service) ?? factsFor(service);

/* ------------------------------------------------------------------ */
/* Monthly lines: monthly partnerships (site.ts `bundles`) and hourly    */
/* ------------------------------------------------------------------ */

/**
 * A range inside a sentence: "$4,000 to $7,500", "$12,000 to $25,000+" (site-wide, prose says "to";
 * only compact price labels, such as a package's price or a tile's, keep the en dash of formatRange).
 */
export const inWords = (range: string): string => range.replace(/(\$?[\d,]+)–(\$?[\d,]+\+?)/g, '$1 to $2');

const bundleRange = (label: string) => {
  const parsed = parsePriceLabel(label);
  return inWords(formatRange(parsed.low, parsed.high));
};

/** The monthly partnerships in short sentences (the price list row and the pricing FAQ). */
export const BUNDLES_ANSWER = [
  'A monthly partnership covers several services for one monthly price.',
  ...pricing.bundles.map((bundle) => `${bundle.name} is ${bundleRange(bundle.price)} a month.`),
].join(' ');

const standard = parsePriceLabel(pricing.hourlyRates.standard);
const emergency = parsePriceLabel(pricing.hourlyRates.emergency);

export const HOURLY = {
  answer: `Standard work is ${inWords(formatRange(standard.low, standard.high))} an hour. Urgent fixes and AI specialist work are ${inWords(formatRange(emergency.low, emergency.high))} an hour.`,
  // Names match the OfferCatalog JSON-LD (src/lib/schema.ts offerCatalog) word for word.
  rates: [
    { name: 'Standard hourly rate', price: pricing.hourlyRates.standard, description: 'Development work for any of our four services.' },
    {
      name: 'Emergency hourly rate',
      price: pricing.hourlyRates.emergency,
      description: 'Urgent fixes, AI agent work and other specialist work. Choosing Rush in the estimator adds this rate.',
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

/** The quote promise, in the page's own words (estimate.ts FIXED_QUOTE_NOTE says "scoping call"). */
export const QUOTE_NOTE = 'Fixed quote after a 20-minute call';

export const HERO = {
  eyebrow: 'Pricing',
  title: 'What it costs, before you ask.',
  // The starting prices follow at once (the ledger); the lede says how to use them. 17 words.
  lede: 'Every price is public. Answer five questions to get a price range for your project. No email needed.',
  // What happens after the range (QUOTE_NOTE; one price for the scope agreed with you).
  trust: 'On a 20-minute call, we agree the scope with you. Then we send one fixed price.',
} as const;

/** "22 September 2026", formatted without Intl so server and client agree byte for byte. */
export function longDate(iso: string): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${months[month - 1]} ${year}`;
}

/* ------------------------------------------------------------------ */
/* Estimator, price list, questions, close                               */
/* ------------------------------------------------------------------ */

export const ESTIMATOR = {
  label: 'Estimator',
  title: 'Price your project.',
  lede: 'Answer five questions. The price range updates as you go, using the prices on this page.',
} as const;

/**
 * The estimator's add-on names in everyday words. The engine's labels
 * (estimate.ts TOGGLE_OPTIONS) stay as they are for the brief and the emails;
 * these replace them wherever /pricing shows one, switches and breakdown alike.
 */
export const TOGGLE_LABELS: Partial<Record<ToggleKey, string>> = {
  cms: 'Content editing (CMS)',
  ecommerce: 'Online store or bookings',
  auth: 'User logins and roles',
};

/**
 * The add-ons that move a size up to a dearer package (estimate.ts
 * resolveTier), by their names on this page: only those that need the
 * package the estimate lands on ("Content editing (CMS)" for Growth / E-Commerce
 * at "Up to 7 pages"). Empty when the size's own package applies.
 */
export function addOnsMoving(service: EstimateService, size: SizeKey | undefined, toggles: EstimateToggles): string[] {
  const own = resolveTier(service, size, {}).index;
  const landed = resolveTier(service, size, toggles).index;
  if (landed <= own) return [];
  return TOGGLE_OPTIONS.filter(
    (toggle) => toggles[toggle.key] === true && resolveTier(service, size, { [toggle.key]: true }).index === landed,
  ).map((toggle) => TOGGLE_LABELS[toggle.key] ?? toggle.label);
}

/** "A", "A and B", "A, B and C". */
export function listWords(items: readonly string[]): string {
  return items.length < 2 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** An add-on's name inside a sentence: "content editing (CMS)" (acronyms such as "AI features" keep their capitals). */
export const inSentence = (name: string): string => (/^[A-Z][a-z]/.test(name) ? name[0].toLowerCase() + name.slice(1) : name);

/**
 * The total the readout and the phone bar show. The engine leaves a total
 * with a package quoted after a call open ("$3,500+" for Web Development's
 * Enterprise plus Automation's Foundation), which reads as a floor for the
 * whole project; here the priced packages keep their own range
 * ("$3,500–$5,000") and the quoted ones are named beside it ("and a custom
 * quote for Enterprise"). Without such a package it is the engine's total.
 */
export interface EstimateHeadline {
  low: number;
  /** null when a priced package has no top ("$12,000+"). */
  high: number | null;
  /** A trailing "+" on a full range ("$12,000–$25,000+"). */
  openEnded: boolean;
  /** No package has a public price: the total reads "Custom quote". */
  allCustom: boolean;
  /** "and a custom quote for Enterprise" beside a priced range; null when every package has a price. */
  customNote: string | null;
}

export function estimateHeadline(result: EstimateResult): EstimateHeadline {
  const priced = result.lines.filter((line) => !line.isCustom);
  const custom = result.lines.filter((line) => line.isCustom).map((line) => keepHyphens(line.tierName));
  const allCustom = result.lines.length > 0 && priced.length === 0;
  return {
    low: priced.reduce((sum, line) => sum + (line.low ?? 0), 0),
    high: priced.some((line) => line.high === null) ? null : priced.reduce((sum, line) => sum + (line.high ?? 0), 0),
    openEnded: priced.some((line) => line.isOpenEnded),
    allCustom,
    customNote: custom.length > 0 && !allCustom ? `and a custom quote for ${listWords(custom)}` : null,
  };
}

/** The headline as text: "$3,500–$5,000", "$12,000+", "$12,000–$25,000+", "Custom quote". */
export const headlineRange = (headline: EstimateHeadline): string =>
  headline.allCustom ? CUSTOM_PRICE : formatRange(headline.low, headline.high, { openEnded: headline.openEnded });

/**
 * The estimate's springing digits (ui/LiveNumber): critically damped and
 * quick, so a new total settles in about 0.3s (0.4s for the largest jumps)
 * and never trails the click that changed it.
 */
export const TOTAL_SPRING = { stiffness: 1400, damping: 58, mass: 0.6 } as const;

export const PRICE_LIST = {
  label: 'Price list',
  title: 'Every price, by service.',
  lede: 'Open a service to see each package, what it includes and the monthly plans.',
} as const;

export const FAQ_COPY = {
  label: 'Questions',
  /** Also the FAQPage JSON-LD name. */
  title: 'Questions about pricing.',
  lede: 'Cost, timelines and payment, answered in plain words.',
} as const;

/**
 * The close band. Sources: the 20-minute call and the fixed quote
 * (QUOTE_NOTE), one price for the agreed work (HERO.trust), white label
 * (the previous close: "the work ships under your brand").
 */
export const CLOSE = {
  title: 'Turn your range into a fixed quote.',
  // Display only (not JSON-LD): "20 minutes" keeps its number on the line with a no-break space.
  lede: 'Tell us about the project. We talk for 20\u00a0minutes, agree the scope with you, and send one fixed price. The work goes out under your brand.',
} as const;
