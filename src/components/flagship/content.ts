/**
 * Homepage copy and facts (flagship redesign, Nov 2026).
 *
 * Every number here is either published by MAPL TECH already (site.ts, the live
 * homepage) or computed from data in the repo; nothing is estimated. Sources are
 * cited inline. Copy rules: no em dashes, no hype verbs, one label per action.
 */
import { listedProjects, pricing, testimonials } from '@/config/site';
import { parsePriceLabel, type EstimateService } from '@/lib/estimate';
import { ESTIMATE_HREF, PRICING_HREF, PRICING_LABEL, PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';

/** The one primary action, labelled the same everywhere (header, hero, bar, close). */
export const PRIMARY_CTA = { label: PROJECT_LABEL, href: PROJECT_HREF } as const;
export const SECONDARY_CTA = { label: 'See the work', href: '/our-work' } as const;

interface TitleRun {
  text: string;
  accent?: boolean;
}

/**
 * The hero keeps the live site's brand line, "the engineering backbone", and
 * says whose: "The engineering backbone behind your agency." (voice pass, Nov 3
 * 2026; the old "agencies that refuse to cut corners" read as combative to the
 * directors it is written for). Broken into the three lines it sets at desktop
 * widths (phones let it wrap freely); "engineering backbone" is the accent run.
 */
export const HERO = {
  titleLines: [
    [{ text: 'The ' }, { text: 'engineering', accent: true }],
    [{ text: 'backbone', accent: true }, { text: ' behind' }],
    [{ text: 'your agency.' }],
  ] as readonly (readonly TitleRun[])[],
  lede: 'We work alongside your team to build the websites, automation, software and cloud systems your clients buy from you, under your brand.',
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
  clientsLabel: 'Selected clients',
  // One-colour versions of each client's own file in the page's off-white (mono/), so
  // five palettes read as one row. width/height are the files' pixels; scale balances
  // each mark against a square one: wordmarks run shorter, the solid Loop disc a touch
  // smaller, the line-drawn Crowned Spice badge a touch larger. Six palettes, one row.
  logos: [
    { name: 'LRO Staffing', src: '/images/clients/mono/lro-staffing.png', width: 384, height: 252, scale: 0.78 },
    // Its circular badge (dodoislanddiscoveries.com's site icon, Leshan's pick): the ink kept, the white
    // disc dropped out, so it reads as line art like the Crowned Spice badge, and is sized like it.
    { name: 'Dodo Island Discoveries', src: '/images/clients/mono/dodo-island-discoveries.png', width: 458, height: 460, scale: 1.04 },
    { name: 'Loop', src: '/images/clients/mono/loop.png', width: 399, height: 400, scale: 0.88 },
    { name: 'FOCAS Canada', src: '/images/clients/mono/focas-canada.png', width: 300, height: 82, scale: 0.56 },
    { name: 'CHHA-NCR', src: '/images/clients/mono/chha-ncr.svg', width: 184, height: 192, scale: 1 },
    { name: 'Crowned Spice', src: '/images/clients/mono/crowned-spice.png', width: 320, height: 320, scale: 1.04 },
  ],
  stats: [
    { value: 200, suffix: '+', label: 'projects supported' },
    { value: 25, suffix: '+', label: 'years of combined experience' },
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
    // Leshan, Nov 5, 2026: "For Website it should be fast websites built for AI search".
    summary: 'Fast websites built for AI search. They meet accessibility standards on launch day, and your client can update them without help.',
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
    summary: 'AI and automation that take repetitive work off your client’s team: sorting new leads, follow-ups and reports.',
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
    summary: 'Dashboards, client portals and admin systems, built around how your client’s team works.',
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
    summary: 'Cloud hosting on AWS, Google Cloud or Azure, with testing, monitoring and moves from old servers, so sites stay online.',
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
 * live-site Lighthouse result published on leshanpatterson.com; Dodo Island
 * Discoveries counted on its live site (Nov 4, 2026: five tour pages, four
 * currencies in its price switcher; facts, not results); MAPL Tours
 * figures as published on leshanpatterson.com (Nov 2026); CHHA-NCR from the
 * independent August 2026 audit (site.ts `caseStudies`).
 */
export const WORK: readonly WorkCard[] = (
  [
    {
      slug: 'lro-staffing',
      client: 'LRO Staffing',
      kind: 'Website · Ottawa and Toronto',
      outcome: 'One website for two audiences: people looking for work and employers looking to hire.',
      metrics: [
        { value: '100', label: 'Google Lighthouse score for accessibility and SEO, mobile and desktop' },
        { value: '8', label: 'industry pages, one click from the menu' },
      ],
      image: { src: '/images/case-lro-website.jpg', alt: 'LRO Staffing homepage with its job search panel.' },
      href: '/our-work/lro-staffing',
    },
    {
      slug: 'dodo-island-discoveries',
      client: 'Dodo Island Discoveries',
      kind: 'Website · Mauritius',
      outcome: 'A tour company’s website where visitors choose a tour, pick a date and request a booking.',
      metrics: [
        { value: '5', label: 'tours, each with its own page and booking calendar' },
        { value: '4', label: 'currencies for every price: rupees, US dollars, euros and Canadian dollars' },
      ],
      image: { src: '/images/case-dodo-island-discoveries.jpg', alt: 'The Dodo Island Discoveries homepage with its date search.' },
      href: '/our-work/dodo-island-discoveries',
    },
    {
      slug: 'mapl-tours',
      client: 'MAPL Tours',
      kind: 'Our own product · Jamaica',
      outcome: 'A travel company we built and run ourselves, with AI handling quoting, booking and follow-up.',
      metrics: [
        { value: '~50%', label: 'of customers now arrive through ChatGPT' },
        // The case study's own words (stories.ts), as /services and the service pages quote them.
        { value: '~2,000', label: 'automated tests run before any change goes live' },
      ],
      image: { src: '/images/case-mapl-tours.jpg', alt: 'MAPL Tours homepage over aerial footage of the Jamaican coast.' },
      href: '/our-work/mapl-tours',
    },
    {
      slug: 'chha-ncr',
      client: 'CHHA-NCR',
      kind: 'Non-profit website · Ottawa',
      outcome: 'A new website for people with hearing loss, most of them 55 and over. Volunteers can update it themselves.',
      metrics: [
        { value: 'AA', label: 'accessibility rating for colour contrast, on every pair checked' },
        { value: '5', label: 'stages in the site’s guide, from noticing hearing loss to giving back' },
      ],
      image: { src: '/images/case-chha-ncr.jpg', alt: 'The CHHA-NCR homepage after the July 2026 relaunch.' },
      href: '/our-work/chha-ncr',
    },
  ] satisfies WorkCard[]
).filter((card) => listedSlugs.has(card.slug));

/**
 * Real captures per case (public/images/cases, 1800x1125 desktop, 780x1688
 * phone): the live site and its phone view, with the address shown in the
 * browser frame. The work cards show both; the proof wall's AI-search tile
 * shows MAPL Tours' desktop.
 */
export const CASE_SHOTS: Readonly<Record<string, { desktop: string; mobile: string; url: string }>> = {
  'lro-staffing': { desktop: 'lro-desktop', mobile: 'lro-mobile', url: 'lrostaffing.com' },
  'dodo-island-discoveries': { desktop: 'dodo-desktop', mobile: 'dodo-mobile', url: 'dodoislanddiscoveries.com' },
  'mapl-tours': { desktop: 'tours-desktop', mobile: 'tours-mobile', url: 'mapltours.com' },
  'chha-ncr': { desktop: 'chha-desktop', mobile: 'chha-mobile', url: 'chhancr.ca' },
};

/** The one approved client quote (site.ts `testimonials`, LRO Staffing). */
export const SPOTLIGHT = testimonials.find((t) => t.company === 'LRO Staffing') ?? null;

/**
 * Beside an ask: the risk answers (all three are the FAQ's own answers,
 * src/components/home/data.ts), as a short list (TrustList), a few words each.
 * The two-sentence note they replaced read as one grey block under the buttons
 * (Leshan, Nov 2026: "messy"). TRUST_ITEMS under asks and in closes;
 * PRICE_TRUST_ITEMS on the first screens of / and /services, led by the
 * published price floor; WHITE_LABEL_ITEMS where the fixed quote is already
 * beside the ask (the service pages' hero facts, the article close's lede).
 * Display only, never JSON-LD: "20‑minute" keeps its non-breaking hyphen.
 */
// What an agency weighs before booking a call, in published facts only. Leshan, Nov 5, 2026: an NDA
// and "we never approach your clients" are common practice, so they are not selling points; say
// what agencies value instead (a fixed quote, support after launch, a fast reply).
export const REPLY_LINE = 'We reply within 24 hours.';
const QUOTE_ITEM = 'Fixed quote after one 20\u2011minute call';
const SUPPORT_ITEM = '30 to 90 days of support after launch';
const REPLY_ITEM = 'A reply within 24 hours';
export const TRUST_ITEMS = [QUOTE_ITEM, SUPPORT_ITEM, REPLY_ITEM] as const;
export const PRICE_TRUST_ITEMS = [`Projects from ${money(LOWEST_PRICE)}`, QUOTE_ITEM, SUPPORT_ITEM] as const;
export const WHITE_LABEL_ITEMS = [SUPPORT_ITEM, REPLY_ITEM] as const;
/**
 * The approved quote's first sentence as one line of proof beside an ask on
 * the other pages (QuoteLine). The homepage gives the testimonials in full in
 * its track record (VOICES) and keeps its hero to the ask and the trust line.
 */
export const HERO_PROOF = SPOTLIGHT
  ? {
      quote: SPOTLIGHT.quote.match(/^[^.!?]+[.!?]/)?.[0] ?? SPOTLIGHT.quote,
      name: SPOTLIGHT.name,
      role: `${SPOTLIGHT.role}, ${SPOTLIGHT.company}`,
      image: SPOTLIGHT.image || null,
    }
  : null;

export const MOBILE_BAR_CONTEXT = `Public prices, from ${money(LOWEST_PRICE)}`;

/**
 * The close band's proof where the page already gives the approved quote
 * elsewhere (the homepage's track record, /referral's hero, a case's own
 * quote): the clients whose projects have published case studies on
 * /our-work, by the names those cases use.
 */
export const CLIENTS_LINE = 'Clients include LRO Staffing, Dodo Island Discoveries, CHHA-NCR, FOCAS Canada and Crowned Spice.';

/* ------------------------------------------------------------------ */
/* Homepage sections (Nov 2026 simplify pass): the live site's purpose, */
/* in plain words. Facts come from the live homepage and the FAQ.       */
/* ------------------------------------------------------------------ */

export const SERVICES_INTRO = {
  label: 'What we do',
  // Whose work it is: the agency's clients buy it (the hero lede), we build it.
  title: 'What we build for your clients.',
  lede: 'Four services, each with a public starting price. Use one, or combine them.',
  /** The rows' prices lead here: the estimator, for one service or several (the label /pricing uses for it). */
  estimate: { label: 'Price your project', href: ESTIMATE_HREF },
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
  title: 'Work we can show.',
  // Also the service pages' proof block (ProofBlock), where some cases publish stages, not numbers.
  lede: 'Most of what we build carries our partners’ brands, so we keep it private.',
  all: { label: 'See all our work', href: '/our-work' },
  /** The ask after the last card, while the proof is still on screen (its reassurance is TRUST_ITEMS). */
  ask: 'Want work like this under your brand?',
} as const;

export const APPROACH = {
  label: 'Process',
  title: 'How we work with your team.',
  lede: 'From your first message to launch day, you know what happens next.',
  /** The white-label page: who does what, when to bring us in, the FAQ. */
  more: { label: 'Who does what on a project', href: '/white-label' },
  steps: [
    // The first step can be taken from here: it links to the brief.
    // How the white-label work runs, in published facts only (competitor gap, Nov 5, 2026): the reply
    // time (/contact-us), Slack and the check-ins (the timezone FAQ), who the client talks to and who
    // owns the code (the white-label FAQ), and the support window (the after-launch FAQ).
    { title: 'Tell us what you need', text: 'Answer four short questions. We reply within 24 hours, then we talk for 20 minutes.', href: PRIMARY_CTA.href },
    { title: 'Get a fixed quote', text: 'We agree the scope with you, then send one fixed price.' },
    { title: 'We build it with you', text: 'We join your Slack and your weekly check-ins. Your client only hears from your team.' },
    { title: 'Launch and support', text: 'Documented code that you and your client own, plus 30 to 90 days of support.' },
  ],
} as const;

/**
 * Why agencies work with us: the proof wall (Nov 28, 2026). Leshan on the
 * Nov 26 version (four reasons in rows, two full-length quotes): it "looks
 * plain" and was "too long to read"; he chose the proof wall. One screen of
 * tiles, each a single piece of proof with one job and as few words as it
 * can carry: a client's own sentence (the lead tile), the starting price,
 * the projects behind us, the offices' live hours, MAPL Tours' ChatGPT share
 * over its site, and the CHHA-NCR audit's verdict. Every figure is read from
 * where the site already publishes it, so none can drift, and every quote is
 * an exact excerpt (proof.spec.ts checks both). The full testimonials stay on
 * their case studies, which the tiles link to. Then the ask.
 */
export const PROOF_SECTION = {
  label: 'Why us',
  title: 'Why agencies work with us.',
  lede: 'Proof you can check.',
  /** Not the work ask's question or the close's line: this one asks after the proof. */
  ask: 'Have a client project in mind?',
} as const;

/**
 * An exact piece of a quote, `quote.slice(start, end)`, marked as a piece: an
 * ellipsis where it starts mid-sentence or stops before the quote's end in
 * the middle of one. The words in between are never changed.
 */
export function excerpt(quote: string, start: number, end: number = quote.length): string {
  const text = quote.slice(start, end).trim();
  const before = quote.slice(0, start).trim();
  const lead = before && !/[.!?]$/.test(before) ? '\u2026' : '';
  const tail = end < quote.length && !/[.!?]$/.test(text) ? '\u2026' : '';
  return `${lead}${text}${tail}`;
}

const client = testimonials.find((t) => t.kind === 'client');
const verdict = testimonials.find((t) => t.kind === 'audit');
const tours = WORK.find((card) => card.slug === 'mapl-tours');
const chha = WORK.find((card) => card.slug === 'chha-ncr');
const [projects, years] = PROOF.stats;

/**
 * The tiles' content, each read from its source: the client's `highlight`
 * sentence (site.ts testimonials), the lowest package price (site.ts
 * `pricing`, as the hero's "Projects from"), the projects and years
 * (PROOF.stats, the live homepage's numbers), the offices in the timezone
 * FAQ's order (Toronto on Eastern time, Kingston within an hour of it, Lagos
 * whose afternoon overlaps the Eastern morning), MAPL Tours' ChatGPT share
 * (its work card; named as our own company, as that card says) and, last,
 * the CHHA-NCR audit (its work card's rating and the verdict from the
 * highlight to the end), so the wall closes on third-party proof just above
 * its ask. A tile whose source is gone is not shown. `quote` is the full
 * testimonial, for the case-study lookup (caseFor) in the component.
 *
 * Every tile has one shape, in reading order: its `heading` (the tile's h3,
 * set as a small label, so heading navigation reaches every tile and lands
 * before its figure), then its proof, one caption, and its link. On the two
 * figure tiles the heading holds the figure too ("Prices from $3,500"), so it
 * stands alone in a list of headings. Their links use the site's own labels,
 * and the nav's shorter ones ("Pricing", "Team") where the tiles sit half a
 * phone wide.
 */
export const PROOF_WALL = {
  voice: client
    ? {
        heading: 'In a client\u2019s words',
        quote: client.quote,
        excerpt: excerpt(client.quote, client.quote.indexOf(client.highlight), client.quote.indexOf(client.highlight) + client.highlight.length),
        name: client.name,
        // The company's name held on one line (U+00A0), so "LRO Staffing" never splits.
        detail: `${client.role}, ${client.company.replace(/ /g, '\u00a0')}`,
        image: client.image || null,
      }
    : null,
  price: {
    heading: 'Prices from',
    figure: money(LOWEST_PRICE),
    caption: 'Published, so you can budget',
    link: { label: PRICING_LABEL, short: 'Pricing', href: PRICING_HREF },
  },
  team: {
    heading: `${projects.label.charAt(0).toUpperCase()}${projects.label.slice(1)}`,
    figure: `${projects.value}${projects.suffix}`,
    caption: `${years.value}${years.suffix} ${years.label}`,
    link: { label: 'Meet the team', short: 'Team', href: '/team' },
  },
  hours: {
    heading: 'Hours that overlap yours',
    cities: ['Toronto', 'Kingston', 'Lagos'] as const,
  },
  search: tours
    ? {
        heading: 'Built for AI search',
        figure: tours.metrics[0].value,
        caption: `of customers at ${tours.client}, our own travel company, now arrive through ChatGPT`,
        link: { label: 'Read the case study', context: tours.client, href: tours.href },
        shot: CASE_SHOTS[tours.slug] ?? null,
      }
    : null,
  audit:
    chha && verdict
      ? {
          // Said on the tile because the case study says it (site.ts caseStudies, chha-ncr:
          // "an independent August 2026 audit"; sourceNote "Independent four-track audit").
          heading: 'Independent accessibility audit',
          quote: verdict.quote,
          figure: chha.metrics[0].value,
          excerpt: excerpt(verdict.quote, verdict.quote.indexOf(verdict.highlight)),
          // The heading says what it was; this says which launch, and when ("August 2026" on one line).
          by: `${verdict.company}, ${verdict.role.replace(/ /g, '\u00a0')}`,
          link: { label: 'Read the case study', context: chha.client, href: chha.href },
        }
      : null,
} as const;

/**
 * The close adds what the hero's reassurance does not: what the call is for
 * (the contact page's own steps), as one collaborative next step. Display
 * only: "20 minutes" keeps its number on the line with a no-break space.
 */
export const CLOSE_BAND = {
  title: 'Let’s build your next client project together.',
  lede: 'Answer four short questions. We talk for 20\u00a0minutes, agree the scope with you, and send a fixed quote.',
} as const;
