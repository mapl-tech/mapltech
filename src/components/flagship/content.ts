/**
 * Homepage copy and facts (flagship redesign, Nov 2026).
 *
 * Every number here is either published by MAPL TECH already (site.ts, the live
 * homepage) or computed from data in the repo; nothing is estimated. Sources are
 * cited inline. Copy rules: no em dashes, no hype verbs, one label per action.
 */
import { listedProjects, pricing, testimonials } from '@/config/site';
import { estimateHref, parsePriceLabel, type EstimateService } from '@/lib/estimate';

/** The one primary action, labelled the same everywhere (header, hero, bar, close). */
export const PRIMARY_CTA = { label: 'Price your project', href: estimateHref(null) } as const;
export const SECONDARY_CTA = { label: 'See the work', href: '/our-work' } as const;

export const HERO = {
  eyebrow: 'White-label engineering for agencies',
  titleLines: ['Your agency sells the vision.', 'We engineer what holds it up.'],
  lede: 'Senior engineers for websites, AI automation, internal tools and cloud, shipped under your brand. Prices are public.',
  trust: '60 seconds. You see the number before we ask for anything.',
  imageAlt:
    'A tower under construction in downtown Toronto at blue hour: dark glass on the lower floors, an exposed red steel frame above, a tower crane and the CN Tower in the distance.',
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
  logos: [
    { name: 'LRO Staffing', src: '/images/clients/lro-staffing.png', width: 132, height: 30, invert: true },
    { name: 'Loop', src: '/images/clients/loop.webp', width: 74, height: 32, invert: false },
    { name: 'FOCAS Canada', src: '/images/clients/focas-canada.png', width: 120, height: 22, invert: true },
    { name: 'CHHA-NCR', src: '/images/clients/chha-ncr.svg', width: 96, height: 32, invert: true },
    { name: 'Crowned Spice', src: '/images/clients/crowned-spice.png', width: 70, height: 34, invert: false },
  ],
  stats: [
    { value: 200, suffix: '+', label: 'projects supported' },
    { value: 25, suffix: '+', label: 'years of combined engineering experience' },
    { value: 3, suffix: '', label: 'offices: Toronto, Lagos, Kingston' },
  ],
} as const;

export const PROBLEM = {
  label: 'Launch week, a familiar story',
  lines: [
    'The site launches on time.',
    'Three weeks later the booking form breaks, the developer has moved on, and nobody can explain the hosting bill.',
    "Your client doesn't call the developer. They call you.",
  ],
} as const;

export interface Layer {
  id: string;
  service: EstimateService;
  name: string;
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

export const LAYERS_INTRO = {
  title: 'One team behind every layer.',
  lede: 'Most agencies stitch a different freelancer onto each of these. We own all four, so nothing falls in the gaps between them.',
} as const;

export const LAYERS: readonly Layer[] = [
  {
    id: 'layer-web',
    service: 'web',
    name: 'Websites',
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
    name: 'Automation and AI',
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
    name: 'Internal tools',
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
    name: 'Cloud',
    summary: 'Infrastructure as code, CI/CD, monitoring and migrations, so the thing you shipped stays up.',
    deliverables: ['AWS, Google Cloud or Azure, written as code', 'Pipelines that test every change before it ships', 'Monitoring that pages us before your client notices'],
    fromPrice: from(pricing.cloudEngineering.tiers[0].price),
    href: '/services/cloud-engineering',
    image: null,
  },
];

export const SILENCE = 'Every claim on this page can be checked. Start with this page.';

export const XRAY = {
  title: 'This page, taken apart.',
  lede: 'What you are reading is a production build. Here is what is underneath it, measured in your browser just now.',
  planes: [
    { id: 'surface', name: 'Surface', note: 'What your client sees' },
    { id: 'components', name: 'Components', note: 'What we build it from' },
    { id: 'data', name: 'Structured data', note: 'What search engines and AI assistants read' },
    { id: 'delivery', name: 'Delivery', note: 'How it reached you' },
    { id: 'speed', name: 'Speed', note: 'How fast, measured on your device' },
  ],
  components: ['Header', 'Hero', 'ProofStrip', 'Problem', 'Layers', 'XRay', 'WorkStack', 'Spotlight', 'Estimator', 'Founders', 'Faq', 'Close', 'Footer'],
} as const;

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
  lede: 'Toronto is home base. Our teams in Lagos and Kingston overlap with Eastern time every working day, so your client never waits a night for an answer.',
  people: [
    { name: 'Leshan Patterson', role: 'Co-founder and Director', image: '/images/team/leshan-patterson.jpg' },
    { name: 'Mercy Akuma', role: 'Co-founder and Director', image: '/images/team/mercy-akuma.jpg' },
  ],
} as const;

export const CLOSE = {
  title: 'What are we building?',
  lede: 'Pick one. The estimator opens with it selected, and the price is on screen before we ask for anything.',
  choices: (['web', 'automation', 'tools', 'cloud'] as const).map((service) => ({
    service,
    label: { web: 'A website', automation: 'An automation', tools: 'An internal tool', cloud: 'Cloud infrastructure' }[service],
    href: estimateHref({ services: [service] }),
  })),
  imageAlt: 'The same Toronto tower, finished and lit at night.',
} as const;

export const MOBILE_BAR_CONTEXT = `Public prices, from ${money(LOWEST_PRICE)}`;
