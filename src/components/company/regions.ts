/**
 * Per-country data for the regional template (`/nigeria`, `/jamaica`).
 *
 * Every sentence is existing copy from the previous nigeria/jamaica pages,
 * `site.ts` or the pricing tables, edited only for the copy rules (no em
 * dashes, no hype verbs). Removed on purpose, and listed in the build report:
 *
 * - The two "local case studies" (Crowngate Business Enterprises, "Caribbean
 *   Digital Agency"). Crowngate is hidden from /our-work at the owner's
 *   request (site.ts, 2026-10-16) and neither study's numbers can be sourced.
 * - "80%+ of users browse on mobile": a market statistic with no source.
 *
 * Jamaica gets a real local project instead: MAPL Tours, the travel company
 * MAPL TECH built and runs in Jamaica (case study in case/stories.ts).
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
  image: { src: string; alt: string; width: number; height: number };
}

export interface RegionConfig {
  slug: RegionSlug;
  path: string;
  country: Country;
  /** "MAPL TECH Nigeria": eyebrow, breadcrumb, close. */
  brandName: string;
  /** IANA zone of the branch office (matches TimezoneOverlap OFFICES). */
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
  team: { heading: string; body: readonly string[]; realitiesHeading: string; realities: readonly string[] };
  services: { heading: string; rows: readonly RegionServiceRow[] };
  overlap: { heading: string; body: string; footnote: string };
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

/** "Web Development, Automation & AI, Custom Internal Tools and Cloud Engineering": the canonical names from SERVICE_META, never retyped. */
export const SERVICE_NAMES = (() => {
  const labels = ESTIMATE_SERVICES.map((service) => SERVICE_META[service].label);
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
})();

function costAnswer(country: string): string {
  return `The same public tiers MAPL TECH quotes everywhere, priced in USD for ${country}: ${priceList()}. Every quote is fixed after a 20-minute scoping call, and the full tier tables are on the pricing page.`;
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
      lede: `${SERVICE_NAMES} for agencies in Lagos, Abuja and Port Harcourt, delivered in West Africa Time.`,
    },
    facts: [
      { term: 'Branch', detail: 'Lagos, Nigeria' },
      { term: 'Serves', detail: 'Lagos, Abuja and Port Harcourt' },
      { term: 'Working hours', detail: '09:00–18:00 West Africa Time (UTC+1)' },
      { term: 'Payments we integrate', detail: 'Paystack and Flutterwave' },
    ],
    team: {
      heading: 'What MAPL TECH Nigeria builds.',
      body: [
        "Engineers and project managers who live and work in Nigeria, backed by our Toronto headquarters and MAPL TECH's 25+ years of combined engineering experience.",
      ],
      realitiesHeading: 'Built for local realities',
      realities: [
        'Mobile-first builds for variable bandwidth',
        'Paystack and Flutterwave integrations',
        'Multi-currency support in portals and dashboards',
        'NDPR compliance scoped into every build',
      ],
    },
    services: {
      heading: 'Four services, one public price list.',
      rows: [
        {
          slug: 'web-development',
          service: 'web',
          description: 'Custom-coded sites built for Nigerian network conditions: fast loads, light data use and mobile-first design.',
        },
        {
          slug: 'automation-ai-workflow-setup',
          service: 'automation',
          description: 'Lead capture, CRM routing, invoicing and client onboarding, automated, with AI workflows that take the repetitive work off your team.',
        },
        {
          slug: 'custom-internal-tools',
          service: 'tools',
          description: 'Dashboards, client portals and reporting systems with local payment integrations, multi-currency support and offline-capable features.',
        },
        {
          slug: 'cloud-engineering',
          service: 'cloud',
          description: 'Cloud infrastructure, CI/CD pipelines and monitoring systems for agency clients across Africa.',
        },
      ],
    },
    overlap: {
      heading: 'Real-time collaboration in West Africa Time.',
      body: 'Our Nigeria team works in West Africa Time, so you get quick turnarounds and no overnight delays. Toronto headquarters comes online every weekday afternoon in Lagos.',
      footnote: 'Lagos does not change its clocks: it is 5 hours ahead of Toronto in summer and 6 in winter.',
    },
    faq: {
      heading: 'Questions Nigerian agencies ask first.',
      items: [
        {
          question: 'Do you work in Nigerian business hours?',
          answer:
            'Yes. Our Nigeria team works in West Africa Time (UTC+1), so you get real-time collaboration, quick turnarounds and no overnight delays. Toronto headquarters overlaps every weekday afternoon.',
        },
        {
          question: 'Can you integrate Paystack or Flutterwave?',
          answer:
            'Yes. Dashboards, client portals and reporting systems ship with local payment integrations, including Paystack and Flutterwave, and multi-currency support.',
        },
        {
          question: 'Is the work NDPR compliant?',
          answer:
            'NDPR compliance is part of how we scope every Nigerian build, alongside the same engineering standards our Toronto headquarters applies.',
        },
        {
          question: 'Who actually does the work, Canada or Nigeria?',
          answer:
            "Engineers and project managers who live and work in Nigeria, backed by our Toronto headquarters and MAPL TECH's 25+ years of combined engineering experience.",
        },
        {
          question: 'What does a project cost in Nigeria?',
          answer: costAnswer('Nigeria'),
        },
        {
          question: 'How quickly do you reply?',
          answer: 'Within 24 hours, whether you are in Lagos, Abuja, Port Harcourt or anywhere else in Nigeria.',
        },
      ],
    },
    close: {
      title: 'Building something for a Nigerian client?',
      lede: 'Pick what it is. The estimator opens with it selected, priced in USD from the same public list we use everywhere. We reply within 24 hours.',
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
      lede: `${SERVICE_NAMES} for agencies in Kingston and Montego Bay, within an hour of our Toronto headquarters all year.`,
    },
    facts: [
      { term: 'Branch', detail: 'Kingston, Jamaica' },
      { term: 'Serves', detail: 'Kingston and Montego Bay' },
      { term: 'Working hours', detail: '09:00–18:00 Eastern Standard Time (UTC−5)' },
      { term: 'How we deliver', detail: 'Weekly updates and documented decisions' },
    ],
    team: {
      heading: 'What MAPL TECH Jamaica builds.',
      body: [
        "Engineers and project managers with Caribbean roots, backed by our Toronto headquarters and MAPL TECH's 25+ years of combined engineering experience.",
      ],
      realitiesHeading: 'Built for local realities',
      realities: [
        'Mobile-heavy audiences',
        'Caribbean payment gateways',
        'SEO for regional search',
        'Performance tuned for island connectivity',
      ],
    },
    services: {
      heading: 'Four services, one public price list.',
      rows: [
        {
          slug: 'web-development',
          service: 'web',
          description: 'Custom-coded sites built for Caribbean audiences: fast loads on local networks, mobile-first design and SEO for regional search.',
        },
        {
          slug: 'automation-ai-workflow-setup',
          service: 'automation',
          description: 'Automated CRM pipelines, AI-assisted client intake and workflows that connect every tool your team uses.',
        },
        {
          slug: 'custom-internal-tools',
          service: 'tools',
          description: 'Client portals, project dashboards and reporting systems with integrations for local payment providers and business tools.',
        },
        {
          slug: 'cloud-engineering',
          service: 'cloud',
          description: 'Cloud infrastructure designed, deployed and managed for agencies: CI/CD pipelines, infrastructure as code, monitoring and security.',
        },
      ],
    },
    overlap: {
      heading: 'Same-day collaboration, an hour from Toronto at most.',
      body: 'Our Jamaica team works in Eastern Standard Time, within an hour of Toronto all year, so you get real-time collaboration, fast responses and no overnight delays.',
      footnote:
        'Kingston does not observe daylight saving time, so it matches Toronto in winter and sits one hour behind in summer. Lagos is 5 to 6 hours ahead.',
    },
    work: {
      client: 'MAPL Tours',
      label: 'Our own product, in Jamaica',
      text: 'Private airport transfers and tours in Jamaica, built and run by MAPL TECH. It is live and takes real payments, so every failure mode is a real one.',
      href: '/our-work/mapl-tours',
      image: {
        src: '/images/cases/tours-desktop.jpg',
        alt: 'The MAPL Tours homepage, built and run by MAPL TECH: "Discover Jamaica beyond the resort." over aerial footage of the Jamaican coast.',
        width: 1800,
        height: 1125,
      },
    },
    faq: {
      heading: 'Questions Jamaican agencies ask first.',
      items: [
        {
          question: 'Do you work in Jamaican business hours?',
          answer:
            'Yes. Our Jamaica team works in Eastern Standard Time (UTC−5), within an hour of Toronto all year, so you get real-time collaboration, fast responses and no overnight delays.',
        },
        {
          question: 'Do you build for Caribbean payment gateways and island connectivity?',
          answer:
            'Yes. We build for mobile-heavy audiences, Caribbean payment gateways, regional search and island connectivity. Client portals, project dashboards and reporting systems ship with integrations for local payment providers and business tools.',
        },
        {
          question: 'Who actually does the work, Canada or Jamaica?',
          answer:
            "Engineers and project managers with deep Caribbean roots, backed by our Toronto headquarters and MAPL TECH's 25+ years of combined engineering experience.",
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
        {
          question: 'How quickly do you reply?',
          answer: 'Within 24 hours, whether you are in Kingston, Montego Bay or anywhere else in Jamaica.',
        },
      ],
    },
    close: {
      title: 'Building something for a Jamaican client?',
      lede: 'Pick what it is. The estimator opens with it selected, priced in USD from the same public list we use everywhere. We reply within 24 hours.',
    },
  },
};

export function getRegion(slug: RegionSlug): RegionConfig {
  return regions[slug];
}
