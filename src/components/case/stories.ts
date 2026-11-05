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
import { CLIENTS_LINE } from '@/components/flagship/content';
import type { EstimateService, EstimateToggles, SizeByService } from '@/lib/estimate';

/**
 * Where "Price a project like this" opens the estimator: the service line,
 * plus only what the story's own facts state. A size where a page count or
 * system type is published; an estimator switch (CMS, AI, logins) where the
 * facts name that feature. Anything the facts leave open stays unset, and the
 * estimator shows its usual first option for it.
 */
export type CaseEstimate = {
  [S in EstimateService]: { service: S; size?: SizeByService[S]; toggles?: EstimateToggles };
}[EstimateService];

export interface CaseFact {
  term: string;
  detail: string;
  href?: string;
  /**
   * Phones: the fact takes both columns, for a value too long for half the
   * width (a long domain broke mid-word). Set it on facts in pairs, so the
   * two-up rows above them stay whole.
   */
  wide?: boolean;
}

export interface CaseResult {
  value: string;
  label: string;
  /** The same fact in two or three words, for the phone's first screen (CaseStudy's glance row). */
  short?: string;
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
  /**
   * The project's short tags: [service line or kind of project, sector,
   * place], e.g. ["Web Development", "Staffing and recruitment", "Ottawa and
   * Toronto"]. A tag that names a service line uses its canonical name; one
   * that names the kind of project ("Website relaunch", "Our own product")
   * stays as it is. The /our-work rows and the service pages read the sector
   * (`tags[1]`); the case hero shows only what its facts do not say (heroTags).
   */
  tags: readonly string[];
  /**
   * Tags the facts already say, in the same or other words: the hero leaves
   * them out, so it never says one thing twice ("Ottawa and Toronto" beside
   * "Where: Ottawa and Toronto"). A service line's name stays: no fact names
   * the line.
   */
  tagsInFacts?: readonly string[];
  /** The one-line outcome under the H1. */
  headline: string;
  facts: readonly CaseFact[];
  results?: readonly CaseResult[];
  situation?: readonly string[];
  built?: { intro?: string; stages: readonly CaseStage[] };
  impact?: readonly { heading: string; items: readonly string[] }[];
  quote?: {
    text: string;
    name: string;
    role: string;
    image?: string;
    /** The chapter's name, when the words are not a person's (an audit's verdict). Default: "What they said". */
    label?: string;
  };
  matters?: { heading: string; text: string };
  /** Footnote naming where the numbers come from. */
  sources?: string;
  /** Real screenshots of the live product (captured Nov 2026). */
  media?: { desktop: string; mobile?: string; alt: string; caption?: string };
  /** The estimator target for "Price a project like this" (see CaseEstimate). */
  estimate?: CaseEstimate;
}

const alita = testimonials.find((t) => t.company === 'LRO Staffing');
const chhaAudit = testimonials.find((t) => t.company === 'CHHA-NCR relaunch');
const chha = caseStudies.find((c) => c.slug === 'chha-ncr');

export const STORIES: readonly CaseStory[] = [
  {
    slug: 'lro-staffing',
    client: 'LRO Staffing',
    tags: ['Web Development', 'Staffing and recruitment', 'Ottawa and Toronto'],
    // The Client fact says the sector ("full-service search and staffing"), Where the place.
    tagsInFacts: ['Staffing and recruitment', 'Ottawa and Toronto'],
    headline: 'A staffing agency’s website, rebuilt for its two audiences: people looking for work and employers looking to hire.',
    facts: [
      { term: 'Client', detail: 'LRO Staffing, full-service search and staffing' },
      { term: 'Where', detail: 'Ottawa and Toronto' },
      { term: 'What we built', detail: 'The complete website' },
      // Both across the phone's width, as Dodo Island Discoveries' (at 320 the arrow fell to its own line).
      { term: 'Built with', detail: 'WordPress, custom theme, PHP', wide: true },
      { term: 'Live', detail: 'lrostaffing.com', href: 'https://www.lrostaffing.com/', wide: true },
    ],
    // The two 100s are not side by side, so the band does not open on two
    // identical tiles. The first stays first: /our-work and the services rows quote it.
    results: [
      { value: '100', label: 'Google Lighthouse accessibility score, on mobile and desktop', short: 'Lighthouse accessibility' },
      { value: '8', label: 'industry expertise pages, one click from the menu', short: 'Industry pages' },
      { value: '100', label: 'Google Lighthouse SEO score, on mobile and desktop', short: 'Lighthouse SEO' },
    ],
    situation: [
      'LRO Staffing places people across Ottawa and Toronto. Its website has two very different visitors: someone looking for their next role, and an employer trying to fill one.',
      'Both needed to find their way from the first screen. LRO Staffing’s industry expertise, recruitment advice and salary data also had to be one click away, not buried at the bottom of the page.',
    ],
    // Each part is said once. "What changed" only repeated these stages (and the
    // results' count of expertise pages), so it is folded in: its one outcome
    // opens the chapter, its "not a rented template" and "a blog the team
    // publishes to" join the stages they describe. The facts name the theme.
    built: {
      intro: 'One website, organised around its two kinds of visitor: job seekers and employers are each one click from the main menu.',
      stages: [
        { name: 'Foundation', text: 'Every part made for the LRO Staffing brand, not a rented template.' },
        { name: 'Find', text: 'Job search with keyword, industry, location and job type filters.' },
        { name: 'Apply', text: 'Job alerts and resume submission, so a visit can end in an application.' },
        { name: 'Expertise', text: 'Industry expertise pages, from technology and government to legal services and finance.' },
        { name: 'Insight', text: 'A recruitment insights blog that LRO’s own team publishes to, and an interactive salary guide for the Ottawa and Toronto markets.' },
        { name: 'Access', text: 'Parts like the “How We Work With You” panels work with a keyboard and tell screen readers when they open and close.' },
      ],
    },
    quote: alita ? { text: alita.quote, name: alita.name, role: `${alita.role}, ${alita.company}`, image: alita.image || undefined } : undefined,
    matters: {
      heading: 'Why this matters if your agency sells websites',
      // 28 words (was 45, seven lines at 390): the same three points, plainly.
      text: 'Sites with two audiences often bury one. We plan the structure with you before design starts, then build it to pass the checks your client runs after launch.',
    },
    sources: 'Lighthouse results for lrostaffing.com as published on leshanpatterson.com (November 2026). Client quote from Alita Fabiano’s Google review.',
    media: {
      desktop: '/images/cases/lro-desktop.jpg',
      mobile: '/images/cases/lro-mobile.jpg',
      alt: 'The LRO Staffing homepage: “Building Careers. Strengthening Organizations.” above a job search panel.',
    },
    // Growth ("8–12 pages"): the eight expertise pages alone pass Starter's seven,
    // before the homepage, job search and blog. CMS: built on WordPress, with a
    // blog the team publishes to. No logins or 13+ page count is published.
    estimate: { service: 'web', size: 'growth', toggles: { cms: true } },
  },
  {
    slug: 'dodo-island-discoveries',
    client: 'Dodo Island Discoveries',
    tags: ['Web Development', 'Travel and tours', 'Mauritius'],
    // The Client fact says the business (small-group tours), Where the place.
    tagsInFacts: ['Travel and tours', 'Mauritius'],
    headline: 'A Mauritius tour company’s website, where visitors choose a small-group tour, pick a date and request a booking.',
    // Every line is what the live site shows (dodoislanddiscoveries.com, Nov 4, 2026): the
    // footer ("Website by MAPL TECH"), its own WordPress theme, the tour pages (photos,
    // duration, group size, start time, "Things to know", "Cancellation policy", "Ask us a
    // question"), their booking calendar (places left, "Request Booking"), the currency
    // switcher (Rs MUR, $ USD, € EUR, C$ CAD), the homepage's date search and its
    // TravelAgency structured data. No results are published, so none are stated.
    facts: [
      { term: 'Client', detail: 'Dodo Island Discoveries, small-group tours led by locals' },
      { term: 'Where', detail: 'Mauritius' },
      { term: 'What we built', detail: 'The complete website' },
      // Both across the phone's width: the domain is longer than half of it, and the pair stays whole.
      { term: 'Built with', detail: 'WordPress, custom theme, WooCommerce', wide: true },
      { term: 'Live', detail: 'dodoislanddiscoveries.com', href: 'https://dodoislanddiscoveries.com/', wide: true },
    ],
    built: {
      stages: [
        { name: 'Tours', text: 'A page for each tour, with photos, the duration, group size and start time, what to know and the cancellation policy.' },
        { name: 'Booking', text: 'A calendar to choose a date, see how many places are left and request a booking, with a form to ask a question first.' },
        { name: 'Currencies', text: 'Prices in Mauritian rupees, US dollars, euros or Canadian dollars, switched from the header.' },
        { name: 'Search', text: 'A date search on the homepage, and structured data that tells search engines the business is a travel agency.' },
      ],
    },
    matters: {
      heading: 'Why this matters if your client sells tours or experiences',
      text: 'A traveller decides on one page: what they will do, when, and what it costs in their own currency. We build each tour page to answer all three, with booking on the same page.',
    },
    media: {
      desktop: '/images/cases/dodo-desktop.jpg',
      mobile: '/images/cases/dodo-mobile.jpg',
      alt: 'The Dodo Island Discoveries homepage: “Small-group tours of Mauritius, led by locals” above a date search.',
    },
    // CMS: built on WordPress. "E-commerce or booking": the tour booking and its
    // WooCommerce cart. No page count is published (five tours on one template): no size chosen.
    estimate: { service: 'web', toggles: { cms: true, ecommerce: true } },
  },
  {
    slug: 'mapl-tours',
    client: 'MAPL Tours',
    tags: ['Our own product', 'Travel', 'Jamaica'],
    // Owner: MAPL TECH; What it does: "Private airport transfers and tours in Jamaica".
    tagsInFacts: ['Our own product', 'Travel', 'Jamaica'],
    headline: 'A travel company we built and run ourselves, to see how far software built with AI can go with real customers.',
    facts: [
      { term: 'Owner', detail: 'MAPL TECH' },
      { term: 'What it does', detail: 'Private airport transfers and tours in Jamaica' },
      { term: 'Built with', detail: 'Next.js, MCP and WebMCP tools, automated testing and deployment' },
      { term: 'Status', detail: 'Live, taking real payments' },
      { term: 'Live', detail: 'mapltours.com', href: 'https://mapltours.com/' },
    ],
    results: [
      { value: '~50%', label: 'of customers now arrive through ChatGPT', short: 'Customers via ChatGPT' },
      { value: '~2,000', label: 'automated tests run before any change goes live', short: 'Tests before each change' },
      { value: 'Live', label: 'real payments, for rides run by a licensed transportation provider', short: 'Real payments' },
    ],
    situation: [
      'Agencies ask us if software built with AI is ready for real customers. We answered by running a business on it.',
      'MAPL Tours sells private airport transfers and tours in Jamaica. The site handles video browsing, live quotes, payments, driver dispatch and customer emails. It is not a demo. It takes real payments for rides run by a licensed transportation provider, so every mistake would be a real one.',
    ],
    built: {
      intro: 'AI agents write much of the code. Our engineering is in the rules that control what they can do.',
      stages: [
        { name: 'Plan', text: 'A written project plan every AI agent reads before it changes anything, plus a lasting record of decisions.' },
        { name: 'Tests', text: 'Nearly 2,000 automated tests run before any change goes live.' },
        { name: 'Review', text: 'Specialist AI agents check every change, and a skeptic agent tries to prove their findings wrong.' },
        { name: 'Money', text: 'Strict payment safeguards: prices are worked out on the server, a repeated payment request is charged only once, and test orders stay apart from real ones.' },
        { name: 'AI assistants', text: 'MCP and WebMCP tools let AI assistants look up real fares and give travellers a link that is ready to book.' },
      ],
    },
    impact: [
      {
        heading: 'What it proves',
        items: [
          'Software built with AI can handle real money when the safeguards are built in, not hoped for.',
          'When AI assistants can look up a service directly, they can send people straight to booking it.',
        ],
      },
    ],
    matters: {
      heading: 'Why this matters if your clients ask about AI',
      text: 'AI assistants are already finding your clients, or missing them. We build sites and tools these assistants can read and recommend. We know how because our own business depends on it.',
    },
    sources: 'Figures as published by MAPL TECH’s co-founder on leshanpatterson.com (November 2026).',
    media: {
      desktop: '/images/cases/tours-desktop.jpg',
      mobile: '/images/cases/tours-mobile.jpg',
      alt: 'The MAPL Tours homepage: “Discover Jamaica beyond the resort.” over aerial footage of the coast.',
    },
    // AI: site.ts calls it "a travel and tourism company fully managed by AI", and
    // AI assistants look up its fares through MCP tools. Our own product, with no
    // client scope to size: no size chosen.
    estimate: { service: 'automation', toggles: { ai: true } },
  },
  {
    slug: 'chha-ncr',
    client: 'CHHA-NCR',
    legalName: chha?.client ?? 'Canadian Hard of Hearing Association, National Capital Region',
    tags: ['Website relaunch', 'Non-profit', 'Ottawa'],
    // The Relaunched and Sector facts. "Ottawa" stays: the Client fact says
    // "National Capital Region", which not every reader knows as Ottawa.
    tagsInFacts: ['Website relaunch', 'Non-profit'],
    headline: 'A relaunched website for people with hearing loss, most of them 55 and over, that the charity’s own volunteers can run.',
    facts: [
      { term: 'Client', detail: chha?.client ?? 'CHHA-NCR' },
      { term: 'Sector', detail: chha?.industry ?? 'Non-profit / accessibility' },
      { term: 'Built with', detail: (chha?.stack ?? []).join(', ') },
      // site.ts says "Relaunched July 2026"; the term already says relaunched.
      { term: 'Relaunched', detail: (chha?.delivered ?? 'July 2026').replace(/^relaunched\s+/i, '') },
      { term: 'Live', detail: 'chhancr.ca', href: 'https://www.chhancr.ca/' },
    ],
    results: [
      { value: 'AA', label: 'accessibility rating for colour contrast, on every colour pair the audit checked', short: 'Colour contrast rating' },
      { value: '5', label: 'stages that guide visitors: Noticing, Finding Out, Choosing, Living with it, Giving back', short: 'Visitor stages' },
    ],
    situation: chha ? [chha.challenge] : undefined,
    // Plain-language versions of site.ts caseStudies `solution` and `results`
    // (same facts, everyday words; the record keeps the audit's own wording).
    built: chha
      ? {
          intro: 'Accessibility built in from the start, not added at the end.',
          stages: [
            {
              name: 'Journey',
              text: 'The site is organised as a five-stage journey: Noticing, Finding Out, Choosing, Living with it, Giving back. Each stage is a plain-language page that points to the next.',
            },
            {
              name: 'Accessibility',
              text: 'Skip links, a clear page structure for screen readers, descriptions on every image, visible keyboard focus, reduced-motion support, and a panel where visitors set text size, motion and link underlining.',
            },
            {
              name: 'Directory',
              text: 'A directory of local hearing clinics with addresses, tap-to-call numbers and map links, plus an Accessible Ottawa guide to venues with hearing loops.',
            },
            {
              name: 'Self-service',
              text: 'Volunteers edit the site themselves on WordPress, so the branch does not depend on an agency. Caching keeps it fast, and structured data helps search engines read it.',
            },
          ],
        }
      : undefined,
    impact: chha
      ? [
          {
            heading: 'What the independent audit found',
            items: [
              'Openness about how the charity is run, which the audit called rare at this size: full board bios and published annual meeting (AGM) reports.',
              'The audit noted the five-stage journey as ahead of the US national counterpart’s site.',
            ],
          },
        ]
      : undefined,
    quote: chhaAudit ? { text: chhaAudit.quote, name: chhaAudit.name, role: chhaAudit.role, label: 'What the audit said' } : undefined,
    matters: {
      heading: 'Why this matters if you build for government and non-profit clients',
      // 28 words (was 36).
      text: 'For these clients, accessibility is often required, and an audit may follow. We build to WCAG AA from the start, on a site their own team can update.',
    },
    sources: chha?.sourceNote,
    media: {
      desktop: '/images/cases/chha-desktop.jpg',
      mobile: '/images/cases/chha-mobile.jpg',
      alt: 'The CHHA-NCR homepage: “We’ve said it too. And we know what helps”, with a text-size control in the top bar.',
    },
    // Growth ("8–12 pages"): the homepage, five journey-stage pages, the clinic
    // directory and the Accessible Ottawa guide pass Starter's seven, before the
    // board bios and AGM reports. CMS: volunteers edit it themselves on
    // WordPress. No logins are published.
    estimate: { service: 'web', size: 'growth', toggles: { cms: true } },
  },
  {
    slug: 'lro-salary-guide',
    client: 'LRO Interactive Salary Guide',
    tags: ['Custom Internal Tools', 'Staffing and recruitment', 'Ottawa and Toronto'],
    // The Client fact ("LRO Staffing") says the sector, as on the LRO Staffing case.
    tagsInFacts: ['Staffing and recruitment'],
    headline: 'An interactive salary guide that turns market data into a tool for comparing pay, made for recruiters and hiring managers.',
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
        { name: 'Filter', text: 'Filters for role and market.' },
        { name: 'See', text: 'Charts that update as soon as you change a filter.' },
        { name: 'Compare', text: 'Salary comparisons by role, for recruiters and hiring managers.' },
      ],
    },
    matters: {
      heading: 'Why this matters if your client publishes data',
      text: 'If your client publishes data in a report, we can work with your team to turn it into a tool people can filter and compare.',
    },
    media: {
      desktop: '/images/cases/salary-desktop.jpg',
      mobile: '/images/cases/salary-mobile.jpg',
      alt: 'The LRO 2026 Interactive Salary Guide with its filters and charts.',
    },
    // Internal Dashboards: filters and charts that update live are that tier's
    // "Custom charts and graphs" and "Live reports". Nothing of a client portal
    // (documents, payments) or an ops system. ("Role-based" here means job role.)
    estimate: { service: 'tools', size: 'dashboard' },
  },
  {
    slug: 'focas-canada',
    client: 'FOCAS Canada',
    tags: ['Web platform', 'Membership and events'],
    headline: 'An events website with a member portal, event registration and community tools.',
    facts: [
      { term: 'Client', detail: 'FOCAS Canada' },
      { term: 'Built with', detail: 'WordPress' },
      { term: 'Live', detail: 'focascanada.org', href: 'https://focascanada.org/' },
    ],
    built: {
      stages: [
        { name: 'Members', text: 'A member portal.' },
        { name: 'Events', text: 'Online registration for events.' },
        { name: 'Community', text: 'Tools for community engagement.' },
      ],
    },
    matters: {
      heading: 'Why this matters if your client runs a membership',
      text: 'Membership sites often break where the website, the sign-up system and email meet. We build them as one system, so the client’s team stops copying data between tools.',
    },
    media: {
      desktop: '/images/cases/focas-desktop.jpg',
      mobile: '/images/cases/focas-mobile.jpg',
      alt: 'The FOCAS Canada homepage: the “Family Oriented Community Advancement Support” logo under a menu with Membership, Volunteer and Donate.',
    },
    // CMS: built with WordPress (a content editor is not in Starter). No page
    // count is published, and nothing says how members sign in: no size chosen.
    estimate: { service: 'web', toggles: { cms: true } },
  },
  {
    slug: 'unsvcc',
    client: 'UNSVCC',
    legalName: 'United Senior Citizen Voice for Change Coalition',
    tags: ['Custom Internal Tools', 'Non-profit', 'Canada'],
    headline: 'A private dashboard for a Canadian seniors’ advocacy coalition, with live numbers, access by role and automatic reports.',
    facts: [
      { term: 'Client', detail: 'United Senior Citizen Voice for Change Coalition' },
      { term: 'What we built', detail: 'Internal operations dashboard' },
      { term: 'Public site', detail: 'unsvcc.org', href: 'https://www.unsvcc.org/' },
    ],
    built: {
      stages: [
        { name: 'Numbers', text: 'Live numbers for the whole organisation, in one place.' },
        { name: 'Access', text: 'Access by role, so each person sees what their job needs.' },
        { name: 'Reports', text: 'Reports that build themselves, instead of spreadsheets made by hand.' },
      ],
    },
    matters: {
      heading: 'Why this matters if your client runs on spreadsheets',
      text: 'Most organisations have a weekly report someone builds by hand. We work with their team to replace it with a dashboard that is already up to date when the meeting starts.',
    },
    media: {
      desktop: '/images/cases/unsvcc-desktop.jpg',
      mobile: '/images/cases/unsvcc-mobile.jpg',
      alt: 'The UNSVCC public website: “United Senior Citizen Voice for Change Coalition”.',
      caption: 'The coalition’s public site. The dashboard itself is internal and stays private.',
    },
    // Internal Dashboards: "live numbers ... in one place" and "access by role"
    // are that tier's own description and "Access levels for each role" (the
    // logins switch). Its self-building reports also appear in the ops tier, but
    // nothing else of that tier (running whole operations) is published.
    estimate: { service: 'tools', size: 'dashboard', toggles: { auth: true } },
  },
  {
    slug: 'crowned-spice',
    client: 'Crowned Spice',
    tags: ['Automation & AI', 'E-commerce'],
    // Type: "E-commerce automation".
    tagsInFacts: ['E-commerce'],
    headline: 'Online store automation, from stock levels to shipping to the messages customers get after they buy.',
    facts: [
      { term: 'Client', detail: 'Crowned Spice' },
      { term: 'Type', detail: 'E-commerce automation' },
    ],
    built: {
      stages: [
        { name: 'Stock', text: 'Stock levels that match in every place the store sells.' },
        { name: 'Shipping', text: 'Shipping starts automatically when an order is ready.' },
        { name: 'After the sale', text: 'Automatic messages to customers after they buy.' },
      ],
    },
    matters: {
      heading: 'Why this matters if your client sells online',
      text: 'The online store is the easy part. The hours go into everything after someone clicks buy. We automate the routine steps, so the client’s team only handles the orders that need a person.',
    },
    // Three automations fit "3–5 core automations", but stock kept in step across
    // every sales channel could also be a multi-system pipeline: no size chosen.
    estimate: { service: 'automation' },
  },
];

export function findStory(slug: string): CaseStory | undefined {
  return STORIES.find((story) => story.slug === slug);
}

/** The tags under the case hero's breadcrumb: the story's own, less those its facts already say. */
export function heroTags(story: CaseStory): readonly string[] {
  return story.tags.filter((tag) => !story.tagsInFacts?.includes(tag));
}

/**
 * The site's client line (flagship/content.ts CLIENTS_LINE) without this
 * case's own client: the names are the case stories' own, kept in the line's
 * order, so nothing is retyped and a client the line does not name never
 * appears. The story's own client is left out by its name and by its Client
 * fact ("LRO Staffing" on the salary guide's page).
 */
export function otherClientsLine(story: CaseStory): string | undefined {
  const own = new Set([story.client, ...story.facts.filter((fact) => fact.term === 'Client').map((fact) => fact.detail)]);
  const isOwn = (name: string) => [...own].some((detail) => detail === name || detail.startsWith(`${name},`) || detail.startsWith(`${name} (`));
  const names = [...new Set(STORIES.map((entry) => entry.client))]
    .filter((name) => CLIENTS_LINE.includes(name) && !isOwn(name))
    .sort((a, b) => CLIENTS_LINE.indexOf(a) - CLIENTS_LINE.indexOf(b));
  if (!names.length) return undefined;
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return `Other clients include ${list}.`;
}
