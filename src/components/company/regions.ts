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
 * Each fact is said once (Nov 2026 reviews), where a director looks for it:
 *
 * - The hero: the cities served (lede); the branch city, its live local time
 *   and when the office next opens, and the zone's name and UTC offset (the
 *   "you are here" card, their one home).
 * - The facts band under it: the office hours, the lowest public price and
 *   the reply time, added by the template (the same for every branch).
 * - What we build: who does the work (lede), each service's own starting
 *   price (rows), the local needs (list).
 * - The questions: the overlap with Toronto, worked out from the published
 *   hours and the real offsets (the hours question); payments; data rules;
 *   that prices are the same everywhere, in USD (no second price list).
 * - The close: the site's own lede (four questions, a 20-minute call, a
 *   fixed quote) and the client quote.
 *
 * So there is no separate hours section and no FAQ that repeats the team
 * sentence. The body's one link to the pricing page is in the cost answer,
 * where it names the page (the hero and the close have their own).
 */
import { PRICING_HREF } from '@/components/layout/chrome';
import { careers } from '@/config/site';
import type { Country } from '@/config/team';
import type { ServiceSlug } from '@/lib/schema';
import { formatMoney, parsePriceLabel, tiersFor, type EstimateService } from '@/lib/estimate';
import type { OfficeCity } from './OfficeMap';

export type RegionSlug = 'nigeria' | 'jamaica';

export interface RegionFaq {
  question: string;
  /** Plain text: the FAQPage JSON-LD carries it as written. */
  answer: string;
  /** Words in the answer that the page sets as a link (the JSON-LD keeps them plain). */
  link?: { text: string; href: string };
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
  /** The zone's standard abbreviation: the place readout's clock line before the clock hydrates ("WAT"). */
  zoneAbbr: string;
  /** Office city coordinates, for the place readout (public geographic fact). */
  coordinates: string;
  serves: readonly string[];
  hero: { titleLines: readonly [string, string]; lede: string };
  team: { heading: string; body: string; realitiesHeading: string; realities: readonly string[] };
  /** `heading` names the service list for assistive tech. */
  services: { heading: string; rows: readonly RegionServiceRow[] };
  /** A real local project; without one the section is left out and the close carries the client quote. */
  work?: RegionWork;
  faq: { heading: string; items: readonly RegionFaq[] };
  /** The close's title; its lede is the site's (CloseBand's default). */
  close: { title: string };
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

/**
 * The cost question's answer: what is regional about the price (nothing: the
 * same public prices, in USD). Each service's starting price is in its row
 * and the lowest is in the hero's facts, so the answer does not list them
 * again; the pricing page it names is a link.
 */
const COST_ANSWER = {
  answer: 'The same public prices as everywhere else, in USD. Every price table is on the pricing page.',
  link: { text: 'the pricing page', href: PRICING_HREF },
} as const;

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
    zoneAbbr: 'WAT',
    coordinates: '6.52° N, 3.38° E',
    serves: ['Lagos', 'Abuja', 'Port Harcourt'],
    hero: {
      titleLines: ['Engineering for', 'Nigerian agencies.'],
      lede: 'We work alongside agencies in Lagos, Abuja and Port Harcourt to build websites, automation, internal tools and cloud systems.',
    },
    team: {
      heading: 'What MAPL TECH Nigeria builds.',
      // Nov 5, 2026: one team member in Nigeria (Obong Uko), so no plural "engineers and project managers".
      body: 'We work with your team in Nigerian business hours, in your Slack and your weekly check-ins. Our Toronto headquarters and 25+ years of combined experience stand behind every project.',
      realitiesHeading: 'Built for local needs',
      realities: [
        'Phone-first sites that work on slow connections',
        'Paystack and Flutterwave payments',
        'More than one currency in portals and dashboards',
        'Nigeria’s data protection rules (the NDPA and NDPR) planned into every project',
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
    faq: {
      heading: 'Questions Nigerian agencies ask first.',
      items: [
        {
          question: 'Do you work in Nigerian business hours?',
          // Lagos keeps UTC+1 all year; Toronto is UTC-5 in winter and UTC-4 in summer. Both offices work 9 am to 6 pm local time.
          answer:
            'Yes. We keep Lagos office hours. Lagos is six hours ahead of Toronto in winter and five in summer, so both offices are open from 3 pm to 6 pm Lagos time in winter and from 2 pm to 6 pm in summer.',
        },
        {
          question: 'Can you integrate Paystack or Flutterwave?',
          answer:
            'Yes. Dashboards, client portals and reports can take local payments, including Paystack and Flutterwave, in more than one currency.',
        },
        {
          question: 'How do you handle the NDPA and NDPR?',
          answer:
            'We plan for Nigeria’s data protection rules, the NDPA and the NDPR, from the start of every Nigerian build. We also use the same engineering standards as our Toronto headquarters.',
        },
        {
          question: 'What does a project cost in Nigeria?',
          ...COST_ANSWER,
        },
      ],
    },
    close: {
      title: 'Building something for a Nigerian client?',
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
    zoneAbbr: 'EST',
    coordinates: '17.97° N, 76.79° W',
    serves: ['Kingston', 'Montego Bay'],
    hero: {
      titleLines: ['Engineering for', 'Jamaican agencies.'],
      lede: 'We work alongside agencies in Kingston and Montego Bay to build websites, automation, internal tools and cloud systems.',
    },
    team: {
      heading: 'What MAPL TECH Jamaica builds.',
      // Nov 5, 2026: Nigeria's line, so nothing is said about the size or roots of the Jamaica team.
      body: 'We work with your team in Jamaican business hours, in your Slack and your weekly check-ins. Our Toronto headquarters and 25+ years of combined experience stand behind every project.',
      realitiesHeading: 'Built for local needs',
      realities: [
        'Audiences who mostly browse on phones',
        'Caribbean payment providers',
        'Showing up in Caribbean search results (SEO)',
        'Sites that load fast on island internet connections',
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
          // Kingston keeps UTC-5 all year; Toronto is UTC-5 in winter and UTC-4 in summer. Both offices work 9 am to 6 pm local time.
          answer:
            'Yes. We keep Kingston office hours. Kingston is on the same time as Toronto in winter and one hour behind in summer, so both offices are open together all day in winter and from 9 am to 5 pm Kingston time in summer.',
        },
        {
          question: 'Do you build for Caribbean payment providers and island internet?',
          answer:
            'Yes. We build for audiences who mostly browse on phones, for local search and for island internet connections. Client portals, dashboards and reports connect to Caribbean payment providers and local business tools.',
        },
        {
          question: 'What does a project cost in Jamaica?',
          ...COST_ANSWER,
        },
        {
          question: 'How do you keep our team informed?',
          answer:
            'We check in with your team every week and write decisions down as we go. At the end, your team gets clear notes and code that you and your client own.',
        },
      ],
    },
    close: {
      title: 'Building something for a Jamaican client?',
    },
  },
};

export function getRegion(slug: RegionSlug): RegionConfig {
  return regions[slug];
}
