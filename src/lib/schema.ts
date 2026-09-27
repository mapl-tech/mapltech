/**
 * Structured-data builders for mapltech.com (schema.org JSON-LD).
 *
 * Every builder returns one typed schema-dts node. Pages compose nodes into a
 * single `@graph` with `graph()` / `pageGraph()` and render it through
 * `<JsonLd />` (src/components/seo/JsonLd.tsx). Nothing here is invented: all
 * facts come from `src/config/site.ts`, `src/config/team.ts` and
 * `src/data/blog-posts.ts`, dates are normalised to ISO 8601 and undefined,
 * null and empty leaves are stripped before serialisation.
 *
 * Stable identifiers (use these instead of retyping URLs):
 *   ORG_ID        https://mapltech.com/#organization
 *   WEBSITE_ID    https://mapltech.com/#website
 *   BLOG_ID       https://mapltech.com/blog#blog
 *   personId()    https://mapltech.com/team#<slug>
 *   webPageId()   <page url>#webpage
 *   breadcrumbId()<page url>#breadcrumb
 */
import type {
  AboutPage,
  Blog,
  BlogPosting,
  BreadcrumbList,
  City,
  ContactPage,
  ContactPoint,
  Country,
  CreativeWork,
  FAQPage,
  Graph,
  HowTo,
  IdReference,
  ImageObject,
  ItemList,
  JobPosting,
  Offer,
  OfferCatalog,
  Organization,
  Person,
  Service,
  Thing,
  WebPage,
  WebSite,
} from 'schema-dts';
import { siteConfig, pricing, portfolioProjects, labsProjects, careers } from '@/config/site';
import { executives, teamMembers, type Executive, type TeamMember } from '@/config/team';
import type { BlogPost } from '@/data/blog-posts';
import { SITE_URL, absoluteUrl, routeLastModified, toISODate } from '@/config/routes';

export type { Graph, Thing } from 'schema-dts';

/** Object forms of the schema-dts unions (which also admit plain strings). */
export type OrganizationNode = Extract<Organization, { '@type': 'Organization' }>;
export type PersonNode = Extract<Person, { '@type': 'Person' }>;

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const LOGO_ID = `${SITE_URL}/#logo`;
export const BLOG_ID = `${SITE_URL}/blog#blog`;

export const ORG_NAME = siteConfig.name; // 'MAPL TECH' in prose
export const ORG_LEGAL_NAME = 'MAPL TECH Inc.'; // legalName only
export const ORG_ALTERNATE_NAMES = ['mapltech'];
export const ORG_TELEPHONE = '+1-647-375-6724';
export const LOGO_URL = `${SITE_URL}/images/mapl-tech-logo.svg`;

/** ISO 3166-1 alpha-2 markets served, in the order used everywhere on the site. */
export const AREA_SERVED_CODES = ['CA', 'NG', 'JM'] as const;

/** Currency the published price labels are treated as (labels are plain "$"). */
export const PRICE_CURRENCY = 'USD';

const DEFAULT_LANGUAGE = 'en-CA';

const COUNTRY_CODES: Record<string, (typeof AREA_SERVED_CODES)[number]> = {
  Canada: 'CA',
  Nigeria: 'NG',
  Jamaica: 'JM',
};

/** Cities the company serves from, with the country that disambiguates them. */
export const SERVICE_CITIES: ReadonlyArray<{ city: string; country: string; countryCode: string }> = [
  { city: 'Toronto', country: 'Canada', countryCode: 'CA' },
  { city: 'Lagos', country: 'Nigeria', countryCode: 'NG' },
  { city: 'Kingston', country: 'Jamaica', countryCode: 'JM' },
];

/* -------------------------------------------------------------------------- */
/* Service lines                                                              */
/* -------------------------------------------------------------------------- */

export type ServiceSlug =
  | 'web-development'
  | 'automation-ai-workflow-setup'
  | 'custom-internal-tools'
  | 'cloud-engineering';

export type PricingKey = 'webDevelopment' | 'automation' | 'internalTools' | 'cloudEngineering';

export interface ServiceLine {
  slug: ServiceSlug;
  path: string;
  /** Navigation label, also used for `knowsAbout`. */
  shortName: string;
  /** Schema `name` (matches the copy already shipped on the service pages). */
  name: string;
  serviceType: string;
  description: string;
  pricingKey: PricingKey;
}

export const SERVICE_LINES: readonly ServiceLine[] = [
  {
    slug: 'web-development',
    path: '/services/web-development',
    shortName: 'Web Development',
    name: 'Custom Web Development for Agencies',
    serviceType: 'Web Development',
    description:
      'Custom-coded websites engineered for speed, accessibility, and long-term maintainability. From headless CMS builds to full-stack React applications.',
    pricingKey: 'webDevelopment',
  },
  {
    slug: 'automation-ai-workflow-setup',
    path: '/services/automation-ai-workflow-setup',
    shortName: 'Automation & AI',
    name: 'Automation & AI Workflow Setup for Agencies',
    serviceType: 'Automation and AI Workflows',
    description:
      'Intelligent automation and AI workflows that connect your CRM, project tools, invoicing, and client intake into seamless pipelines.',
    pricingKey: 'automation',
  },
  {
    slug: 'custom-internal-tools',
    path: '/services/custom-internal-tools',
    shortName: 'Custom Internal Tools',
    name: 'Custom Internal Tools for Agencies',
    serviceType: 'Custom Internal Tools',
    description:
      'Custom dashboards, client portals, and operations platforms designed around how your agency actually works.',
    pricingKey: 'internalTools',
  },
  {
    slug: 'cloud-engineering',
    path: '/services/cloud-engineering',
    shortName: 'Cloud Engineering',
    name: 'Cloud Engineering for Agencies',
    serviceType: 'Cloud Engineering',
    description:
      'Scalable cloud infrastructure designed, deployed, and managed for agencies. CI/CD pipelines, IaC, monitoring, and security.',
    pricingKey: 'cloudEngineering',
  },
];

export function getServiceLine(slug: ServiceSlug): ServiceLine {
  const line = SERVICE_LINES.find((entry) => entry.slug === slug);
  if (!line) throw new Error(`Unknown service slug "${slug}"`);
  return line;
}

export function serviceId(slug: ServiceSlug): string {
  return `${absoluteUrl(getServiceLine(slug).path)}#service`;
}

/* -------------------------------------------------------------------------- */
/* Generic helpers                                                            */
/* -------------------------------------------------------------------------- */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function countryCode(country: string): string | undefined {
  return COUNTRY_CODES[country];
}

/** Word count of an HTML fragment with tags and entities removed. */
export function wordCount(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .trim();
  return text ? text.split(/\s+/).length : 0;
}

export interface ParsedPrice {
  /** Label was "Custom" (or carried no number). */
  custom: boolean;
  min?: number;
  max?: number;
  /** Label ended with "+" (open-ended upper bound). */
  openEnded: boolean;
  /** Recurring unit when the label says "/month" or "/hour". */
  unit?: 'month' | 'hour';
}

/**
 * Parse the price labels used in `pricing` ("$5,000", "$3,500-$5,000",
 * "$12,000-$25,000+", "$750/month", "$65-$120/hour", "Custom").
 */
export function parsePrice(label: string): ParsedPrice {
  const s = label.trim();
  const unit = /\/\s*month/i.test(s) ? 'month' : /\/\s*hour|\/\s*hr/i.test(s) ? 'hour' : undefined;
  const numbers = (s.match(/\d[\d,]*/g) ?? []).map((n) => Number(n.replace(/,/g, '')));
  if (numbers.length === 0) return { custom: true, openEnded: false };
  return {
    custom: false,
    min: numbers[0],
    max: numbers.length > 1 ? numbers[1] : undefined,
    openEnded: s.includes('+'),
    unit,
  };
}

/** "$5,000" style starting price for a service line (lowest tier). */
export function startingPrice(line: ServiceLine): string | undefined {
  const mins = pricing[line.pricingKey].tiers
    .map((tier) => parsePrice(tier.price).min)
    .filter((n): n is number => typeof n === 'number');
  if (mins.length === 0) return undefined;
  return `$${Math.min(...mins).toLocaleString('en-US')}`;
}

function clean(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number' && !Number.isFinite(value)) return undefined;
  if (Array.isArray(value)) {
    const items = value.map(clean).filter((item) => item !== undefined);
    return items.length > 0 ? items : undefined;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = clean(entry);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
  return value;
}

/** Deep-remove undefined, null, empty-string and empty array/object leaves. */
export function stripUndefined<T>(value: T): T {
  const cleaned = clean(value);
  if (cleaned !== undefined) return cleaned as T;
  return (Array.isArray(value) ? [] : {}) as T;
}

/**
 * JSON for a `<script type="application/ld+json">` body. Escapes `<`, `>`
 * and `&` as <, >, & so no payload can close the script tag.
 */
export function serializeJsonLd(value: Graph | Thing): string {
  return JSON.stringify(stripUndefined(value))
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/** Wrap nodes into the single @graph a page emits. */
export function graph(nodes: readonly Thing[]): Graph {
  return stripUndefined({
    '@context': 'https://schema.org',
    '@graph': nodes,
  }) as Graph;
}

/* -------------------------------------------------------------------------- */
/* References (compact nodes that merge with the full node by @id)            */
/* -------------------------------------------------------------------------- */

export function imageObject(url: string, caption?: string): ImageObject {
  return {
    '@type': 'ImageObject',
    url: absoluteUrl(url),
    contentUrl: absoluteUrl(url),
    caption,
  };
}

export function logoImage(): ImageObject {
  return { ...imageObject(LOGO_URL, ORG_NAME), '@id': LOGO_ID };
}

/** Bare reference to the Organization node emitted by the root layout. */
export function orgId(): IdReference {
  return { '@id': ORG_ID };
}

/**
 * Compact Organization node (name, url, logo) for callers that need a
 * self-contained block. Builders in this file reference the Organization
 * with orgId() instead so a page graph never carries the same @id twice.
 */
export function orgRef(): OrganizationNode {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: ORG_NAME,
    url: SITE_URL,
    logo: { '@id': LOGO_ID },
  };
}

export function personId(name: string): string {
  return `${absoluteUrl('/team')}#${slugify(name)}`;
}

export function personRef(member: Executive | TeamMember): PersonNode {
  return {
    '@type': 'Person',
    '@id': personId(member.name),
    name: member.name,
    jobTitle: member.title,
    url: personId(member.name),
  };
}

function cityNode(entry: { city: string; country: string }): City {
  return {
    '@type': 'City',
    name: entry.city,
    containedInPlace: { '@type': 'Country', name: entry.country },
  };
}

function countryNode(code: string): Country {
  const entry = SERVICE_CITIES.find((c) => c.countryCode === code);
  return { '@type': 'Country', name: entry?.country ?? code, identifier: code };
}

/* -------------------------------------------------------------------------- */
/* Site-level nodes                                                           */
/* -------------------------------------------------------------------------- */

export function contactPoint(): ContactPoint {
  return {
    '@type': 'ContactPoint',
    telephone: ORG_TELEPHONE,
    email: siteConfig.email,
    contactType: 'sales',
    areaServed: [...AREA_SERVED_CODES],
    availableLanguage: 'English',
  };
}

/** The canonical Organization node. Emit once per page, in the root graph. */
export function organization(): Organization {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: ORG_NAME,
    legalName: ORG_LEGAL_NAME,
    alternateName: ORG_ALTERNATE_NAMES,
    url: SITE_URL,
    logo: logoImage(),
    image: LOGO_URL,
    description: siteConfig.description,
    slogan: siteConfig.tagline,
    email: siteConfig.email,
    telephone: ORG_TELEPHONE,
    founder: executives.map(personRef),
    address: { '@type': 'PostalAddress', addressCountry: 'CA' },
    contactPoint: [contactPoint()],
    sameAs: Object.values(siteConfig.social),
    knowsAbout: SERVICE_LINES.map((line) => line.shortName),
    areaServed: SERVICE_CITIES.map(cityNode),
  };
}

/** WebSite node. Deliberately carries no SearchAction (the site has no search). */
export function webSite(): WebSite {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: ORG_NAME,
    alternateName: ORG_ALTERNATE_NAMES,
    description: siteConfig.description,
    publisher: { '@id': ORG_ID },
    inLanguage: DEFAULT_LANGUAGE,
  };
}

/** Organization + WebSite: the graph the root layout should emit. */
export function siteGraph(): Graph {
  return graph([organization(), webSite()]);
}

/* -------------------------------------------------------------------------- */
/* Page nodes                                                                 */
/* -------------------------------------------------------------------------- */

export type WebPageType =
  | 'WebPage'
  | 'AboutPage'
  | 'ContactPage'
  | 'CollectionPage'
  | 'ItemPage'
  | 'ProfilePage'
  | 'FAQPage';

type PageOf<T extends WebPageType> = Extract<WebPage, { '@type': T }>;
type WebPageFields = Omit<PageOf<'WebPage'>, '@type'>;

export interface WebPageInput<T extends WebPageType = 'WebPage'> {
  /** Site path, e.g. '/pricing'. */
  path: string;
  /** Page name; normally the same text as the metadata title. */
  name: string;
  description?: string;
  type?: T;
  /** Any parseable date; normalised to ISO. */
  datePublished?: string;
  /** Defaults to the route's lastModified from src/config/routes.ts. */
  dateModified?: string;
  /** Primary image path or URL. */
  image?: string;
  inLanguage?: string;
  /** Set false when the page emits no BreadcrumbList (default true). */
  includeBreadcrumb?: boolean;
}

export function webPageId(path: string): string {
  return `${absoluteUrl(path)}#webpage`;
}

export function breadcrumbId(path: string): string {
  return `${absoluteUrl(path)}#breadcrumb`;
}

export function webPage<T extends WebPageType = 'WebPage'>(input: WebPageInput<T>): PageOf<T> {
  const fields: WebPageFields = {
    '@id': webPageId(input.path),
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: input.inLanguage ?? DEFAULT_LANGUAGE,
    datePublished: input.datePublished ? toISODate(input.datePublished) : undefined,
    dateModified: input.dateModified ? toISODate(input.dateModified) : routeLastModified(input.path),
    primaryImageOfPage: input.image ? imageObject(input.image) : undefined,
    breadcrumb: input.includeBreadcrumb === false ? undefined : { '@id': breadcrumbId(input.path) },
  };
  return { '@type': input.type ?? 'WebPage', ...fields } as unknown as PageOf<T>;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * BreadcrumbList for the typical navigation path (not a URL mirror).
 * "Home" is prepended automatically unless the first item is '/'.
 */
export function breadcrumb(
  items: readonly BreadcrumbItem[],
  opts?: { pagePath?: string },
): BreadcrumbList {
  const trail = items[0]?.path === '/' ? items : [{ name: 'Home', path: '/' }, ...items];
  const pagePath = opts?.pagePath ?? trail[trail.length - 1].path;
  return {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId(pagePath),
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface FaqItem {
  question: string;
  /** Plain text or simple HTML; must match the answer rendered in the DOM. */
  answer: string;
}

export function faqPage(qa: readonly FaqItem[], opts?: { path?: string; name?: string }): FAQPage {
  const url = opts?.path ? absoluteUrl(opts.path) : undefined;
  return {
    '@type': 'FAQPage',
    '@id': url ? `${url}#faq` : undefined,
    name: opts?.name,
    url,
    mainEntity: qa.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export interface HowToStepInput {
  name: string;
  text: string;
  /** Only when the step has its own anchor in the DOM. */
  url?: string;
  image?: string;
}

export interface HowToInput {
  name: string;
  description?: string;
  path?: string;
  /** ISO 8601 duration, e.g. 'P3W'. */
  totalTime?: string;
  image?: string;
}

export function howTo(steps: readonly HowToStepInput[], opts: HowToInput): HowTo {
  const url = opts.path ? absoluteUrl(opts.path) : undefined;
  return {
    '@type': 'HowTo',
    '@id': url ? `${url}#howto` : undefined,
    name: opts.name,
    description: opts.description,
    url,
    totalTime: opts.totalTime,
    image: opts.image ? imageObject(opts.image) : undefined,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url ? absoluteUrl(step.url) : undefined,
      image: step.image ? imageObject(step.image) : undefined,
    })),
  };
}

export interface ItemListEntry {
  name: string;
  path?: string;
  url?: string;
  description?: string;
  /** Full node or `{ '@id' }` reference for the list item. */
  item?: Thing | { '@id': string };
}

export function itemList(items: readonly ItemListEntry[], opts?: { path?: string; name?: string; id?: string }): ItemList {
  const url = opts?.path ? absoluteUrl(opts.path) : undefined;
  return {
    '@type': 'ItemList',
    '@id': opts?.id ?? (url ? `${url}#list` : undefined),
    name: opts?.name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      description: entry.description,
      url: entry.url ?? (entry.path ? absoluteUrl(entry.path) : undefined),
      item: entry.item,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Offers and services                                                        */
/* -------------------------------------------------------------------------- */

/** Shape shared by `pricing.*.maintenance` and `pricing.*.retainers` entries. */
export interface RecurringPlan {
  name: string;
  price: string;
  description?: string;
}

export interface OfferInput {
  name: string;
  /** Price label exactly as published, e.g. '$8,500', '$750/month', 'Custom'. */
  price: string;
  description?: string;
  path?: string;
  category?: string;
}

/**
 * Offer from a published price label. Fixed prices become `price`; ranges and
 * recurring fees become a PriceSpecification / UnitPriceSpecification;
 * "Custom" omits price entirely and relies on the description.
 */
export function offer(input: OfferInput): Offer {
  const parsed = parsePrice(input.price);
  const base: Offer = {
    '@type': 'Offer',
    name: input.name,
    description: input.description,
    url: input.path ? absoluteUrl(input.path) : undefined,
    category: input.category,
    offeredBy: { '@id': ORG_ID },
  };

  if (parsed.custom) return base;

  const isRange = parsed.max !== undefined || parsed.openEnded;

  if (!isRange && !parsed.unit) {
    return { ...base, price: parsed.min, priceCurrency: PRICE_CURRENCY };
  }

  if (parsed.unit) {
    return {
      ...base,
      priceCurrency: PRICE_CURRENCY,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        priceCurrency: PRICE_CURRENCY,
        price: isRange ? undefined : parsed.min,
        minPrice: isRange ? parsed.min : undefined,
        maxPrice: isRange ? parsed.max : undefined,
        unitCode: parsed.unit === 'month' ? 'MON' : 'HUR',
        unitText: parsed.unit,
      },
    };
  }

  return {
    ...base,
    priceCurrency: PRICE_CURRENCY,
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: PRICE_CURRENCY,
      minPrice: parsed.min,
      maxPrice: parsed.max,
    },
  };
}

/** Package tiers + maintenance/retainer catalogs for one service line. */
export function serviceOfferCatalogs(line: ServiceLine): OfferCatalog[] {
  const block = pricing[line.pricingKey];
  const catalogs: OfferCatalog[] = [
    {
      '@type': 'OfferCatalog',
      '@id': `${absoluteUrl(line.path)}#packages`,
      name: `${line.shortName} packages`,
      url: absoluteUrl(line.path),
      numberOfItems: block.tiers.length,
      itemListElement: block.tiers.map((tier) =>
        offer({ name: tier.name, description: tier.description, price: tier.price, path: line.path, category: line.shortName }),
      ),
    },
  ];

  const recurring: RecurringPlan[] = 'maintenance' in block ? block.maintenance : block.retainers;
  if (recurring.length > 0) {
    catalogs.push({
      '@type': 'OfferCatalog',
      '@id': `${absoluteUrl(line.path)}#retainers`,
      name: `${line.shortName} maintenance and retainers`,
      url: absoluteUrl(line.path),
      numberOfItems: recurring.length,
      itemListElement: recurring.map((plan) =>
        offer({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          path: line.path,
          category: line.shortName,
        }),
      ),
    });
  }

  return catalogs;
}

/** Service node with provider reference and offer catalogs from `pricing`. */
export function service(
  slugOrLine: ServiceSlug | ServiceLine,
  opts?: { path?: string; name?: string; description?: string },
): Service {
  const line = typeof slugOrLine === 'string' ? getServiceLine(slugOrLine) : slugOrLine;
  const url = absoluteUrl(opts?.path ?? line.path);
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: opts?.name ?? line.name,
    description: opts?.description ?? line.description,
    url,
    serviceType: line.serviceType,
    provider: orgId(),
    areaServed: AREA_SERVED_CODES.map(countryNode),
    hasOfferCatalog: serviceOfferCatalogs(line),
  };
}

/** Every published price on the site as one nested OfferCatalog (pricing page). */
export function offerCatalog(opts?: { path?: string; name?: string }): OfferCatalog {
  const path = opts?.path ?? '/pricing';
  const url = absoluteUrl(path);
  const nested: OfferCatalog[] = [
    ...SERVICE_LINES.flatMap(serviceOfferCatalogs),
    {
      '@type': 'OfferCatalog',
      '@id': `${url}#bundles`,
      name: 'Partnership bundles',
      url,
      numberOfItems: pricing.bundles.length,
      itemListElement: pricing.bundles.map((bundle) =>
        offer({ name: bundle.name, description: bundle.description, price: bundle.price, path, category: 'Partnership bundle' }),
      ),
    },
    {
      '@type': 'OfferCatalog',
      '@id': `${url}#hourly`,
      name: 'Hourly rates',
      url,
      numberOfItems: 2,
      itemListElement: [
        offer({ name: 'Standard hourly rate', price: pricing.hourlyRates.standard, path, category: 'Hourly' }),
        offer({ name: 'Emergency hourly rate', price: pricing.hourlyRates.emergency, path, category: 'Hourly' }),
      ],
    },
  ];
  return {
    '@type': 'OfferCatalog',
    '@id': `${url}#offers`,
    name: opts?.name ?? `${ORG_NAME} pricing`,
    url,
    numberOfItems: nested.length,
    itemListElement: nested,
  };
}

/* -------------------------------------------------------------------------- */
/* Work, people, jobs                                                         */
/* -------------------------------------------------------------------------- */

export type PortfolioProject = (typeof portfolioProjects)[number];
export type LabsProject = (typeof labsProjects)[number];
export type CareerRole = (typeof careers)[number];

export function projectSlug(project: PortfolioProject | LabsProject): string {
  return slugify('status' in project ? project.name : project.title);
}

/**
 * CreativeWork for a portfolio or Labs project. `url` is the live work when
 * the client site is known, `mainEntityOfPage` is the page on mapltech.com
 * that describes it (defaults to the anchor on /our-work or /labs).
 */
export function creativeWork(
  project: PortfolioProject | LabsProject,
  opts?: { path?: string },
): CreativeWork {
  const isLab = 'status' in project;
  const name = isLab ? project.name : project.title;
  const basePath = isLab ? '/labs' : '/our-work';
  const pagePath = opts?.path ?? `${basePath}#${projectSlug(project)}`;
  const pageUrl = absoluteUrl(pagePath);
  const external = project.url ?? undefined;

  return {
    '@type': 'CreativeWork',
    '@id': pagePath.includes('#') ? pageUrl : `${pageUrl}#creativework`,
    name,
    description: project.description,
    abstract: isLab ? project.tagline : undefined,
    url: external ?? pageUrl,
    sameAs: external,
    mainEntityOfPage: pageUrl,
    image: imageObject(project.image, name),
    creator: orgId(),
    genre: isLab ? 'MAPL Labs' : project.category,
    keywords: (isLab ? project.capabilities : project.tags).join(', '),
    creativeWorkStatus: isLab ? project.status : undefined,
  };
}

/** Person node for an executive or team member (anchored at /team#slug). */
export function person(member: Executive | TeamMember): PersonNode {
  const isTeamMember = 'country' in member;
  const image = member.image && !member.image.includes('placeholder') ? absoluteUrl(member.image) : undefined;
  return {
    ...personRef(member),
    description: member.bio,
    image,
    sameAs: member.linkedin ? [member.linkedin] : undefined,
    worksFor: orgId(),
    workLocation: isTeamMember
      ? {
          '@type': 'Place',
          address: { '@type': 'PostalAddress', addressCountry: countryCode(member.country) ?? member.country },
        }
      : undefined,
  };
}

const EMPLOYMENT_TYPES: Record<string, string> = {
  contract: 'CONTRACTOR',
  'full-time': 'FULL_TIME',
  'full time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  'part time': 'PART_TIME',
  internship: 'INTERN',
  temporary: 'TEMPORARY',
};

function parseJobLocation(location: string): { cities: string[]; remote: boolean } {
  const parts = location.split('/').map((part) => part.trim()).filter(Boolean);
  const remote = parts.some((part) => /remote/i.test(part));
  return { cities: parts.filter((part) => !/remote/i.test(part)), remote };
}

export interface JobPostingInput {
  /** Date the role went live; required by Google and not present in `careers`. */
  datePosted: string;
  validThrough?: string;
  path?: string;
  baseSalary?: {
    min: number;
    max?: number;
    currency: string;
    unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  };
  directApply?: boolean;
}

export function jobPostingId(role: CareerRole): string {
  return `${absoluteUrl('/careers')}#${slugify(`${role.title} ${role.country}`)}`;
}

export function jobPosting(role: CareerRole, opts: JobPostingInput): JobPosting {
  const { cities, remote } = parseJobLocation(role.location);
  const code = countryCode(role.country) ?? role.country;
  return {
    '@type': 'JobPosting',
    '@id': jobPostingId(role),
    title: role.title,
    name: role.title,
    description: role.description,
    datePosted: toISODate(opts.datePosted),
    validThrough: opts.validThrough ? toISODate(opts.validThrough) : undefined,
    employmentType: EMPLOYMENT_TYPES[role.type.toLowerCase()] ?? role.type,
    hiringOrganization: orgId(),
    url: absoluteUrl(opts.path ?? '/careers'),
    jobLocation:
      cities.length > 0
        ? cities.map((city) => ({
            '@type': 'Place',
            address: { '@type': 'PostalAddress', addressLocality: city, addressCountry: code },
          }))
        : undefined,
    jobLocationType: remote ? 'TELECOMMUTE' : undefined,
    applicantLocationRequirements: remote ? { '@type': 'Country', name: role.country } : undefined,
    baseSalary: opts.baseSalary
      ? {
          '@type': 'MonetaryAmount',
          currency: opts.baseSalary.currency,
          value: {
            '@type': 'QuantitativeValue',
            minValue: opts.baseSalary.min,
            maxValue: opts.baseSalary.max,
            unitText: opts.baseSalary.unitText,
          },
        }
      : undefined,
    directApply: opts.directApply,
  };
}

/* -------------------------------------------------------------------------- */
/* Blog                                                                       */
/* -------------------------------------------------------------------------- */

export function blogPostingId(slug: string): string {
  return `${absoluteUrl(`/blog/${slug}`)}#blogposting`;
}

/**
 * Author node. Posts signed "MAPL TECH" reference the Organization (never a
 * Person named like a company); names matching team.ts become that person's
 * full Person node; anything else becomes a plain Person.
 */
export function authorRef(author: BlogPost['author']): Person | IdReference {
  const name = author.name.trim();
  if (name.toLowerCase() === ORG_NAME.toLowerCase() || name.toLowerCase() === ORG_LEGAL_NAME.toLowerCase()) {
    return orgId();
  }
  const member = [...executives, ...teamMembers].find((m) => m.name === name);
  if (member) return person(member);
  return { '@type': 'Person', name, jobTitle: author.role };
}

export function blogPosting(post: BlogPost, opts?: { dateModified?: string }): BlogPosting {
  const path = `/blog/${post.slug}`;
  const url = absoluteUrl(path);
  const published = toISODate(post.date);
  return {
    '@type': 'BlogPosting',
    '@id': blogPostingId(post.slug),
    headline: post.title,
    name: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: { '@id': webPageId(path) },
    isPartOf: { '@id': BLOG_ID },
    datePublished: published,
    dateModified: opts?.dateModified ? toISODate(opts.dateModified) : published,
    author: authorRef(post.author),
    publisher: orgId(),
    image: [absoluteUrl(post.coverImage)],
    articleSection: post.category,
    keywords: post.category,
    wordCount: wordCount(post.content),
    timeRequired: `PT${post.readTime}M`,
    inLanguage: DEFAULT_LANGUAGE,
  };
}

/** Blog node for the index, with compact BlogPosting entries. */
export function blog(posts: readonly BlogPost[], opts?: { name?: string; description?: string }): Blog {
  return {
    '@type': 'Blog',
    '@id': BLOG_ID,
    name: opts?.name ?? `${ORG_NAME} Blog`,
    description: opts?.description,
    url: absoluteUrl('/blog'),
    publisher: orgId(),
    inLanguage: DEFAULT_LANGUAGE,
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      '@id': blogPostingId(post.slug),
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: toISODate(post.date),
      author: authorRef(post.author),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Specialised pages                                                          */
/* -------------------------------------------------------------------------- */

export function contactPage(opts?: { name?: string; description?: string }): ContactPage {
  return {
    ...webPage({
      path: '/contact-us',
      type: 'ContactPage',
      name: opts?.name ?? `Contact ${ORG_NAME}`,
      description: opts?.description,
    }),
    mainEntity: orgId(),
  };
}

export function aboutPage(opts?: { name?: string; description?: string }): AboutPage {
  return {
    ...webPage({
      path: '/about-us',
      type: 'AboutPage',
      name: opts?.name ?? `About ${ORG_NAME}`,
      description: opts?.description,
    }),
    mainEntity: { '@id': ORG_ID },
  };
}

/* -------------------------------------------------------------------------- */
/* Page composition                                                           */
/* -------------------------------------------------------------------------- */

export interface PageGraphInput<T extends WebPageType = 'WebPage'> extends WebPageInput<T> {
  /**
   * Navigation trail excluding Home (prepended automatically). Defaults to
   * the page itself; the homepage emits no BreadcrumbList.
   */
  breadcrumbs?: readonly BreadcrumbItem[];
  /** Extra nodes for the page: faqPage(), service(), creativeWork()... */
  nodes?: readonly Thing[];
}

/** WebPage + BreadcrumbList + extra nodes as one @graph. */
export function pageGraph<T extends WebPageType = 'WebPage'>(input: PageGraphInput<T>): Graph {
  const { breadcrumbs, nodes = [], ...page } = input;
  const isHome = page.path === '/' || page.path === '';
  const trail = breadcrumbs ?? (isHome ? [] : [{ name: page.name, path: page.path }]);
  const crumbs = trail.length > 0 ? [breadcrumb(trail, { pagePath: page.path })] : [];
  return graph([webPage({ ...page, includeBreadcrumb: crumbs.length > 0 }), ...crumbs, ...nodes]);
}
