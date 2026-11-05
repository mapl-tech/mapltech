/**
 * Homepage content that is not the flagship acts' own copy: the page's
 * identity (also the root layout's default title and description, so the
 * meta tags and the WebPage JSON-LD can never disagree) and the five FAQ
 * answers (rendered by HomeFaq and serialised as FAQPage JSON-LD).
 *
 * Every figure is derived from `pricing` in src/config/site.ts; nothing is
 * typed in by hand. Server-safe: no client imports.
 */
import { pricing, siteConfig } from '@/config/site';
import { SERVICE_META, formatMoney, parsePriceLabel } from '@/lib/estimate';
import { ESTIMATE_HREF, PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';

/** "$3,500-$5,000" → "$3,500": the low end of a published range, as written. */
const fromOf = (label: string): string => label.split('-')[0].trim();

const web = pricing.webDevelopment.tiers;
const automation = pricing.automation.tiers;
const tools = pricing.internalTools.tiers;
const cloud = pricing.cloudEngineering.tiers;

const lowOf = (label: string): string => {
  const parsed = parsePriceLabel(label);
  return parsed.low === null ? label : formatMoney(parsed.low);
};
const highOf = (label: string): string => {
  const parsed = parsePriceLabel(label);
  const value = parsed.high ?? parsed.low;
  return value === null ? label : formatMoney(value);
};


/* ------------------------------------------------------------------ */
/* Page identity                                                        */
/* ------------------------------------------------------------------ */

// The live site's title and purpose, kept: systems, automation and infrastructure for agencies.
export const HOME_PAGE_NAME = `${siteConfig.name} | White-Label Web, Automation & Cloud for Agencies`;
export const HOME_PAGE_DESCRIPTION = `The engineering backbone behind digital agencies: we work with your team on websites, AI automation, internal tools and cloud, from Toronto, Lagos and Kingston.`;

/* ------------------------------------------------------------------ */
/* FAQ (also the FAQPage JSON-LD source)                               */
/* ------------------------------------------------------------------ */

export interface FaqEntry {
  question: string;
  /** Plain text: what the FAQPage JSON-LD carries, and the visible answer unless `list` is set. */
  answer: string;
  /** The same answer in a scannable form for the page (figures one per line). */
  list?: { lead: string; points: readonly string[]; close?: string };
  /**
   * The next step after the answer, as links under it (the page only: the
   * JSON-LD carries the answer text alone).
   */
  actions?: readonly { label: string; href: string }[];
}

const bundleLow = lowOf(pricing.bundles[0].price);
const bundleHigh = highOf(pricing.bundles[pricing.bundles.length - 1].price);

/**
 * The pricing answer: the list is what the page shows, and the JSON-LD text is
 * built from the same words, so the two can never drift. List items are labels,
 * so they use the canonical service names.
 */
function pricingFaq(): FaqEntry {
  const list = {
    lead: 'White-label means your agency sells and delivers the work under its own name, and we build it with your team. Our prices are public:',
    points: [
      `${SERVICE_META.web.label} from ${fromOf(web[0].price)}`,
      `${SERVICE_META.automation.label} from ${fromOf(automation[0].price)}`,
      `${SERVICE_META.tools.label} from ${fromOf(tools[0].price)}`,
      `${SERVICE_META.cloud.label} from ${fromOf(cloud[0].price)}`,
      `Monthly partnerships: ${bundleLow} to ${bundleHigh} a month`,
      // "$65-$120/hour" in site.ts reads "$65 to $120 an hour": a range in a sentence says "to", as above.
      `Hourly work: ${pricing.hourlyRates.standard.replace(/^(\$[\d,]+)-(\$[\d,]+)\/hour$/, '$1 to $2 an hour')}`,
    ],
    close: 'You get a fixed quote after a 20-minute call.',
  };
  return {
    question: 'How much does white-label work cost?',
    answer: [list.lead, ...list.points.map((point) => `${point}.`), list.close].join(' '),
    list,
    // The answer names a price and a call: both are one tap away (the estimator, the brief).
    actions: [
      { label: 'Price your project', href: ESTIMATE_HREF },
      { label: PROJECT_LABEL, href: PROJECT_HREF },
    ],
  };
}

export const FAQ_ITEMS: readonly FaqEntry[] = [
  {
    question: 'Will my client ever know MAPL TECH was involved?',
    answer:
      'No. Everything we make carries your brand. Your client talks to your team, not to us, and we never list your client as ours.',
  },
  {
    question: 'Who owns the code when the project ends?',
    answer:
      'You and your client do. We hand over the code with clear notes, so your team can carry on where we left off.',
  },
  pricingFaq(),
  {
    question: "Can you work in our client's timezone?",
    answer:
      'Yes. Our offices are in Toronto (Eastern time), Kingston (within an hour of Eastern time all year) and Lagos (UTC+1, whose afternoon overlaps the Eastern morning). We join your Slack and your team check-ins.',
  },
  {
    question: 'What happens after launch?',
    answer:
      'Every package includes 30 to 90 days of support after launch, depending on the package. After that, you can choose a monthly plan for updates, fixes and improvements.',
  },
];
