/**
 * Case-study stories (flagship redesign). The structure follows how the best
 * agency case studies sell to the *next* buyer: one-line outcome, facts,
 * results, the situation, what we built (in stages), what changed, the client
 * in their words, why it matters to you, then your project in the empty slot.
 *
 * Sourcing rule: every sentence is either in the project's own copy
 * (site.ts portfolioProjects / caseStudies / testimonials), published by MAPL
 * TECH's founders (leshanpatterson.com, Nov 2026), or a statement of how MAPL
 * TECH works. Nothing is estimated. A section without sourced content is
 * omitted by the template, never padded.
 */
import { caseStudies, testimonials } from '@/config/site';

export interface CaseFact {
  term: string;
  detail: string;
  href?: string;
}

export interface CaseResult {
  value: string;
  label: string;
}

export interface CaseStage {
  name: string;
  text: string;
}

export interface CaseStory {
  slug: string;
  client: string;
  /** Full organisation name, when it differs from `client`. */
  legalName?: string;
  /** Short tags under the breadcrumb, e.g. ["Website", "Staffing", "Ottawa and Toronto"]. */
  tags: readonly string[];
  /** The one-line outcome under the H1. */
  headline: string;
  facts: readonly CaseFact[];
  results?: readonly CaseResult[];
  situation?: readonly string[];
  built?: { intro?: string; stages: readonly CaseStage[] };
  impact?: readonly { heading: string; items: readonly string[] }[];
  quote?: { text: string; name: string; role: string; image?: string };
  matters?: { heading: string; text: string };
  /** Footnote naming where the numbers come from. */
  sources?: string;
  /** Real screenshots of the live product (captured Nov 2026). */
  media?: { desktop: string; mobile?: string; alt: string; caption?: string };
}

const alita = testimonials.find((t) => t.company === 'LRO Staffing');
const chhaAudit = testimonials.find((t) => t.company === 'CHHA-NCR relaunch');
const chha = caseStudies.find((c) => c.slug === 'chha-ncr');

export const STORIES: readonly CaseStory[] = [
  {
    slug: 'lro-staffing',
    client: 'LRO Staffing',
    tags: ['Website', 'Staffing and recruitment', 'Ottawa and Toronto'],
    headline:
      'A full-service staffing agency’s website, rebuilt around its two audiences: people looking for their next role and employers looking to hire.',
    facts: [
      { term: 'Client', detail: 'LRO Staffing, full-service search and staffing' },
      { term: 'Where', detail: 'Ottawa and Toronto' },
      { term: 'What we built', detail: 'The complete website' },
      { term: 'Stack', detail: 'WordPress, custom theme, PHP' },
      { term: 'Live', detail: 'lrostaffing.com', href: 'https://www.lrostaffing.com/' },
    ],
    results: [
      { value: '100', label: 'Lighthouse accessibility, on mobile and desktop' },
      { value: '100', label: 'Lighthouse SEO, on mobile and desktop' },
      { value: '8', label: 'industry expertise hubs, one click from the menu' },
    ],
    situation: [
      'LRO Staffing places people across Ottawa and Toronto. Its website has two very different visitors: someone looking for their next role, and an employer trying to fill one.',
      'Both had to find their path from the first screen, and the agency’s depth (industry expertise, recruitment insight, salary data) had to be one click away rather than buried in a footer.',
    ],
    built: {
      intro: 'One build, organised around the two journeys, with every component written for this brand.',
      stages: [
        { name: 'Foundation', text: 'A custom WordPress theme built specifically for the LRO Staffing brand.' },
        { name: 'Find', text: 'Job search with keyword, industry, location and job type filters.' },
        { name: 'Apply', text: 'Job alerts and resume submission, so a visit can end in an application.' },
        { name: 'Expertise', text: 'Eight industry expertise hubs, from technology and government to legal services and finance.' },
        { name: 'Insight', text: 'A recruitment insights blog and an interactive salary guide for the Ottawa and Toronto markets.' },
        { name: 'Access', text: 'Keyboard-accessible components with proper ARIA states, such as the “How We Work With You” accordion.' },
      ],
    },
    impact: [
      {
        heading: 'What the build delivers',
        items: [
          'Job seekers and employers each one click from the main navigation',
          'A perfect Lighthouse score for accessibility and SEO, on mobile and desktop',
          'Job search, alerts and resume submission in one flow',
        ],
      },
      {
        heading: 'What LRO Staffing owns',
        items: ['A custom theme, not a rented page-builder template', 'Eight expertise hubs and an insights blog the team publishes to', 'An interactive salary guide for its two markets'],
      },
    ],
    quote: alita ? { text: alita.quote, name: alita.name, role: `${alita.role}, ${alita.company}`, image: alita.image || undefined } : undefined,
    matters: {
      heading: 'Why this matters if your agency sells websites',
      text: 'Two-audience sites are where builds usually go wrong: one audience gets the homepage and the other gets a footer link. We plan the information architecture with you before anything is designed, then build to pass the same audits your client will run after launch.',
    },
    sources: 'Lighthouse results for lrostaffing.com as published on leshanpatterson.com (November 2026). Client quote approved for publication.',
    media: {
      desktop: '/images/cases/lro-desktop.jpg',
      mobile: '/images/cases/lro-mobile.jpg',
      alt: 'The LRO Staffing homepage: “Building Careers. Strengthening Organizations.” above a job search panel.',
    },
  },
  {
    slug: 'mapl-tours',
    client: 'MAPL Tours',
    tags: ['Our own product', 'Travel', 'Jamaica'],
    headline: 'A travel company we built and run ourselves, to find out how far AI-built software can go in production.',
    facts: [
      { term: 'Owner', detail: 'MAPL TECH (MAPL Labs)' },
      { term: 'What it does', detail: 'Private airport transfers and tours in Jamaica' },
      { term: 'Stack', detail: 'Next.js, MCP and WebMCP tools, CI/CD' },
      { term: 'Status', detail: 'Live, taking real payments' },
      { term: 'Live', detail: 'mapltours.com', href: 'https://mapltours.com/' },
    ],
    results: [
      { value: '~50%', label: 'of customers now arrive through ChatGPT' },
      { value: '~2,000', label: 'automated tests run before any change reaches production' },
      { value: 'Live', label: 'real payments, for rides run by a licensed transportation provider' },
    ],
    situation: [
      'Agencies ask us whether AI-built software is ready for production. We answer with a business.',
      'MAPL Tours sells private airport transfers and tours in Jamaica: video-first discovery, live quoting, payments, dispatch and lifecycle email. It is not a demo. It takes real payments for rides operated by a licensed transportation provider, so every failure mode is a real one.',
    ],
    built: {
      intro: 'Agents do much of the implementation. The engineering is in what they are allowed to do.',
      stages: [
        { name: 'Specification', text: 'A project specification every agent reads before making changes, plus persistent decision memory.' },
        { name: 'Tests', text: 'Nearly 2,000 tests running through a CI/CD pipeline before changes reach production.' },
        { name: 'Review', text: 'Adversarial review: specialist agents critique each change and a skeptic agent tries to disprove the findings.' },
        { name: 'Money', text: 'Hard financial guardrails: server-side pricing, idempotent payments and isolated test traffic.' },
        { name: 'AI-native', text: 'MCP and WebMCP tools that let AI assistants query real fares and hand travellers a ready-to-book link.' },
      ],
    },
    impact: [
      {
        heading: 'What it proves',
        items: [
          'Roughly half of customers now arrive through ChatGPT',
          'AI-assisted delivery can carry real money when the guardrails are engineered, not hoped for',
          'Software that AI assistants can query directly gets recommended by them',
        ],
      },
    ],
    matters: {
      heading: 'Why this matters if your clients ask about AI',
      text: 'Your clients are already being found, or missed, by AI assistants. We build sites and tools those assistants can read, query and recommend, because we run a business that depends on it.',
    },
    sources: 'Figures as published by MAPL TECH’s co-founder on leshanpatterson.com (November 2026).',
    media: {
      desktop: '/images/cases/tours-desktop.jpg',
      mobile: '/images/cases/tours-mobile.jpg',
      alt: 'The MAPL Tours homepage: “Discover Jamaica beyond the resort.” over aerial footage of the coast.',
    },
  },
  {
    slug: 'chha-ncr',
    client: 'CHHA-NCR',
    legalName: chha?.client ?? 'Canadian Hard of Hearing Association, National Capital Region',
    tags: ['Website relaunch', 'Non-profit', 'Ottawa'],
    headline: 'A relaunch for people with hearing loss, most of them over 55, built so the charity’s own volunteers can run it.',
    facts: [
      { term: 'Client', detail: chha?.client ?? 'CHHA-NCR' },
      { term: 'Sector', detail: chha?.industry ?? 'Non-profit / accessibility' },
      { term: 'Stack', detail: (chha?.stack ?? []).join(', ') },
      { term: 'Relaunched', detail: chha?.delivered ?? 'July 2026' },
      { term: 'Live', detail: 'chhancr.ca', href: 'https://www.chhancr.ca/' },
    ],
    results: [
      { value: 'AA', label: 'WCAG contrast on every audited colour pair' },
      { value: '5', label: 'journey stages: Noticing, Finding Out, Choosing, Living with it, Giving back' },
    ],
    situation: chha ? [chha.challenge] : undefined,
    built: chha
      ? {
          intro: 'Accessibility engineered in from the first component, not bolted on at the end.',
          stages: chha.solution.map((text, i) => ({
            name: ['Journey', 'Accessibility', 'Directory', 'Self-service'][i] ?? `Stage ${i + 1}`,
            text,
          })),
        }
      : undefined,
    impact: chha ? [{ heading: 'What the independent audit found', items: chha.results }] : undefined,
    quote: chhaAudit ? { text: chhaAudit.quote, name: chhaAudit.name, role: chhaAudit.role } : undefined,
    matters: {
      heading: 'Why this matters if you build for public-sector and non-profit clients',
      text: 'For these clients accessibility is a requirement and the audit is coming. We engineer WCAG AA in from the first component and hand over a site the client’s own team can maintain without calling an agency.',
    },
    sources: chha?.sourceNote,
    media: {
      desktop: '/images/cases/chha-desktop.jpg',
      mobile: '/images/cases/chha-mobile.jpg',
      alt: 'The CHHA-NCR homepage after the July 2026 relaunch.',
    },
  },
  {
    slug: 'lro-salary-guide',
    client: 'LRO Interactive Salary Guide',
    tags: ['Custom internal tool', 'Staffing and recruitment', 'Ottawa and Toronto'],
    headline: 'An interactive salary guide that turns market data into a benchmarking tool for recruiters and hiring managers.',
    facts: [
      { term: 'Client', detail: 'LRO Staffing' },
      { term: 'Type', detail: 'Interactive tool' },
      { term: 'Year', detail: '2026 edition' },
      {
        term: 'Live',
        detail: 'lrostaffing.com/lro-salary-guide',
        href: 'https://www.lrostaffing.com/lro-salary-guide/2026-interactive-salary-guide/',
      },
    ],
    built: {
      stages: [
        { name: 'Filter', text: 'Dynamic filtering across roles and markets.' },
        { name: 'See', text: 'Real-time data visualisation that redraws as the filters change.' },
        { name: 'Benchmark', text: 'Role-based salary benchmarking for recruiters and hiring managers.' },
      ],
    },
    matters: {
      heading: 'Why this matters if your client publishes data',
      text: 'A PDF report gets downloaded once. A tool gets bookmarked. We turn the data your client already has into something their audience comes back to.',
    },
    media: {
      desktop: '/images/cases/salary-desktop.jpg',
      mobile: '/images/cases/salary-mobile.jpg',
      alt: 'The LRO 2026 Interactive Salary Guide with its filters and charts.',
    },
  },
  {
    slug: 'focas-canada',
    client: 'FOCAS Canada',
    tags: ['Web platform', 'Membership and events'],
    headline: 'An event-driven web platform with a member portal, registration workflows and community tools.',
    facts: [
      { term: 'Client', detail: 'FOCAS Canada' },
      { term: 'Stack', detail: 'WordPress' },
      { term: 'Live', detail: 'focascanada.org', href: 'https://focascanada.org/' },
    ],
    built: {
      stages: [
        { name: 'Members', text: 'A member portal.' },
        { name: 'Events', text: 'Registration workflows for events.' },
        { name: 'Community', text: 'Community engagement tools.' },
      ],
    },
    matters: {
      heading: 'Why this matters if your client runs a membership',
      text: 'Membership sites fail at the seams between the website, the registration system and the inbox. We build those seams as one system, so the client’s team stops copying data between tools.',
    },
    media: {
      desktop: '/images/cases/focas-desktop.jpg',
      mobile: '/images/cases/focas-mobile.jpg',
      alt: 'The FOCAS Canada homepage.',
    },
  },
  {
    slug: 'unsvcc',
    client: 'UNSVCC',
    legalName: 'United Senior Citizen Voice for Change Coalition',
    tags: ['Internal tools', 'Non-profit', 'Canada'],
    headline:
      'An internal operations dashboard for a Canadian seniors’ advocacy coalition: real-time organisational metrics, role-based access and automated reporting.',
    facts: [
      { term: 'Client', detail: 'United Senior Citizen Voice for Change Coalition' },
      { term: 'What we built', detail: 'Internal operations dashboard' },
      { term: 'Public site', detail: 'unsvcc.org', href: 'https://www.unsvcc.org/' },
    ],
    built: {
      stages: [
        { name: 'Metrics', text: 'Real-time organisational metrics in one place.' },
        { name: 'Access', text: 'Role-based access, so each person sees what their role needs.' },
        { name: 'Reports', text: 'Automated reporting instead of manual spreadsheets.' },
      ],
    },
    matters: {
      heading: 'Why this matters if your client runs on spreadsheets',
      text: 'Every organisation has a weekly report someone builds by hand. We replace it with a dashboard that is already up to date when the meeting starts.',
    },
    media: {
      desktop: '/images/cases/unsvcc-desktop.jpg',
      mobile: '/images/cases/unsvcc-mobile.jpg',
      alt: 'The UNSVCC public website: “United Senior Citizen Voice for Change Coalition”.',
      caption: 'The coalition’s public site. The dashboard itself is internal and stays private.',
    },
  },
  {
    slug: 'crowned-spice',
    client: 'Crowned Spice',
    tags: ['Automation', 'E-commerce'],
    headline: 'End-to-end e-commerce automation: inventory syncing, shipping triggers and post-purchase communication.',
    facts: [
      { term: 'Client', detail: 'Crowned Spice' },
      { term: 'Type', detail: 'E-commerce automation' },
    ],
    built: {
      stages: [
        { name: 'Inventory', text: 'Inventory that stays in sync across channels.' },
        { name: 'Shipping', text: 'Shipping triggered automatically when an order is ready.' },
        { name: 'After the sale', text: 'Post-purchase communication flows.' },
      ],
    },
    matters: {
      heading: 'Why this matters if your client sells online',
      text: 'The storefront is the easy part. The hours go into everything after the click. We automate the order lifecycle so the client’s team handles exceptions, not every order.',
    },
  },
];

export function findStory(slug: string): CaseStory | undefined {
  return STORIES.find((story) => story.slug === slug);
}
