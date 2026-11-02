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
export const HOME_PAGE_NAME = `${siteConfig.name} | Systems, Automation & Infrastructure for Agencies`;
export const HOME_PAGE_DESCRIPTION = `The engineering backbone behind digital agencies: websites, AI automation, internal tools and cloud, built by senior engineers in Toronto, Lagos and Kingston.`;

/* ------------------------------------------------------------------ */
/* FAQ (also the FAQPage JSON-LD source)                               */
/* ------------------------------------------------------------------ */

export interface FaqEntry {
  question: string;
  /** Plain text: what the FAQPage JSON-LD carries, and the visible answer unless `list` is set. */
  answer: string;
  /** The same answer in a scannable form for the page (figures one per line). */
  list?: { lead: string; points: readonly string[]; close?: string };
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
    lead: 'Every price is public, and the pricing page lists every tier.',
    points: [
      `${SERVICE_META.web.label} from ${fromOf(web[0].price)}`,
      `${SERVICE_META.automation.label} from ${fromOf(automation[0].price)}`,
      `${SERVICE_META.tools.label} from ${fromOf(tools[0].price)}`,
      `${SERVICE_META.cloud.label} from ${fromOf(cloud[0].price)}`,
      `Partner retainers: ${bundleLow} to ${bundleHigh} a month`,
      // "$65-$120/hour" in site.ts reads as "$65–$120 an hour" here, like every other range.
      `Hourly work: ${pricing.hourlyRates.standard.replace(/^(\$[\d,]+)-(\$[\d,]+)\/hour$/, '$1–$2 an hour')}`,
    ],
    close: 'You get a fixed quote after a 20-minute scoping call.',
  };
  return {
    question: 'How do you price white-label work?',
    answer: [list.lead, ...list.points.map((point) => `${point}.`), list.close].join(' '),
    list,
  };
}

export const FAQ_ITEMS: readonly FaqEntry[] = [
  {
    question: 'Will my client ever know MAPL TECH was involved?',
    answer:
      'No. We sign a mutual NDA and non-solicit before you send anything, every deliverable carries your brand, and your client hears from your PM, not from us. We never list your client as ours.',
  },
  {
    question: 'Who owns the code when the project ends?',
    answer:
      'You and your client do. Every project ships with documented code and a clean handoff, so your team can pick up right where we left off.',
  },
  pricingFaq(),
  {
    question: "Can you work in our client's timezone?",
    answer:
      'Yes. Our teams work from Toronto (Eastern), Lagos (UTC+1, whose afternoon overlaps the Eastern morning) and Kingston (within an hour of Eastern all year). We join your Slack and your standups.',
  },
  {
    question: 'What happens after launch?',
    answer:
      'Every plan includes post-launch support (30–90 days depending on tier). After that, retainer and partnership models keep your systems maintained, optimized, and evolving.',
  },
];
