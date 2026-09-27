/**
 * Per-country configuration for the regional "market homepage" template
 * (`/nigeria`, `/jamaica`). Every string is existing copy from the current
 * nigeria/jamaica pages, `site.ts` or the pricing tables. Nothing is invented:
 * where a fact is not stated anywhere in the repo (local phone number,
 * WhatsApp line, invoicing currency, opening hours, FX rates) the field is
 * simply absent and listed in the build report.
 */
import type { Country } from '@/config/team';
import type { ServiceSlug } from '@/lib/schema';
import { ESTIMATE_SERVICES, SERVICE_META, formatMoney, parsePriceLabel, tiersFor, type EstimateService } from '@/lib/estimate';

export type RegionSlug = 'nigeria' | 'jamaica';

export interface RegionFact {
  term: string;
  detail: string;
}

export interface RegionCaseStudy {
  company: string;
  location: string;
  challenge: string;
  solution: string;
  results: string[];
}

export interface RegionFaq {
  question: string;
  answer: string;
}

export interface RegionServiceRow {
  slug: ServiceSlug;
  description: string;
}

export interface RegionConfig {
  slug: RegionSlug;
  path: string;
  country: Country;
  /** "MAPL TECH Nigeria" - the branch name used in H1, NAP and breadcrumb. */
  brandName: string;
  /** IANA zone of the branch office (matches TimezoneOverlap OFFICES). */
  timeZone: string;
  officeCity: string;
  h1: string;
  lede: string;
  /** Market-specific key facts. Starting price, timeline and "Last reviewed" are computed. */
  keyFacts: RegionFact[];
  overlap: { heading: string; body: string; footnote: string };
  team: { heading: string; body: string };
  caseStudy: RegionCaseStudy;
  services: { heading: string; intro: string; rows: RegionServiceRow[] };
  scoper: { defaultService: EstimateService };
  careers: { heading: string; linkLabel: string };
  faq: { heading: string; items: RegionFaq[] };
  nap: { branchLine: string; serves: string };
  cta: { heading: string; body: string };
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

function costAnswer(country: string): string {
  const list = ESTIMATE_SERVICES.map((service) => `${SERVICE_META[service].label} from ${startingFrom(service)}`).join(', ');
  return `The same tiers as everywhere else: ${list}. Every quote is fixed after a 20-min scoping call, and the full tier tables are on the pricing page.`.replace(
    'everywhere else',
    `everywhere else MAPL TECH works, priced in USD for ${country}`,
  );
}

/* ------------------------------------------------------------------ */
/* Regions                                                              */
/* ------------------------------------------------------------------ */

const REPLY_TIME = 'Within 24 hours';

export const regions: Record<RegionSlug, RegionConfig> = {
  nigeria: {
    slug: 'nigeria',
    path: '/nigeria',
    country: 'Nigeria',
    brandName: 'MAPL TECH Nigeria',
    timeZone: 'Africa/Lagos',
    officeCity: 'Lagos',
    h1: 'MAPL TECH Nigeria — engineering partner for agencies in Lagos and Abuja',
    lede:
      'From Lagos to Abuja to Port Harcourt, MAPL TECH Nigeria gives agencies the systems, automation and infrastructure they need to compete on a global stage — Canadian engineering standards, a team that works in West Africa Time, and the full depth of 25+ years of combined engineering experience behind every build.',
    keyFacts: [
      { term: 'Working hours', detail: 'West Africa Time (UTC+1) · 5–6 h ahead of Toronto HQ' },
      { term: 'Payments we integrate', detail: 'Paystack · Flutterwave · multi-currency support' },
      { term: 'Compliance', detail: 'NDPR compliance scoped into every build' },
      { term: 'Reply time', detail: REPLY_TIME },
    ],
    overlap: {
      heading: 'Real-time collaboration in West Africa Time.',
      body:
        'Our Nigeria team works in West Africa Time, ensuring real-time collaboration, quick turnarounds, and no overnight communication delays. Toronto HQ comes online every weekday afternoon in Lagos — the teal band is the shared window.',
      footnote: 'Lagos is 5 hours ahead of Toronto in summer and 6 in winter; Kingston sits within an hour of Toronto all year.',
    },
    team: {
      heading: 'Dedicated Nigeria branch',
      body:
        "MAPL TECH's Nigeria branch is staffed with engineers and project managers who live and work in Nigeria. They understand the local business landscape, infrastructure realities, and what it takes to build technology that works reliably in this market. Backed by our Canadian headquarters, the team has access to the full depth of MAPL TECH's 25+ years of combined engineering experience.",
    },
    caseStudy: {
      company: 'Crowngate Business Enterprises',
      location: 'Lagos, Nigeria',
      challenge:
        'Manual client onboarding process taking 3–5 business days with frequent data entry errors and lost documents.',
      solution:
        'Automated the entire onboarding pipeline — from intake form to CRM entry to document management — with AI-powered data extraction and validation.',
      results: [
        'Onboarding time reduced from 5 days to under 4 hours',
        '95% reduction in data entry errors',
        'Client satisfaction scores increased by 40%',
        'Freed up 20+ hours/week of staff time',
      ],
    },
    services: {
      heading: 'What we build for Nigerian agencies',
      intro: 'Every solution is tailored for local infrastructure, mobile-first audiences, and Nigerian payment ecosystems.',
      rows: [
        {
          slug: 'web-development',
          description:
            'Custom-coded sites optimized for Nigerian network conditions — fast load times, minimal data usage, and mobile-first design for a market where 80%+ of users browse on mobile.',
        },
        {
          slug: 'automation-ai-workflow-setup',
          description:
            'Automate lead capture, CRM routing, invoicing, and client onboarding. AI-powered workflows that handle repetitive tasks so your team can focus on high-value work.',
        },
        {
          slug: 'custom-internal-tools',
          description:
            'Dashboards, client portals, and reporting systems tailored for Nigerian agencies — with local payment integrations, multi-currency support, and offline-capable features.',
        },
        {
          slug: 'cloud-engineering',
          description: 'Cloud infrastructure, CI/CD pipelines, and monitoring systems for agency clients across Africa.',
        },
      ],
    },
    scoper: { defaultService: 'automation' },
    careers: { heading: 'Open roles in Nigeria', linkLabel: 'All roles in Lagos and Abuja' },
    faq: {
      heading: 'Questions Nigerian agencies ask first',
      items: [
        {
          question: 'Do you work in Nigerian business hours?',
          answer:
            'Yes. Our Nigeria team works in West Africa Time, ensuring real-time collaboration, quick turnarounds, and no overnight communication delays. Toronto HQ overlaps every weekday afternoon.',
        },
        {
          question: 'Can you integrate Paystack or Flutterwave?',
          answer:
            'Yes. We optimize for local realities — variable bandwidth, mobile-first audiences, Paystack/Flutterwave integrations, and NDPR compliance. Dashboards, client portals, and reporting systems ship with local payment integrations and multi-currency support.',
        },
        {
          question: 'Is the work NDPR compliant?',
          answer:
            'NDPR compliance is part of how we scope every Nigerian build, alongside the same engineering standards our Canadian headquarters applies.',
        },
        {
          question: 'Who actually does the work — Canada or Nigeria?',
          answer:
            "Engineers and project managers who live and work in Nigeria, backed by our Canadian headquarters and the full depth of MAPL TECH's 25+ years of combined engineering experience.",
        },
        {
          question: 'What does a project cost in Nigeria?',
          answer: costAnswer('Nigeria'),
        },
        {
          question: 'How quickly do you reply?',
          answer: "Within 24 hours, whether you're in Lagos, Abuja, Port Harcourt, or anywhere in Nigeria.",
        },
      ],
    },
    nap: { branchLine: 'Regional branch · Lagos, Nigeria', serves: 'Lagos · Abuja · Port Harcourt' },
    cta: {
      heading: 'Ready to build with MAPL TECH Nigeria?',
      body: "Tell us about your project. Whether you're in Lagos, Abuja, Port Harcourt, or anywhere in Nigeria — we'll respond within 24 hours.",
    },
  },

  jamaica: {
    slug: 'jamaica',
    path: '/jamaica',
    country: 'Jamaica',
    brandName: 'MAPL TECH Jamaica',
    timeZone: 'America/Jamaica',
    officeCity: 'Kingston',
    h1: 'MAPL TECH Jamaica — engineering partner for agencies in Kingston and Montego Bay',
    lede:
      'From Kingston to Montego Bay, MAPL TECH Jamaica gives agencies the systems, automation and infrastructure they need to compete regionally and globally — Canadian engineering standards, a team working in Eastern Standard Time within an hour of Toronto all year, and 25+ years of combined engineering experience behind every build.',
    keyFacts: [
      { term: 'Working hours', detail: 'Eastern Standard Time (UTC−5) · within 1 h of Toronto HQ all year' },
      { term: 'Built for', detail: 'Mobile-heavy audiences · Caribbean payment gateways · regional SEO' },
      { term: 'How we deliver', detail: 'Weekly project updates · documented decisions · clean handoffs' },
      { term: 'Reply time', detail: REPLY_TIME },
    ],
    overlap: {
      heading: 'Same-day collaboration, one time zone apart at most.',
      body:
        'Our Jamaica team works in Eastern Standard Time — within an hour of Toronto all year — so you get real-time collaboration, fast responses, and no overnight delays. The teal band shows how much of your working day has a MAPL TECH office open.',
      footnote: 'Kingston does not observe daylight saving, so it matches Toronto in winter and sits one hour behind in summer. Lagos is 5–6 hours ahead.',
    },
    team: {
      heading: 'Dedicated Jamaica branch',
      body:
        "MAPL TECH's Jamaica branch brings together engineers and project managers with deep Caribbean roots. We understand the local business culture, infrastructure landscape, and what it takes to deliver technology that works for this market. Backed by our Canadian headquarters with 25+ years of combined engineering experience, the team delivers international-grade systems built with a Caribbean perspective — from tourism tech to financial services to creative agency workflows.",
    },
    caseStudy: {
      company: 'Caribbean Digital Agency',
      location: 'Kingston, Jamaica',
      challenge:
        'Outdated WordPress sites for multiple clients running on slow shared hosting, resulting in poor page speeds and high bounce rates across the Caribbean market.',
      solution:
        "Rebuilt the agency's client portfolio on custom-coded, performance-optimized architecture with CDN distribution, mobile-first design, and automated deployment pipelines.",
      results: [
        'Average page load time reduced from 8s to under 2s',
        'Mobile bounce rate decreased by 55%',
        'Client satisfaction scores improved across the board',
        'Agency won 3 new retainer clients within 90 days of launch',
      ],
    },
    services: {
      heading: 'What we build for Jamaican agencies',
      intro: 'Solutions tailored for Caribbean audiences, local infrastructure, and island connectivity.',
      rows: [
        {
          slug: 'web-development',
          description:
            'Custom-coded sites built for Caribbean audiences — fast load times optimized for local network conditions, mobile-first design, and SEO tailored for regional search.',
        },
        {
          slug: 'automation-ai-workflow-setup',
          description:
            'Eliminate manual processes across your agency. Automated CRM pipelines, AI-powered client intake, and smart workflows that connect every tool your team uses.',
        },
        {
          slug: 'custom-internal-tools',
          description:
            'Client portals, project dashboards, and reporting systems designed for Caribbean agencies — with integrations for local payment providers and business tools.',
        },
        {
          slug: 'cloud-engineering',
          description:
            'Scalable cloud infrastructure designed, deployed, and managed for agencies. CI/CD pipelines, IaC, monitoring, and security.',
        },
      ],
    },
    scoper: { defaultService: 'web' },
    careers: { heading: 'Open roles in Jamaica', linkLabel: 'All roles in Kingston and Montego Bay' },
    faq: {
      heading: 'Questions Caribbean agencies ask first',
      items: [
        {
          question: 'Do you work in Jamaican business hours?',
          answer:
            'Yes. Our Jamaica team works in Eastern Standard Time — within an hour of Toronto all year — so you get real-time collaboration, fast responses, and no overnight delays.',
        },
        {
          question: 'Do you build for Caribbean payment gateways and island connectivity?',
          answer:
            'Yes. We build for local realities — mobile-heavy audiences, Caribbean payment gateways, regional SEO, and performance optimization for island connectivity. Client portals, project dashboards, and reporting systems ship with integrations for local payment providers and business tools.',
        },
        {
          question: 'Who actually does the work — Canada or Jamaica?',
          answer:
            "Engineers and project managers with deep Caribbean roots, backed by our Canadian headquarters and MAPL TECH's 25+ years of combined engineering experience.",
        },
        {
          question: 'What does a project cost in Jamaica?',
          answer: costAnswer('Jamaica'),
        },
        {
          question: 'How do you keep our team informed?',
          answer:
            'Weekly project updates, documented decisions, and clean handoffs. We communicate clearly so your team always knows where things stand.',
        },
        {
          question: 'How quickly do you reply?',
          answer: "Within 24 hours, whether you're in Kingston, Montego Bay, or anywhere in Jamaica.",
        },
      ],
    },
    nap: { branchLine: 'Regional branch · Kingston, Jamaica', serves: 'Kingston · Montego Bay' },
    cta: {
      heading: 'Ready to build with MAPL TECH Jamaica?',
      body: "Tell us about your project. Whether you're in Kingston, Montego Bay, or anywhere in Jamaica — we'll respond within 24 hours.",
    },
  },
};

export function getRegion(slug: RegionSlug): RegionConfig {
  return regions[slug];
}
