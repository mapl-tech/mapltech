/**
 * Per-country data for the regional funnels (`/nigeria`, `/jamaica`), Nov 5
 * 2026 (Leshan: "the nigeria and jamaica pages should act as funnels and
 * speak to the markets").
 *
 * Each page runs one path to "Start a project", in the order a buyer from
 * that market asks: is this for me (the hero: the market in the H1, the
 * cities in the lede, the public price floor, the fixed quote and the reply
 * time under the ask, the office's live clock beside it), why you (four local
 * reasons), can I trust you (proof), what does it cost (the four services,
 * each with its own price and its own ask), what about... (the questions),
 * then the close. Hiring and the facts band were taken out: the first is for
 * another reader (the footer links /careers), the second only repeated the
 * hero's price and reply time; the office hours moved into the office card.
 *
 * Sources, so every sentence can be checked:
 * - MAPL TECH facts: prices from `pricing` (startingFrom, LOWEST_PRICE); the
 *   reply time from /contact-us; the fixed quote, the 20-minute call, Slack
 *   and the weekly check-ins, and "your client only hears from your team"
 *   from the homepage (flagship/content.ts APPROACH); office hours from
 *   ui/officeTime; proof from flagship/content.ts (PROOF, WORK) and
 *   case/stories.ts (MAPL Tours), read from those files, never retyped.
 * - Earlier regional copy kept as it was: Paystack and Flutterwave, more
 *   than one currency, Caribbean payment providers and local business tools,
 *   island internet, local search, the hours overlap with Toronto.
 * - Market statements, checked Nov 5, 2026 (the build report lists the
 *   sources): most web traffic in Nigeria comes from phones (StatCounter,
 *   Oct 2026: 77.5% mobile); data prices and signal vary (the NCC's January
 *   2025 tariff review); the NDPA 2023 is Nigeria's data protection law and
 *   the NDPC's GAID (in force since 19 September 2025) took the place of the
 *   NDPR; all of Nigeria keeps West Africa Time and Jamaica keeps UTC-5, and
 *   neither observes daylight saving.
 * - Not said on purpose: that Jamaicans mostly browse on phones (StatCounter,
 *   Oct 2026, shows desktop ahead in Jamaica, so the earlier line went), any
 *   Nigerian client (none is published), the size of either local team, NDAs
 *   and "we never approach your clients" (Leshan: common practice).
 */
import { PRICING_HREF } from '@/components/layout/chrome';
import { LOWEST_PRICE } from '@/components/flagship/content';
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

/** One local reason: a short title and one or two plain sentences. */
export interface RegionReason {
  title: string;
  text: string;
}

/** A published case, by its slug in flagship/content.ts WORK, and which of its metrics to show. */
export interface RegionCaseRef {
  slug: string;
  metric?: number;
}

/** A real local project, shown large; its results are read from case/stories.ts by `slug`. */
export interface RegionWork {
  slug: string;
  client: string;
  text: string;
  href: string;
  /** The live site's address, shown in the browser frame. */
  url: string;
  image: { src: string; alt: string; width: number; height: number };
  /** The same site's phone capture (public/images/cases, 780x1688). */
  mobile?: string;
}

export interface RegionProof {
  label: string;
  title: string;
  lede: string;
  /** A local project of our own, set large (Jamaica: MAPL Tours). */
  feature?: RegionWork;
  /** The homepage's published counts (flagship/content.ts PROOF). */
  stats?: boolean;
  /** Published cases as a short ledger of results, each linked to its study. */
  cases?: { heading: string; items: readonly RegionCaseRef[] };
}

export interface RegionConfig {
  slug: RegionSlug;
  path: string;
  country: Country;
  /** "MAPL TECH Nigeria": breadcrumb, JSON-LD names, the team directory's link. */
  brandName: string;
  /** IANA zone of the branch office (read by ui/officeTime). */
  timeZone: string;
  officeCity: OfficeCity;
  /** Plain-language zone name and its fixed UTC offset (neither country observes daylight saving). */
  zoneName: string;
  utcLabel: string;
  /** The zone's standard abbreviation: the office card's clock line before the clock hydrates ("WAT"). */
  zoneAbbr: string;
  hero: {
    /** The H1: a plain run, then the accent run that names the market. */
    titleLines: readonly [string, string];
    lede: string;
    /** The quiet second action: a jump to this page's own proof or prices, so the visitor stays on the path. */
    secondary: { label: string; href: `#${string}` };
  };
  reasons: { label: string; title: string; lede: string; items: readonly RegionReason[] };
  proof: RegionProof;
  /** `heading` names the service list for assistive tech. */
  services: { label: string; title: string; lede: string; heading: string; rows: readonly RegionServiceRow[] };
  faq: { label: string; heading: string; items: readonly RegionFaq[] };
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

/** Published on /contact-us ("We respond within 24 hours"). */
export const REPLY_TIME = 'Within 24 hours';

/**
 * Under the hero's ask, in the order the doubts come: what it costs (the
 * public floor, in US dollars, so "$" is never read as naira or Jamaican
 * dollars), how the price is set, and how soon we answer. TrustList adds the
 * Google rating as the last line. Display only ("20‑minute" keeps its
 * non-breaking hyphen).
 */
export const HERO_TRUST = [
  `Projects from ${formatMoney(LOWEST_PRICE)} USD`,
  'Fixed quote after one 20‑minute call',
  `A reply ${REPLY_TIME.toLowerCase()}`,
] as const;

/** The cost question: what is regional about the price (nothing: the same public prices, in US dollars). */
const COST_ANSWER = {
  answer:
    'The same public prices as everywhere else, in US dollars. Each service’s starting price is on this page, and every price table is on the pricing page.',
  link: { text: 'the pricing page', href: PRICING_HREF },
} as const;

/** The homepage's four steps (flagship/content.ts APPROACH), as the answer to "what now". */
const NEXT_STEPS: RegionFaq = {
  question: 'What happens after I click “Start a project”?',
  answer:
    'You answer four short questions. We reply within 24 hours, then we talk for 20 minutes. We agree the scope with you and send one fixed price.',
};

/** Who the page is for: agencies (under their brand) and the businesses that buy directly. */
const WHO_WE_WORK_WITH: RegionFaq = {
  question: 'Do you work with businesses, or only agencies?',
  answer:
    'Both. Agencies bring us in to build under their own brand, and their client only hears from them. Businesses can also work with us directly.',
};

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
    hero: {
      titleLines: ['Websites and software', 'built for Nigeria.'],
      lede: 'We work with agencies and businesses in Lagos, Abuja and across Nigeria. We build websites, automation, internal tools and cloud systems that stay fast on mobile data.',
      secondary: { label: 'See prices', href: '#prices' },
    },
    reasons: {
      label: 'Built for Nigeria',
      title: 'Four things we plan for in Nigeria.',
      lede: 'What changes when you build for Nigeria, and what we do about it.',
      items: [
        {
          title: 'Light pages for mobile data',
          text: 'Most web visits in Nigeria come from phones, and data costs and signal strength vary. We keep pages light, so they open fast and use little data.',
        },
        {
          title: 'Nigeria’s data law, planned in',
          text: 'The Nigeria Data Protection Act (NDPA) covers the personal data your sites and tools collect. We plan for it from the start of every build.',
        },
        {
          title: 'Paystack and Flutterwave',
          text: 'Dashboards, client portals and reports can take local payments, including Paystack and Flutterwave, in more than one currency.',
        },
        {
          title: 'An office on West Africa Time',
          text: 'Our Lagos office is open 9 am to 6 pm, Monday to Friday, on the same clock as the rest of Nigeria. We join your Slack and your weekly check-ins.',
        },
      ],
    },
    // No Nigerian case study is published, so the proof is the site's own: the counts and the published results.
    proof: {
      label: 'Our track record',
      title: 'Proof you can check.',
      lede: 'Most of what we build carries our partners’ brands. Here is the work we can show, with its published results.',
      stats: true,
      cases: {
        heading: 'Published results',
        items: [
          { slug: 'lro-staffing' },
          // Its second metric: the currencies, the local need the reasons name.
          { slug: 'dodo-island-discoveries', metric: 1 },
          { slug: 'mapl-tours' },
          { slug: 'chha-ncr' },
        ],
      },
    },
    services: {
      label: 'Public prices',
      title: 'What a project costs.',
      lede: 'Four services, each with a public starting price in US dollars. Start with one, and the brief opens with it already chosen.',
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
      label: 'Before you start',
      heading: 'Questions we hear from Nigeria.',
      items: [
        WHO_WE_WORK_WITH,
        {
          question: 'Do you work in Nigerian business hours?',
          // Lagos keeps UTC+1 all year; Toronto is UTC-5 in winter and UTC-4 in summer. Both offices work 9 am to 6 pm local time.
          answer:
            'Yes. We keep Lagos office hours. Lagos is six hours ahead of Toronto in winter and five in summer, so both offices are open from 3 pm to 6 pm Lagos time in winter and from 2 pm to 6 pm in summer.',
        },
        {
          question: 'How do you handle the NDPA and the NDPR?',
          // The GAID came into force on 19 September 2025 and took the place of the NDPR (Babalakin & Co., Mondaq, KPMG Nigeria).
          answer:
            'We plan for Nigeria’s data protection rules from the start of every Nigerian build. Today those rules are the Nigeria Data Protection Act 2023 (NDPA) and the 2025 directive the NDPC issued under it (the GAID), which took the place of the older NDPR.',
        },
        { question: 'What does a project cost in Nigeria?', ...COST_ANSWER },
        NEXT_STEPS,
      ],
    },
    close: {
      title: 'Let’s build your next Nigerian project together.',
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
    hero: {
      titleLines: ['Websites and booking systems', 'built for Jamaica.'],
      // The case study's own figure ("~50% of customers now arrive through ChatGPT"), beside the first ask.
      lede: 'We work with agencies and with tourism, hospitality and service businesses in Kingston, Montego Bay and across the island. We also run MAPL Tours, our own Jamaica travel company, where ~50% of customers now arrive through ChatGPT.',
      secondary: { label: 'See MAPL Tours', href: '#work' },
    },
    reasons: {
      label: 'Built for Jamaica',
      title: 'Four things we plan for in Jamaica.',
      lede: 'What changes when you build for Jamaica, and what we do about it.',
      items: [
        {
          title: 'Found in search and AI answers',
          // The MAPL Tours figure is in the hero lede and the proof card, so it is not said a third time here.
          text: 'We build sites that show up in local search, and that AI assistants like ChatGPT can read and recommend to the people asking them.',
        },
        {
          title: 'Bookings and payments',
          text: 'Guests can book and pay on your site. Client portals, dashboards and reports connect to Caribbean payment providers and local business tools.',
        },
        {
          title: 'Fast on island connections',
          text: 'We build for phones first and keep every page light, so it loads fast on island internet connections.',
        },
        {
          title: 'An office on Jamaica time',
          text: 'Our Kingston office is open 9 am to 6 pm, Monday to Friday. We join your Slack and your weekly check-ins.',
        },
      ],
    },
    proof: {
      label: 'Our own product, in Jamaica',
      title: 'Work we run in Jamaica.',
      lede: 'Most of what we build ships under our partners’ names. This one carries ours.',
      feature: {
        slug: 'mapl-tours',
        client: 'MAPL Tours',
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
      cases: {
        heading: 'More travel work',
        items: [{ slug: 'dodo-island-discoveries' }],
      },
    },
    services: {
      label: 'Public prices',
      title: 'What a project costs.',
      lede: 'Four services, each with a public starting price in US dollars. Start with one, and the brief opens with it already chosen.',
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
          description: 'Automated CRM updates, AI help with new enquiries, and workflows that connect the tools your team already uses.',
        },
        {
          slug: 'custom-internal-tools',
          service: 'tools',
          description: 'Client portals, booking dashboards and reports that connect to local payment providers and business tools.',
        },
        {
          slug: 'cloud-engineering',
          service: 'cloud',
          description: 'Cloud hosting designed, set up and managed for agencies, with monitoring, security and every update tested before it goes live.',
        },
      ],
    },
    faq: {
      label: 'Before you start',
      heading: 'Questions we hear from Jamaica.',
      items: [
        WHO_WE_WORK_WITH,
        {
          question: 'Do you work in Jamaican business hours?',
          // Kingston keeps UTC-5 all year; Toronto is UTC-5 in winter and UTC-4 in summer. Both offices work 9 am to 6 pm local time.
          answer:
            'Yes. We keep Kingston office hours. Kingston is on the same time as Toronto in winter and one hour behind in summer, so both offices are open together all day in winter and from 9 am to 5 pm Kingston time in summer.',
        },
        {
          question: 'Can you build a booking site like MAPL Tours?',
          // What the site does, in the case study's words (stories.ts situation).
          answer:
            'Yes. We built MAPL Tours and we still run it. It handles video browsing, live quotes, payments, driver dispatch and customer emails, and it takes real payments. We build the parts your project needs.',
        },
        { question: 'What does a project cost in Jamaica?', ...COST_ANSWER },
        NEXT_STEPS,
      ],
    },
    close: {
      title: 'Let’s build your next Jamaican project together.',
    },
  },
};

export function getRegion(slug: RegionSlug): RegionConfig {
  return regions[slug];
}
