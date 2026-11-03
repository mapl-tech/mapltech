/**
 * Per-country data for the regional template (`/nigeria`, `/jamaica`).
 *
 * Every sentence is existing copy from the previous nigeria/jamaica pages,
 * `site.ts` or the pricing tables, rewritten in plain English (Nov 2026
 * simplify pass) without adding facts. Removed on purpose, and listed in the
 * build report:
 *
 * - The two "local case studies" (Crowngate Business Enterprises, "Caribbean
 *   Digital Agency"). Crowngate is hidden from /our-work at the owner's
 *   request (site.ts, 2026-10-16) and neither study's numbers can be sourced.
 * - "80%+ of users browse on mobile": a market statistic with no source.
 *
 * Jamaica gets a real local project instead: MAPL Tours, the travel company
 * MAPL TECH built and runs in Jamaica (case study in case/stories.ts).
 *
 * The close ledes join three published lines: the 24-hour reply (/contact-us),
 * the fixed quote after a 20-minute call (the homepage close) and the USD
 * pricing these pages already stated.
 */
import { careers } from '@/config/site';
import type { Country } from '@/config/team';
import type { ServiceSlug } from '@/lib/schema';
import { ESTIMATE_SERVICES, SERVICE_META, formatMoney, parsePriceLabel, tiersFor, type EstimateService } from '@/lib/estimate';
import type { OfficeCity } from './OfficeMap';

export type RegionSlug = 'nigeria' | 'jamaica';

export interface RegionFact {
  term: string;
  detail: string;
}

export interface RegionFaq {
  question: string;
  answer: string;
}

export interface RegionServiceRow {
  slug: ServiceSlug;
  service: EstimateService;
  description: string;
}

export interface RegionWork {
  client: string;
  label: string;
  text: string;
  href: string;
  /** The live site's address, shown in the browser frame. */
  url: string;
  image: { src: string; alt: string; width: number; height: number };
  /** The same site's phone capture (public/images/cases, 780x1688). */
  mobile?: string;
}

export interface RegionConfig {
  slug: RegionSlug;
  path: string;
  country: Country;
  /** "MAPL TECH Nigeria": eyebrow, breadcrumb, close. */
  brandName: string;
  /** IANA zone of the branch office (read by ui/officeTime). */
  timeZone: string;
  officeCity: OfficeCity;
  /** Plain-language zone name and its fixed UTC offset (neither country observes daylight saving). */
  zoneName: string;
  utcLabel: string;
  /** Office city coordinates, for the place readout (public geographic fact). */
  coordinates: string;
  serves: readonly string[];
  hero: { titleLines: readonly [string, string]; lede: string };
  /** Market facts for the hero row. Starting price and reply time are added by the template. */
  facts: readonly RegionFact[];
  team: { heading: string; body: string; realitiesHeading: string; realities: readonly string[] };
  /** `heading` names the service list for assistive tech. */
  services: { heading: string; rows: readonly RegionServiceRow[] };
  overlap: { heading: string; body: string };
  work?: RegionWork;
  faq: { heading: string; items: readonly RegionFaq[] };
  close: { title: string; lede: string };
}

/* ------------------------------------------------------------------ */
/* Derived from `pricing` so the copy can never disagree with the tables */
/* ------------------------------------------------------------------ */

/** Lowest published price of a service line, e.g. "$3,500". */
export function startingFrom(service: EstimateService): string {
  const lows = tiersFor(service)
    .map((tier) => parsePriceLabel(tier.price).low)
    .filter((n): n is number => typeof n === 'number');
  return formatMoney(Math.min(...lows));
}

/** Lowest published price across every line, e.g. "$3,500". */
export function lowestStartingPrice(): string {
  const lows = ESTIMATE_SERVICES.flatMap((service) =>
    tiersFor(service)
      .map((tier) => parsePriceLabel(tier.price).low)
      .filter((n): n is number => typeof n === 'number'),
  );
  return formatMoney(Math.min(...lows));
}

/** "Web Development from $5,000, Automation & AI from $3,500, ..." */
function priceList(): string {
  return ESTIMATE_SERVICES.map((service) => `${SERVICE_META[service].label} from ${startingFrom(service)}`).join(', ');
}

function costAnswer(country: string): string {
  return `The same public prices as everywhere else, in USD for ${country}: ${priceList()}. You get a fixed quote after a 20-minute call, and every price table is on the pricing page.`;
}

/** Published on /contact-us ("We respond within 24 hours"). */
export const REPLY_TIME = 'Within 24 hours';

/** Open roles in one country, straight from `careers` in site.ts. */
export function rolesIn(country: Country) {
  return careers.filter((role) => role.country === country);
}

/* ------------------------------------------------------------------ */
/* Regions                                                              */
/* ------------------------------------------------------------------ */

export const regions: Record<RegionSlug, RegionConfig> = {
  nigeria: {
    slug: 'nigeria',
    path: '/nigeria',
    country: 'Nigeria',
    brandName: 'MAPL TECH Nigeria',
    timeZone: 'Africa/Lagos',
    officeCity: 'Lagos',
    zoneName: 'West Africa Time',
    utcLabel: 'UTC+1',
    coordinates: '6.52° N, 3.38° E',
    serves: ['Lagos', 'Abuja', 'Port Harcourt'],
    hero: {
      titleLines: ['Engineering for', 'Nigerian agencies.'],
      lede: 'We build websites, automation, internal tools and cloud systems for agencies in Lagos, Abuja and Port Harcourt. Our team works in West Africa Time.',
    },
    facts: [
      { term: 'Branch', detail: 'Lagos, Nigeria' },
      { term: 'Serves', detail: 'Lagos, Abuja and Port Harcourt' },
      { term: 'Working hours', detail: '09:00–18:00 West Africa Time (UTC+1)' },
      { term: 'Payments we integrate', detail: 'Paystack and Flutterwave' },
    ],
    team: {
      heading: 'What MAPL TECH Nigeria builds.',
      body: 'Our engineers and project managers live and work in Nigeria. Our Toronto headquarters and 25+ years of combined experience stand behind them.',
      realitiesHeading: 'Built for local needs',
      realities: [
        'Phone-first sites that work on slow connections',
        'Paystack and Flutterwave payments',
        'More than one currency in portals and dashboards',
        'Nigeria’s data protection rules (NDPR) planned into every project',
      ],
    },
    services: {
      heading: 'Our four services and their starting prices',
      rows: [
        {
          slug: 'web-development',
          service: 'web',
          description: 'Custom-coded websites built for Nigerian networks: they load fast, use little data and work well on phones.',
        },
        {
          slug: 'automation-ai-workflow-setup',
          service: 'automation',
          description: 'We automate lead capture, CRM updates, invoicing and client onboarding. AI takes repetitive work off your team.',
        },
        {
          slug: 'custom-internal-tools',
          service: 'tools',
          description: 'Dashboards, client portals and reports with local payments, more than one currency and features that work offline.',
        },
        {
          slug: 'cloud-engineering',
          service: 'cloud',
          description: 'Cloud hosting set up and monitored for agency clients across Africa, with every update tested before it goes live.',
        },
      ],
    },
    overlap: {
      heading: 'We work in West Africa Time.',
      body: 'Our Nigeria team works 09:00 to 18:00 West Africa Time, so you get quick turnarounds and no overnight delays. Our Toronto headquarters comes online every weekday afternoon, Lagos time.',
    },
    faq: {
      heading: 'Questions Nigerian agencies ask first.',
      items: [
        {
          question: 'Do you work in Nigerian business hours?',
          answer:
            'Yes. Our Nigeria team works in West Africa Time (UTC+1), so you can talk to us during your working day, with no overnight delays. Our Toronto headquarters is online every weekday afternoon, Lagos time.',
        },
        {
          question: 'Can you integrate Paystack or Flutterwave?',
          answer:
            'Yes. Dashboards, client portals and reports can take local payments, including Paystack and Flutterwave, in more than one currency.',
        },
        {
          question: 'Is the work NDPR compliant?',
          answer:
            'We plan for NDPR, Nigeria’s data protection rules, from the start of every Nigerian build. We also use the same engineering standards as our Toronto headquarters.',
        },
        {
          question: 'Who actually does the work, Canada or Nigeria?',
          answer:
            'Engineers and project managers who live and work in Nigeria. Our Toronto headquarters and 25+ years of combined experience stand behind them.',
        },
        {
          question: 'What does a project cost in Nigeria?',
          answer: costAnswer('Nigeria'),
        },
      ],
    },
    close: {
      title: 'Building something for a Nigerian client?',
      lede: 'Tell us what you are building. We reply within 24 hours. After a 20-minute call, you get a fixed quote in USD.',
    },
  },

  jamaica: {
    slug: 'jamaica',
    path: '/jamaica',
    country: 'Jamaica',
    brandName: 'MAPL TECH Jamaica',
    timeZone: 'America/Jamaica',
    officeCity: 'Kingston',
    zoneName: 'Eastern Standard Time',
    utcLabel: 'UTC−5',
    coordinates: '17.97° N, 76.79° W',
    serves: ['Kingston', 'Montego Bay'],
    hero: {
      titleLines: ['Engineering for', 'Jamaican agencies.'],
      lede: 'We build websites, automation, internal tools and cloud systems for agencies in Kingston and Montego Bay. Kingston is within an hour of our Toronto headquarters all year.',
    },
    facts: [
      { term: 'Branch', detail: 'Kingston, Jamaica' },
      { term: 'Serves', detail: 'Kingston and Montego Bay' },
      { term: 'Working hours', detail: '09:00–18:00 Eastern Standard Time (UTC−5)' },
      { term: 'How we deliver', detail: 'Weekly updates and documented decisions' },
    ],
    team: {
      heading: 'What MAPL TECH Jamaica builds.',
      body: 'Our engineers and project managers have Caribbean roots. Our Toronto headquarters and 25+ years of combined experience stand behind them.',
      realitiesHeading: 'Built for local needs',
      realities: [
        'Audiences who mostly browse on phones',
        'Caribbean payment providers',
        'Showing up in Caribbean search results (SEO)',
        'Fast on island internet connections',
      ],
    },
    services: {
      heading: 'Our four services and their starting prices',
      rows: [
        {
          slug: 'web-development',
          service: 'web',
          description: 'Custom-coded websites for Caribbean audiences: fast on local networks, built for phones and easy to find in local search.',
        },
        {
          slug: 'automation-ai-workflow-setup',
          service: 'automation',
          description: 'Automated CRM updates, AI help with new client enquiries, and workflows that connect the tools your team already uses.',
        },
        {
          slug: 'custom-internal-tools',
          service: 'tools',
          description: 'Client portals, project dashboards and reports that connect to local payment providers and business tools.',
        },
        {
          slug: 'cloud-engineering',
          service: 'cloud',
          description: 'Cloud hosting designed, set up and managed for agencies, with monitoring, security and every update tested before it goes live.',
        },
      ],
    },
    overlap: {
      heading: 'Within an hour of Toronto, all year.',
      body: 'Our Jamaica team works 09:00 to 18:00 Eastern Standard Time, so you get fast replies and no overnight delays.',
    },
    work: {
      client: 'MAPL Tours',
      label: 'Our own product, in Jamaica',
      text: 'Private airport transfers and tours in Jamaica. We built it, we run it, and it takes real payments.',
      href: '/our-work/mapl-tours',
      url: 'mapltours.com',
      image: {
        src: '/images/cases/tours-desktop.jpg',
        alt: 'The MAPL Tours homepage, built and run by MAPL TECH: "Discover Jamaica beyond the resort." over aerial footage of the Jamaican coast.',
        width: 1800,
        height: 1125,
      },
      mobile: '/images/cases/tours-mobile.jpg',
    },
    faq: {
      heading: 'Questions Jamaican agencies ask first.',
      items: [
        {
          question: 'Do you work in Jamaican business hours?',
          answer:
            'Yes. Our Jamaica team works in Eastern Standard Time (UTC−5), within an hour of Toronto all year, so you can talk to us during your working day, with no overnight delays.',
        },
        {
          question: 'Do you build for Caribbean payment providers and island internet?',
          answer:
            'Yes. We build for audiences who mostly browse on phones, for Caribbean payment providers, for local search and for island internet connections. Client portals, dashboards and reports connect to local payment providers and business tools.',
        },
        {
          question: 'Who actually does the work, Canada or Jamaica?',
          answer:
            'Engineers and project managers with Caribbean roots. Our Toronto headquarters and 25+ years of combined experience stand behind them.',
        },
        {
          question: 'What does a project cost in Jamaica?',
          answer: costAnswer('Jamaica'),
        },
        {
          question: 'How do you keep our team informed?',
          answer:
            'Weekly project updates, documented decisions and clean handoffs, so your team always knows where things stand.',
        },
      ],
    },
    close: {
      title: 'Building something for a Jamaican client?',
      lede: 'Tell us what you are building. We reply within 24 hours. After a 20-minute call, you get a fixed quote in USD.',
    },
  },
};

export function getRegion(slug: RegionSlug): RegionConfig {
  return regions[slug];
}
