/**
 * Homepage content (synthesis §2.1), assembled from copy that already ships:
 * `siteConfig`, `pricing`, `portfolioProjects` and `testimonials` in
 * src/config/site.ts, the service records in src/config/services.ts and the
 * route registry. Nothing here is invented; where the brief asks for a fact
 * the site does not state (project years, a sales alias, an NDA PDF) the
 * field is omitted and listed in the build report.
 *
 * Server-safe: no 'use client' imports. Client islands receive slices of this
 * module as props so the pricing tables never enter their bundles.
 */
import { pricing, portfolioProjects, siteConfig, testimonials } from '@/config/site';
import { services, serviceTiers, type ServiceSlug } from '@/config/services';
import { routeLastModified } from '@/config/routes';
import { formatMoney, parsePriceLabel } from '@/lib/estimate';
import type { BackboneSection } from '@/components/ui/Backbone';

/* ------------------------------------------------------------------ */
/* Page identity (mirrors the root layout metadata, byte for byte)      */
/* ------------------------------------------------------------------ */

export const HOME_PAGE_NAME = `${siteConfig.name} | Systems, Automation & Infrastructure for Agencies`;
export const HOME_PAGE_DESCRIPTION =
  'MAPL TECH is a systems, automation, cloud, and infrastructure partner for digital agencies. We build scalable websites, internal tools, AI-driven workflows, and cloud infrastructure that support complex client projects beyond design and marketing.';

/** ISO calendar date the homepage was last reviewed (route registry). */
export const HOME_LAST_REVIEWED = routeLastModified('/') ?? '2026-09-22';

/* ------------------------------------------------------------------ */
/* Pricing-derived figures                                              */
/* ------------------------------------------------------------------ */

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
/* 01 Hero                                                              */
/* ------------------------------------------------------------------ */

export const HERO = {
  eyebrow: 'Systems · Automation · Infrastructure',
  title: 'The engineering backbone behind leading agencies.',
  lede: `MAPL TECH partners with agencies to build, ship and scale the systems, automation and infrastructure their most ambitious projects demand. Everything ships under your brand, from three offices in Toronto, Lagos and Kingston, with public fixed-range pricing that starts at ${web[0].price} for a custom-coded site.`,
  clocksCaption: 'Office hours 09:00–18:00 local. Teal dot = open now.',
} as const;

export interface KeyFact {
  term: string;
  detail: string;
  /** Machine-readable value for <time>, when the fact is a date. */
  dateTime?: string;
}

export const KEY_FACTS: readonly KeyFact[] = [
  {
    term: 'Starting price',
    detail: `From ${web[0].price} for a custom-coded site · automation from ${lowOf(automation[0].price)}`,
  },
  {
    term: 'Typical timeline',
    detail: '3–4 weeks Starter · 5–8 weeks Growth · 8–14 weeks Advanced',
  },
  {
    term: 'Stack',
    detail: 'Next.js · React · TypeScript · WordPress · Node.js · Python · PostgreSQL · AWS / GCP · Terraform',
  },
  {
    term: 'Offices',
    detail: 'Toronto (HQ) · Lagos · Kingston',
  },
  {
    term: 'Last reviewed',
    detail: HOME_LAST_REVIEWED.slice(0, 7),
    dateTime: HOME_LAST_REVIEWED,
  },
];

/* ------------------------------------------------------------------ */
/* 01b Client logo marquee                                              */
/* ------------------------------------------------------------------ */

export interface LogoEntry {
  name: string;
  href: string;
  /** Path under /public. Omitted → the name renders as a mono wordmark. */
  logo?: string;
  /** Rendered box, pre-sized from the file's intrinsic ratio (no CLS). */
  width?: number;
  height?: number;
  /** Per-logo recipe that lands heterogeneous marks in one light-grey family. */
  filter?: string;
  /** Honesty tag, e.g. "own product" for MAPL Tours. */
  note?: string;
}

const caseStudyHref = (slug: string) => `/our-work/${slug}`;

export const LOGO_WALL: readonly LogoEntry[] = [
  { name: 'LRO Staffing', href: caseStudyHref('lro-staffing'), logo: '/images/clients/lro-staffing.png', width: 44, height: 30, filter: 'grayscale(1) invert(1)' },
  { name: 'UNSVCC', href: caseStudyHref('unsvcc'), logo: '/images/clients/unsvcc.svg', width: 29, height: 38, filter: 'grayscale(1) invert(1) brightness(1.1)' },
  { name: 'CHHA-NCR', href: caseStudyHref('chha-ncr'), logo: '/images/clients/chha-ncr.svg', width: 31, height: 32, filter: 'grayscale(1) invert(1) brightness(1.1)' },
  { name: 'FOCAS Canada', href: caseStudyHref('focas-canada'), logo: '/images/clients/focas-canada.png', width: 77, height: 22, filter: 'grayscale(1) invert(1)' },
  { name: 'Crowngate', href: caseStudyHref('crowngate-business') },
  { name: 'Loop', href: caseStudyHref('loop'), logo: '/images/clients/loop.webp', width: 32, height: 32, filter: 'grayscale(1)' },
  { name: 'Crowned Spice', href: caseStudyHref('crowned-spice'), logo: '/images/clients/crowned-spice.png', width: 34, height: 34, filter: 'grayscale(1)' },
  { name: 'MAPL Tours', href: '/labs', note: 'own product' },
];

/* ------------------------------------------------------------------ */
/* 02 Trust wall                                                        */
/* ------------------------------------------------------------------ */

export interface TrustPromise {
  title: string;
  body: string;
}

export const TRUST = {
  heading: 'Your client never hears our name.',
  promises: [
    {
      title: 'Mutual NDA + non-solicit before you send anything.',
      body: 'Sign it in two minutes, then share the brief. We never contact your client, and we never list your client as ours.',
    },
    {
      title: 'One PM, one invoice, your brand on every deliverable.',
      body: 'Regular updates, documented code, clean handoffs. You always know where things stand, and your team can pick up right where we left off.',
    },
    {
      title: 'Senior engineers only.',
      body: 'Every system is custom-built. No cookie-cutter themes, no fragile plugin stacks. Just clean, purpose-built code your team can actually maintain.',
    },
  ] as readonly TrustPromise[],
  wallLabels: { left: 'Your agency · client-facing', right: 'MAPL TECH · behind the wall' },
  ndaLabel: 'Ask for the mutual NDA template',
  ndaHref: `mailto:${siteConfig.email}?subject=${encodeURIComponent('Mutual NDA template')}`,
} as const;

export interface TrustMetric {
  value: number;
  label: string;
}

/** Literally true counts, computed from the data that publishes them. */
export const TRUST_METRICS: readonly TrustMetric[] = [
  { value: 3, label: 'offices' },
  { value: 3, label: 'countries' },
  { value: portfolioProjects.length, label: 'projects listed' },
  { value: services.length, label: 'service lines' },
];

/* ------------------------------------------------------------------ */
/* 03 How we plug in (PEAK) — also the HowTo JSON-LD source             */
/* ------------------------------------------------------------------ */

export interface PlugInStep {
  /** DOM anchor id (also the HowToStep url fragment). */
  id: string;
  name: string;
  text: string;
  /** Short mono caption shown under the diagram panel. */
  caption: string;
}

export const PLUG_IN = {
  heading: 'How we plug in',
  description: 'How MAPL TECH plugs into an agency team: a 20-min scoping call, a build run by your PM with our engineers, and a documented hand-off.',
  steps: [
    {
      id: 'how-scope',
      name: 'Scope',
      text: 'A 20-min call. We learn your agency, your clients, and your pain points. You leave with a fixed range from our public pricing.',
      caption: '20-min call → brief → fixed range',
    },
    {
      id: 'how-build',
      name: 'Build',
      text: 'Your PM, our engineers. We join your Slack, attend your standups, and ship with weekly demos, like we sit in your office.',
      caption: 'your PM · our engineers · weekly demos',
    },
    {
      id: 'how-handoff',
      name: 'Hand-off',
      text: 'Docs, training, and 30–90 days of post-launch support depending on tier. Your team picks up right where we left off.',
      caption: 'docs · training · 30–90-day support',
    },
  ] as readonly PlugInStep[],
} as const;

/* ------------------------------------------------------------------ */
/* 04 Services                                                          */
/* ------------------------------------------------------------------ */

export interface ServiceRow {
  slug: ServiceSlug;
  name: string;
  href: string;
  /** One-line buyer situation (tier copy from pricing). */
  situation: string;
  stack: readonly string[];
  /** "$5,000" — the first tier's starting figure. */
  startingPrice: string;
}

const SERVICE_ROW_NAMES: Record<ServiceSlug, string> = {
  'web-development': 'Web Development',
  'automation-ai-workflow-setup': 'Automation & AI Workflows',
  'custom-internal-tools': 'Custom Internal Tools',
  'cloud-engineering': 'Cloud Engineering',
};

const SERVICE_ROW_STACK: Record<ServiceSlug, readonly string[]> = {
  'web-development': ['Next.js', 'React', 'TypeScript', 'WordPress'],
  'automation-ai-workflow-setup': ['AI Agents', 'Python', 'APIs', 'CRM'],
  'custom-internal-tools': ['React', 'Node.js', 'PostgreSQL'],
  'cloud-engineering': ['AWS', 'GCP', 'Terraform', 'CI/CD'],
};

/** Current homepage line for internal tools; the other three use their first tier's description. */
const SERVICE_ROW_SITUATION_OVERRIDE: Partial<Record<ServiceSlug, string>> = {
  'custom-internal-tools': 'Dashboards, client portals, and reporting systems built around how your agency actually works.',
};

const withPeriod = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

export const SERVICES_SECTION = {
  eyebrow: 'What we do',
  heading: "The Technical Work Agencies Can't Afford to Get Wrong",
  subtitle: 'Systems, automation, and infrastructure - built by engineers who understand agency life.',
} as const;

export const SERVICE_ROWS: readonly ServiceRow[] = services.map((record) => {
  const tiers = serviceTiers(record);
  return {
    slug: record.slug,
    name: SERVICE_ROW_NAMES[record.slug],
    href: record.path,
    situation: SERVICE_ROW_SITUATION_OVERRIDE[record.slug] ?? withPeriod(tiers[0].description),
    stack: SERVICE_ROW_STACK[record.slug],
    startingPrice: lowOf(tiers[0].price),
  };
});

/* ------------------------------------------------------------------ */
/* 05 Selected work                                                     */
/* ------------------------------------------------------------------ */

export interface WorkRow {
  slug: string;
  title: string;
  href: string;
  service: string;
  /** Only when the site states one (LRO's 2026 guide, CHHA-NCR's 2026 relaunch). */
  year?: string;
  outcome: string;
  image: string;
  ownProduct?: boolean;
}

interface WorkOverride {
  href?: string;
  year?: string;
  outcome: string;
  ownProduct?: boolean;
}

const WORK_OVERRIDES: Record<string, WorkOverride> = {
  'lro-staffing': {
    year: '2026',
    outcome: 'Interactive salary guide with dynamic filtering, real-time data visualization and role-based benchmarking.',
  },
  'mapl-tours': {
    href: '/labs',
    ownProduct: true,
    outcome: 'A travel company run end-to-end by AI, built and operated in-house by MAPL Labs.',
  },
  'chha-ncr': {
    year: '2026',
    outcome: 'Full relaunch: journey-based information architecture, a searchable hearing-clinic directory and WCAG accessibility on a CMS volunteers maintain.',
  },
  unsvcc: {
    outcome: 'Internal operations dashboard with real-time organizational metrics, role-based access and automated reporting.',
  },
  'akuma-patterson-holdings': {
    outcome: 'Client lifecycle automated from CRM lead capture to invoicing and project hand-off, eliminating manual data entry.',
  },
};

const WORK_ORDER = ['lro-staffing', 'mapl-tours', 'chha-ncr', 'unsvcc', 'akuma-patterson-holdings'] as const;

export const WORK_ROWS: readonly WorkRow[] = WORK_ORDER.flatMap((slug) => {
  const project = portfolioProjects.find((entry) => entry.slug === slug);
  const override = WORK_OVERRIDES[slug];
  if (!project || !override) return [];
  return [
    {
      slug,
      title: project.title,
      href: override.href ?? caseStudyHref(slug),
      service: project.category,
      year: override.year,
      outcome: override.outcome,
      image: project.image,
      ownProduct: override.ownProduct,
    },
  ];
});

export const WORK_SECTION = {
  heading: 'Selected work',
  allLabel: 'See the work',
  allHref: '/our-work',
} as const;

/* ------------------------------------------------------------------ */
/* 06 Proof                                                             */
/* ------------------------------------------------------------------ */

export interface ProofItem {
  quote: string;
  name: string;
  role: string;
  company: string;
  image: string;
  /** The claim this quote is paired with. */
  pairsWith: string;
  caseHref?: string;
  caseLabel?: string;
}

const PROOF_PAIRING: Record<string, { pairsWith: string; caseSlug?: string }> = {
  'LRO Staffing': { pairsWith: 'embedded team', caseSlug: 'lro-staffing' },
};

/**
 * Only testimonials with a published headshot ship; the UNSVCC quote is a
 * draft awaiting sign-off and has none (same rule as src/lib/llms.ts).
 */
export const PROOF_ITEMS: readonly ProofItem[] = testimonials
  .filter((entry) => entry.image !== '')
  .map((entry) => {
    const pairing = PROOF_PAIRING[entry.company];
    return {
      quote: entry.quote,
      name: entry.name,
      role: entry.role,
      company: entry.company,
      image: entry.image,
      pairsWith: pairing?.pairsWith ?? 'agency partnership',
      caseHref: pairing?.caseSlug ? caseStudyHref(pairing.caseSlug) : undefined,
      caseLabel: pairing?.caseSlug ? `Read the ${entry.company} case study` : undefined,
    };
  });

export const PROOF_SECTION = {
  eyebrow: 'Testimonials',
  heading: "Don't Take Our Word for It",
} as const;

/* ------------------------------------------------------------------ */
/* 07 Estimate teaser                                                   */
/* ------------------------------------------------------------------ */

export const ESTIMATE_SECTION = {
  heading: 'Get a 60-second estimate',
  subtitle: 'Three inputs, a live range straight from our public pricing. Fixed quote after a 20-min scoping call.',
} as const;

/* ------------------------------------------------------------------ */
/* 08 FAQ — also the FAQPage JSON-LD source                             */
/* ------------------------------------------------------------------ */

export interface FaqEntry {
  question: string;
  answer: string;
}

const bundleLow = lowOf(pricing.bundles[0].price);
const bundleHigh = highOf(pricing.bundles[pricing.bundles.length - 1].price);

export const FAQ_SECTION = {
  heading: 'Questions agencies ask first',
  intro: 'The five objections we hear before an agency sends its first brief, answered in plain terms.',
} as const;

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
  {
    question: 'How do you price white-label work?',
    answer: `Fixed ranges, published on our pricing page: web development from ${web[0].price}; automation from ${automation[0].price} up to ${automation[automation.length - 1].price}; internal tools from ${tools[0].price} up to ${tools[tools.length - 1].price}; cloud engineering from ${cloud[0].price} up to ${cloud[cloud.length - 1].price}. Partner retainers run from ${bundleLow} to ${bundleHigh} a month and hourly work is ${pricing.hourlyRates.standard}. You get a fixed quote after a 20-min scoping call.`,
  },
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

/* ------------------------------------------------------------------ */
/* 09 Footer CTA                                                        */
/* ------------------------------------------------------------------ */

export const START = {
  heading: 'Start a project',
  subtitle: "Tell us what you're building. We'll tell you exactly how we can help.",
  includeLabel: 'What to include',
  include: [
    'Goal (what your client signed off)',
    'Current state (stack, hosting, what exists)',
    'Constraints (brand, compliance, team)',
    'Timeline',
    'Budget band',
  ],
  microcopy: 'Takes 2 minutes. No discovery-call gauntlet.',
  reassurance: ['Transparent public pricing', 'Teams in 3 countries', 'Code your team can own'],
  contact: {
    email: siteConfig.email,
    phoneDisplay: siteConfig.phone,
    phoneHref: `tel:${siteConfig.phone.replace(/[^\d+]/g, '')}`,
    offices: 'Toronto (HQ) · Lagos · Kingston',
  },
} as const;

/* ------------------------------------------------------------------ */
/* CTA vocabulary + Backbone nodes                                      */
/* ------------------------------------------------------------------ */

export const CTA = {
  primary: { label: 'Get a 60-second estimate', href: '/pricing#estimator' },
  secondary: { label: 'Book a 20-min scoping call', href: '/contact-us' },
} as const;

export const BACKBONE_SECTIONS: readonly BackboneSection[] = [
  { id: 'hero', label: 'Hero', index: 1 },
  { id: 'trust', label: 'Trust wall', index: 2 },
  { id: 'how', label: 'How we plug in', index: 3 },
  { id: 'services', label: 'Services', index: 4 },
  { id: 'work', label: 'Selected work', index: 5 },
  { id: 'proof', label: 'Proof', index: 6 },
  { id: 'estimate', label: 'Estimate', index: 7 },
  { id: 'faq', label: 'FAQ', index: 8 },
  { id: 'start', label: 'Start a project', index: 9 },
];
