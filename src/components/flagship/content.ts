/**
 * Homepage copy and facts (flagship redesign, Nov 2026).
 *
 * Every number here is either published by MAPL TECH already (site.ts, the live
 * homepage) or computed from data in the repo; nothing is estimated. Sources are
 * cited inline. Copy rules: no em dashes, no hype verbs, one label per action.
 */
import { listedProjects, pricing, testimonials } from '@/config/site';
import { parsePriceLabel, type EstimateService } from '@/lib/estimate';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';

/** The one primary action, labelled the same everywhere (header, hero, bar, close). */
export const PRIMARY_CTA = { label: PROJECT_LABEL, href: PROJECT_HREF } as const;
export const SECONDARY_CTA = { label: 'See the work', href: '/our-work' } as const;

interface TitleRun {
  text: string;
  accent?: boolean;
}

/**
 * The hero keeps the live site's purpose and words: "The engineering backbone
 * behind agencies that refuse to cut corners." Broken into the four lines it
 * sets at desktop widths (phones let it wrap freely).
 */
export const HERO = {
  eyebrow: 'Systems · Automation · Infrastructure',
  titleLines: [
    [{ text: 'The ' }, { text: 'engineering', accent: true }],
    [{ text: 'backbone', accent: true }, { text: ' behind' }],
    [{ text: 'agencies that refuse' }],
    [{ text: 'to cut corners.' }],
  ] as readonly (readonly TitleRun[])[],
  lede: 'We partner with agencies to build, ship, and scale the systems, automation, and infrastructure their most ambitious projects demand.',
} as const;

/** Lowest public "from" price across the four service lines (site.ts `pricing`). */
function lowestFromPrice(): number {
  const labels = [
    ...pricing.webDevelopment.tiers,
    ...pricing.automation.tiers,
    ...pricing.internalTools.tiers,
    ...pricing.cloudEngineering.tiers,
  ].map((tier) => tier.price);
  const lows = labels.map((label) => parsePriceLabel(label).low).filter((n): n is number => typeof n === 'number');
  return Math.min(...lows);
}

export const LOWEST_PRICE = lowestFromPrice();

function money(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

/** Proof strip. Numbers as published on the live homepage (Projects Supported, Years Combined Experience). */
export const PROOF = {
  // Sizes keep each file's own aspect ratio (LRO 400x273, FOCAS 300x86, CHHA 184x192,
  // Loop and Crowned Spice square), optically balanced around a 34px height.
  logos: [
    { name: 'LRO Staffing', src: '/images/clients/lro-staffing.png', width: 50, height: 34, invert: true },
    { name: 'Loop', src: '/images/clients/loop.webp', width: 34, height: 34, invert: false },
    { name: 'FOCAS Canada', src: '/images/clients/focas-canada.png', width: 84, height: 24, invert: true },
    { name: 'CHHA-NCR', src: '/images/clients/chha-ncr.svg', width: 33, height: 34, invert: true },
    { name: 'Crowned Spice', src: '/images/clients/crowned-spice.png', width: 34, height: 34, invert: false },
  ],
  stats: [
    { value: 200, suffix: '+', label: 'projects supported' },
    { value: 25, suffix: '+', label: 'years of combined engineering experience' },
    { value: 3, suffix: '', label: 'offices: Toronto, Lagos, Kingston' },
  ],
} as const;

export interface Layer {
  id: string;
  service: EstimateService;
  name: string;
  /** Link text to the service page, cased by hand ("AI", not "ai"). */
  linkLabel: string;
  summary: string;
  deliverables: readonly string[];
  fromPrice: string;
  href: string;
  image: { src: string; alt: string; width: number; height: number } | null;
}

function from(label: string): string {
  const low = parsePriceLabel(label).low;
  return typeof low === 'number' ? `From ${money(low)}` : label;
}

export const LAYERS: readonly Layer[] = [
  {
    id: 'layer-web',
    service: 'web',
    name: 'Web Development',
    linkLabel: 'How we build websites',
    summary: 'Custom-coded and headless sites that load fast, rank, and pass an accessibility audit on launch day.',
    deliverables: ['Next.js or WordPress, chosen for the client', 'A CMS your client can edit without calling you', 'Core Web Vitals and WCAG AA as acceptance criteria'],
    fromPrice: from(pricing.webDevelopment.tiers[0].price),
    href: '/services/web-development',
    image: {
      src: '/images/case-lro-website.jpg',
      alt: 'The LRO Staffing homepage, built by MAPL TECH: a job search panel under the headline "Building Careers. Strengthening Organizations."',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'layer-automation',
    service: 'automation',
    name: 'Automation & AI',
    linkLabel: 'How we build automation and AI',
    summary: 'CRM workflows, AI intake and agents that take the manual work out of your client’s week.',
    deliverables: ['Lead routing, follow-ups and reporting on autopilot', 'AI agents with guardrails and an audit trail', 'Integrations with the tools the team already uses'],
    fromPrice: from(pricing.automation.tiers[0].price),
    href: '/services/automation-ai-workflow-setup',
    image: {
      src: '/images/case-mapl-tours.jpg',
      alt: 'MAPL Tours, the AI-run travel company MAPL TECH builds and operates: the homepage over aerial footage of the Jamaican coast.',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'layer-tools',
    service: 'tools',
    name: 'Custom Internal Tools',
    linkLabel: 'How we build internal tools',
    summary: 'Dashboards, client portals and ops systems built around how the team actually works.',
    deliverables: ['Role-based access from day one', 'Live data from the systems you already pay for', 'Software your team owns, not another subscription'],
    fromPrice: from(pricing.internalTools.tiers[0].price),
    href: '/services/custom-internal-tools',
    image: {
      src: '/images/case-lro.jpg',
      alt: 'The LRO Interactive Salary Guide, a filterable salary benchmarking tool MAPL TECH built for recruiters and hiring managers.',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'layer-cloud',
    service: 'cloud',
    name: 'Cloud Engineering',
    linkLabel: 'How we run cloud infrastructure',
    summary: 'Infrastructure as code, CI/CD, monitoring and migrations, so the thing you shipped stays up.',
    deliverables: ['AWS, Google Cloud or Azure, written as code', 'Pipelines that test every change before it ships', 'Monitoring that pages us before your client notices'],
    fromPrice: from(pricing.cloudEngineering.tiers[0].price),
    href: '/services/cloud-engineering',
    image: null,
  },
];

export interface WorkCard {
  slug: string;
  client: string;
  kind: string;
  outcome: string;
  metrics: readonly { value: string; label: string }[];
  image: { src: string; alt: string };
  href: string;
}

const listedSlugs = new Set(listedProjects().map((p) => p.slug));

/**
 * Sources: LRO Staffing metrics from the build (eight expertise hubs) and the
 * live-site Lighthouse result published on leshanpatterson.com; MAPL Tours
 * figures as published on leshanpatterson.com (Nov 2026); CHHA-NCR from the
 * independent August 2026 audit (site.ts `caseStudies`).
 */
export const WORK_INTRO = {
  title: 'Work we can show.',
  lede: 'Most of what we build ships under our partners’ names. These are the projects that carry ours.',
} as const;

export const WORK: readonly WorkCard[] = (
  [
    {
      slug: 'lro-staffing',
      client: 'LRO Staffing',
      kind: 'Website · Ottawa and Toronto',
      outcome: 'One website for two audiences: people looking for work and employers looking to hire.',
      metrics: [
        { value: '100', label: 'Lighthouse accessibility and SEO, mobile and desktop' },
        { value: '8', label: 'industry expertise hubs, one click from the menu' },
      ],
      image: { src: '/images/case-lro-website.jpg', alt: 'LRO Staffing homepage with its job search panel.' },
      href: '/our-work/lro-staffing',
    },
    {
      slug: 'mapl-tours',
      client: 'MAPL Tours',
      kind: 'Our own product · Jamaica',
      outcome: 'A travel company we built and run ourselves, with AI handling quoting, booking and follow-up.',
      metrics: [
        { value: '~50%', label: 'of customers now arrive through ChatGPT' },
        { value: '~2,000', label: 'automated tests run before every release' },
      ],
      image: { src: '/images/case-mapl-tours.jpg', alt: 'MAPL Tours homepage over aerial footage of the Jamaican coast.' },
      href: '/our-work/mapl-tours',
    },
    {
      slug: 'chha-ncr',
      client: 'CHHA-NCR',
      kind: 'Non-profit relaunch · Ottawa',
      outcome: 'A relaunch for people with hearing loss, most of them over 55, that volunteers can run themselves.',
      metrics: [
        { value: 'AA', label: 'WCAG contrast on every audited colour pair' },
        { value: '5', label: 'journey stages, from noticing to giving back' },
      ],
      image: { src: '/images/case-chha-ncr.jpg', alt: 'The CHHA-NCR homepage after the July 2026 relaunch.' },
      href: '/our-work/chha-ncr',
    },
  ] satisfies WorkCard[]
).filter((card) => listedSlugs.has(card.slug));

/** The one approved client quote (site.ts `testimonials`, LRO Staffing). */
export const SPOTLIGHT = testimonials.find((t) => t.company === 'LRO Staffing') ?? null;

export const FOUNDERS = {
  title: 'Two founders, three cities, your hours.',
  lede: 'Toronto is home base. Kingston works within an hour of Eastern time all year, and Lagos’s afternoon overlaps the Eastern morning, so your working day is covered by people who know your project.',
  people: [
    { name: 'Leshan Patterson', role: 'Co-founder and Director', image: '/images/team/leshan-patterson.jpg' },
    { name: 'Mercy Akuma', role: 'Co-founder and Director', image: '/images/team/mercy-akuma.jpg' },
  ],
} as const;

export const MOBILE_BAR_CONTEXT = `Public prices, from ${money(LOWEST_PRICE)}`;

/* ------------------------------------------------------------------ */
/* Award pass (Nov 2026): the live site's sections, restaged.           */
/* Copy is the live homepage's own unless noted.                       */
/* ------------------------------------------------------------------ */

/** Scroll-lit statement: the launch-week story, then the answer. */
export const STATEMENT = {
  label: 'Why agencies call us',
  runs: [
    { text: 'The site launches on time. Three weeks later the booking form breaks, and the developer has moved on. ' },
    { text: 'Your client doesn’t call the developer. They call you.', accent: true },
  ],
  // FAQ answers: documented code and a clean handoff; post-launch support on every plan.
  resolve: 'So we build it to last, document it so your team can own it, and stay after launch.',
} as const;

export const SERVICES_INTRO = {
  label: 'What we do',
  title: 'The technical work agencies can’t afford to get wrong.',
  lede: 'Systems, automation, and infrastructure, built by engineers who understand agency life.',
} as const;

/** The four service rows: names, summaries and links from LAYERS; previews are real work. */
export const SERVICE_PREVIEWS: Record<string, { src: string; width: number; height: number } | null> = {
  web: { src: '/images/cases/lro-desktop.jpg', width: 1800, height: 1125 },
  automation: { src: '/images/cases/tours-desktop.jpg', width: 1800, height: 1125 },
  tools: { src: '/images/cases/salary-desktop.jpg', width: 1800, height: 1125 },
  cloud: null,
};

export const WORK_SECTION = {
  label: 'Selected work',
  title: 'Selected projects and technical deliveries.',
  lede: WORK_INTRO.lede,
  all: { label: 'All client work', href: '/our-work' },
} as const;

/** The scroll reel: real captures of shipped, listed projects (public/images/cases). */
export const REEL = [
  ['lro-desktop', 'chha-mobile', 'salary-desktop'],
  ['tours-mobile', 'focas-desktop', 'lro-mobile'],
  ['chha-desktop', 'salary-mobile', 'tours-desktop'],
  ['focas-mobile', 'unsvcc-desktop', 'chha-mobile'],
] as const;

export const APPROACH = {
  label: 'How we work',
  title: 'We embed into your team.',
  lede: 'Most vendors hand off a deliverable and disappear. We join your Slack, attend your standups, and ship code like we sit in your office.',
  steps: [
    { title: 'Discover & Scope', text: 'We learn your agency, your clients, and your pain points.' },
    { title: 'Architect & Plan', text: 'We design systems around your workflow, not ours.' },
    { title: 'Build & Iterate', text: 'Transparent development with weekly check-ins.' },
    { title: 'Deploy & Support', text: 'Smooth launches with ongoing maintenance built in.' },
  ],
} as const;

export const PROOF_SECTION = {
  label: 'Why agencies choose us',
  title: 'The numbers speak. The work speaks louder.',
} as const;

export const CLOSE_BAND = {
  title: 'Have a build your clients are waiting on?',
  lede: 'Tell us what you are building. You get a fixed quote after a 20-minute scoping call.',
} as const;
