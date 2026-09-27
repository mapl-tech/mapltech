/**
 * Scope Estimator engine (research synthesis §2.3).
 *
 * Pure, deterministic, framework-free. Every number here is parsed from the
 * `pricing` object in `src/config/site.ts` at call time, so a price change in
 * site.ts changes the estimator, the tier tables and the JSON-LD together.
 * Nothing is invented: the only derived figure is the upper bound of a web
 * tier, which is the *next* web tier's starting price (web tiers are
 * "starting at" prices; the other three service lines are already ranges).
 *
 * Used by: /pricing (#estimator), the per-service mini-scopers, the homepage
 * estimate teaser, the contact wizard prefill and the referral estimator.
 */
import { pricing } from '@/config/site';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type EstimateService = 'web' | 'automation' | 'tools' | 'cloud';

export type WebSize = 'starter' | 'growth' | 'advanced' | 'enterprise';
export type AutomationSize = 'foundation' | 'advanced' | 'enterprise';
export type ToolsSize = 'dashboard' | 'portal' | 'ops';
export type CloudSize = 'starter' | 'production' | 'enterprise';

export interface SizeByService {
  web: WebSize;
  automation: AutomationSize;
  tools: ToolsSize;
  cloud: CloudSize;
}
export type SizeKey = SizeByService[EstimateService];
export type EstimateSize = Partial<SizeByService>;

export type ToggleKey = 'cms' | 'ecommerce' | 'auth' | 'ai' | 'compliance' | 'designSupplied';
export type EstimateToggles = Partial<Record<ToggleKey, boolean>>;

export type SupportLevel = 'none' | 'light' | 'growth' | 'priority';
export type EstimateTimeline = 'standard' | 'rush';

export interface EstimateInput {
  /** Selected service lines, canonical order (web, automation, tools, cloud). */
  services: EstimateService[];
  /** One size per selected service; missing sizes fall back to the first option. */
  size: EstimateSize;
  toggles: EstimateToggles;
  support: SupportLevel;
  timeline: EstimateTimeline;
}

export type PricingKey = 'webDevelopment' | 'automation' | 'internalTools' | 'cloudEngineering';

export interface PricingTier {
  name: string;
  description: string;
  price: string;
  features: string[];
}

export interface RecurringLine {
  name: string;
  price: string;
  description?: string;
}

export interface EstimateServiceMeta {
  key: EstimateService;
  /** Display name, e.g. "Web Development". */
  label: string;
  /** Short chip label, e.g. "Web". */
  shortLabel: string;
  slug: string;
  path: string;
  pricingKey: PricingKey;
  /** What site.ts calls the monthly line for this service. */
  recurringLabel: 'Maintenance' | 'Retainer';
}

export interface SizeOption {
  key: SizeKey;
  label: string;
  tierIndex: number;
}

export interface ToggleOption {
  key: ToggleKey;
  label: string;
  param: string;
  appliesTo: readonly EstimateService[];
}

export interface SupportOption {
  key: SupportLevel;
  label: string;
}

export interface ParsedPriceLabel {
  /** null when the label is "Custom". */
  low: number | null;
  /** null when custom or when the label is a single open-ended figure ("$20,000+"). */
  high: number | null;
  /** The label carries a trailing "+" (e.g. "$12,000-$25,000+", "$20,000+"). */
  openEnded: boolean;
  isCustom: boolean;
  unit: 'once' | 'month' | 'hour';
}

export interface TierResolution {
  index: number;
  tier: PricingTier;
  drivers: string[];
}

export interface EstimateLine {
  service: EstimateService;
  serviceName: string;
  tierName: string;
  tierIndex: number;
  tierDescription: string;
  features: string[];
  /** The price string exactly as site.ts prints it ("$8,500", "$3,500-$5,000", "Custom"). */
  priceLabel: string;
  /** Web tiers are "starting at" prices; the range runs to the next tier's start. */
  startingAt: boolean;
  low: number | null;
  high: number | null;
  isOpenEnded: boolean;
  isCustom: boolean;
  drivers: string[];
}

export interface EstimateMonthlyLine {
  service: EstimateService;
  serviceName: string;
  name: string;
  priceLabel: string;
  low: number;
  high: number;
  description?: string;
}

export interface EstimateBundle {
  name: string;
  description: string;
  price: string;
  features: string[];
  low: number;
  high: number;
}

export type EstimateDriverKind = 'service' | 'addon' | 'support' | 'timeline' | 'bundle';

export interface EstimateDriver {
  kind: EstimateDriverKind;
  service?: EstimateService;
  text: string;
}

export interface EstimateResult {
  input: EstimateInput;
  lines: EstimateLine[];
  /** Sum of the priced lines' lows (custom lines contribute 0). */
  oneTimeLow: number;
  /** null when any line is custom or has no upper bound. */
  oneTimeHigh: number | null;
  /** True when the total should print with a trailing "+". */
  isOpenEnded: boolean;
  hasCustom: boolean;
  monthly: EstimateMonthlyLine[];
  monthlyLow: number;
  monthlyHigh: number;
  /** Surfaced when two or more service lines are selected. */
  bundle?: EstimateBundle;
  /** "What drove this", in display order. */
  drivers: EstimateDriver[];
  notes: string[];
}

/* ------------------------------------------------------------------ */
/* Static tables (labels only; every number is read from `pricing`)    */
/* ------------------------------------------------------------------ */

export const ESTIMATE_SERVICES: readonly EstimateService[] = ['web', 'automation', 'tools', 'cloud'];

export const SERVICE_META: Record<EstimateService, EstimateServiceMeta> = {
  web: {
    key: 'web',
    label: 'Web Development',
    shortLabel: 'Web',
    slug: 'web-development',
    path: '/services/web-development',
    pricingKey: 'webDevelopment',
    recurringLabel: 'Maintenance',
  },
  automation: {
    key: 'automation',
    label: 'Automation & AI',
    shortLabel: 'Automation',
    slug: 'automation-ai-workflow-setup',
    path: '/services/automation-ai-workflow-setup',
    pricingKey: 'automation',
    recurringLabel: 'Retainer',
  },
  tools: {
    key: 'tools',
    label: 'Custom Internal Tools',
    shortLabel: 'Tools',
    slug: 'custom-internal-tools',
    path: '/services/custom-internal-tools',
    pricingKey: 'internalTools',
    recurringLabel: 'Retainer',
  },
  cloud: {
    key: 'cloud',
    label: 'Cloud Engineering',
    shortLabel: 'Cloud',
    slug: 'cloud-engineering',
    path: '/services/cloud-engineering',
    pricingKey: 'cloudEngineering',
    recurringLabel: 'Retainer',
  },
};

/** Size chips per service. `tierIndex` points into `pricing[...].tiers`. */
export const SIZE_OPTIONS: Record<EstimateService, readonly SizeOption[]> = {
  web: [
    { key: 'starter', label: 'Up to 7 pages', tierIndex: 0 },
    { key: 'growth', label: '8–12 pages', tierIndex: 1 },
    { key: 'advanced', label: '13+ pages or web app', tierIndex: 2 },
    { key: 'enterprise', label: 'Enterprise platform', tierIndex: 3 },
  ],
  automation: [
    { key: 'foundation', label: '3–5 core automations', tierIndex: 0 },
    { key: 'advanced', label: 'Multi-system pipeline', tierIndex: 1 },
    { key: 'enterprise', label: 'Custom AI agents', tierIndex: 2 },
  ],
  tools: [
    { key: 'dashboard', label: 'Internal dashboard', tierIndex: 0 },
    { key: 'portal', label: 'Client portal', tierIndex: 1 },
    { key: 'ops', label: 'Ops & reporting system', tierIndex: 2 },
  ],
  cloud: [
    { key: 'starter', label: 'Starter cloud setup', tierIndex: 0 },
    { key: 'production', label: 'Production infrastructure', tierIndex: 1 },
    { key: 'enterprise', label: 'Enterprise platform', tierIndex: 2 },
  ],
};

export const TOGGLE_OPTIONS: readonly ToggleOption[] = [
  { key: 'cms', label: 'CMS integration (headless or WordPress)', param: 'cms', appliesTo: ['web'] },
  { key: 'ecommerce', label: 'E-commerce or booking', param: 'ecom', appliesTo: ['web'] },
  { key: 'auth', label: 'User authentication & roles', param: 'auth', appliesTo: ['web', 'tools'] },
  { key: 'ai', label: 'AI features (chatbots, recommendations)', param: 'ai', appliesTo: ['web', 'automation'] },
  { key: 'compliance', label: 'Compliance (SOC 2 / HIPAA)', param: 'compliance', appliesTo: ['web', 'automation', 'tools', 'cloud'] },
  { key: 'designSupplied', label: 'Design supplied (Figma / Sketch / XD)', param: 'design', appliesTo: ['web'] },
];

export const SUPPORT_LEVELS: readonly SupportOption[] = [
  { key: 'none', label: 'None' },
  { key: 'light', label: 'Light' },
  { key: 'growth', label: 'Growth' },
  { key: 'priority', label: 'Priority' },
];

export const TIMELINES: readonly EstimateTimeline[] = ['standard', 'rush'];

export const FIXED_QUOTE_NOTE = 'Fixed quote after a 20-min scoping call';

export const DEFAULT_ESTIMATE_INPUT: EstimateInput = {
  services: ['web'],
  size: { web: 'starter' },
  toggles: {},
  support: 'none',
  timeline: 'standard',
};

/**
 * Minimum tier a toggle pulls a service line up to. Grounded in the tier
 * feature lists in site.ts:
 *  web:        CMS / e-commerce → Growth ("CMS integration", "E-commerce or booking");
 *              auth / AI → Advanced ("User authentication", "AI-powered features");
 *              compliance → Enterprise ("Enterprise security audits and compliance").
 *  automation: AI → Advanced Automation ("AI-powered intake forms", "Virtual assistant");
 *              compliance → Enterprise AI Workflows ("AI governance & compliance").
 *  tools:      auth → included from Internal Dashboards ("Role-based access control");
 *              compliance → Ops & Reporting Systems (top tier; no Custom tier exists).
 *  cloud:      compliance → Enterprise Cloud Platform ("Compliance & audit readiness").
 */
const TOGGLE_MIN_TIER: Record<EstimateService, Partial<Record<ToggleKey, number>>> = {
  web: { cms: 1, ecommerce: 1, auth: 2, ai: 2, compliance: 3 },
  automation: { ai: 1, compliance: 2 },
  tools: { auth: 0, compliance: 2 },
  cloud: { compliance: 2 },
};

/**
 * Which recurring line each support level maps to, per service.
 * Web maintenance and automation retainers have three lines; tools and cloud
 * have two, so "light" and "growth" share the lower line there.
 */
const SUPPORT_INDEX: Record<EstimateService, Record<Exclude<SupportLevel, 'none'>, number>> = {
  web: { light: 0, growth: 1, priority: 2 },
  automation: { light: 0, growth: 1, priority: 2 },
  tools: { light: 0, growth: 0, priority: 1 },
  cloud: { light: 0, growth: 0, priority: 1 },
};

const SERVICE_ALIASES: Record<string, EstimateService> = {
  web: 'web',
  'web-development': 'web',
  webdevelopment: 'web',
  website: 'web',
  automation: 'automation',
  'automation-ai-workflow-setup': 'automation',
  'automation-ai': 'automation',
  ai: 'automation',
  tools: 'tools',
  'internal-tools': 'tools',
  internaltools: 'tools',
  'custom-internal-tools': 'tools',
  cloud: 'cloud',
  'cloud-engineering': 'cloud',
  cloudengineering: 'cloud',
};

const TOGGLE_PARAM_ALIASES: Record<string, ToggleKey> = {
  cms: 'cms',
  ecom: 'ecommerce',
  ecommerce: 'ecommerce',
  auth: 'auth',
  ai: 'ai',
  compliance: 'compliance',
  design: 'designSupplied',
  designsupplied: 'designSupplied',
};

/* ------------------------------------------------------------------ */
/* Pricing access                                                       */
/* ------------------------------------------------------------------ */

export function tiersFor(service: EstimateService): readonly PricingTier[] {
  switch (service) {
    case 'web':
      return pricing.webDevelopment.tiers;
    case 'automation':
      return pricing.automation.tiers;
    case 'tools':
      return pricing.internalTools.tiers;
    case 'cloud':
      return pricing.cloudEngineering.tiers;
  }
}

/** Monthly lines for a service: web `maintenance`, otherwise `retainers`. */
export function recurringLinesFor(service: EstimateService): readonly RecurringLine[] {
  switch (service) {
    case 'web':
      return pricing.webDevelopment.maintenance;
    case 'automation':
      return pricing.automation.retainers;
    case 'tools':
      return pricing.internalTools.retainers;
    case 'cloud':
      return pricing.cloudEngineering.retainers;
  }
}

export function sizeOptionsFor(service: EstimateService): readonly SizeOption[] {
  return SIZE_OPTIONS[service];
}

export function isEstimateService(value: unknown): value is EstimateService {
  return typeof value === 'string' && (ESTIMATE_SERVICES as readonly string[]).includes(value);
}

export function isSizeFor(service: EstimateService, value: unknown): value is SizeKey {
  return typeof value === 'string' && SIZE_OPTIONS[service].some((option) => option.key === value);
}

export function isSupportLevel(value: unknown): value is SupportLevel {
  return typeof value === 'string' && SUPPORT_LEVELS.some((level) => level.key === value);
}

export function isTimeline(value: unknown): value is EstimateTimeline {
  return value === 'standard' || value === 'rush';
}

/** Parse a site.ts price label: "$5,000", "$3,500-$5,000", "$12,000-$25,000+", "$20,000+", "$500/month", "Custom". */
export function parsePriceLabel(label: string): ParsedPriceLabel {
  const s = label.trim();
  const unit: ParsedPriceLabel['unit'] = /\/\s*month/i.test(s) ? 'month' : /\/\s*(hour|hr)/i.test(s) ? 'hour' : 'once';
  const numbers = (s.match(/\d[\d,]*/g) ?? []).map((n) => Number(n.replace(/,/g, '')));
  if (numbers.length === 0) {
    return { low: null, high: null, openEnded: false, isCustom: true, unit };
  }
  const openEnded = s.includes('+');
  const low = numbers[0];
  const high = numbers.length > 1 ? numbers[1] : openEnded ? null : low;
  return { low, high, openEnded, isCustom: false, unit };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                           */
/* ------------------------------------------------------------------ */

/** "$8,500" — no Intl dependency so server, client and tests agree byte for byte. */
export function formatMoney(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${amount < 0 ? '-' : ''}$${grouped}`;
}

/**
 * "$5,000–$8,000" · "$20,000+" · "$8,500" · "Custom".
 * `high` null/undefined means open-ended; `openEnded` adds a trailing "+" to a full range.
 */
export function formatRange(low: number | null, high?: number | null, opts?: { openEnded?: boolean }): string {
  if (low === null || low === undefined) return 'Custom';
  if (high === null || high === undefined) return `${formatMoney(low)}+`;
  const suffix = opts?.openEnded ? '+' : '';
  if (high <= low) return `${formatMoney(low)}${suffix}`;
  return `${formatMoney(low)}–${formatMoney(high)}${suffix}`;
}

/** Headline one-time figure for a result: "$8,500–$12,000", "$15,500+", "Custom", or "—" with no lines. */
export function formatEstimateRange(result: EstimateResult): string {
  if (result.lines.length === 0) return '—';
  if (result.hasCustom && result.lines.every((line) => line.isCustom)) return 'Custom';
  return formatRange(result.oneTimeLow, result.oneTimeHigh, { openEnded: result.isOpenEnded });
}

/** "$1,000–$2,000 / month", or null when no support is selected. */
export function formatEstimateMonthly(result: EstimateResult): string | null {
  if (result.monthly.length === 0) return null;
  return `${formatRange(result.monthlyLow, result.monthlyHigh)} / month`;
}

export function formatLineRange(line: EstimateLine): string {
  return formatRange(line.low, line.high, { openEnded: line.isOpenEnded });
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                        */
/* ------------------------------------------------------------------ */

function setSize(size: EstimateSize, service: EstimateService, key: SizeKey): void {
  (size as Record<EstimateService, SizeKey>)[service] = key;
}

/**
 * Coerce any partial input into a valid EstimateInput: unknown services and
 * sizes are dropped, sizes for unselected services are removed, missing sizes
 * default to the first option, toggles keep only booleans. Idempotent.
 */
export function normalizeEstimateInput(input?: Partial<EstimateInput> | null): EstimateInput {
  const requested = Array.isArray(input?.services) ? input.services : DEFAULT_ESTIMATE_INPUT.services;
  const selected = ESTIMATE_SERVICES.filter((service) => requested.includes(service));

  const size: EstimateSize = {};
  for (const service of selected) {
    const candidate = input?.size?.[service];
    setSize(size, service, isSizeFor(service, candidate) ? candidate : SIZE_OPTIONS[service][0].key);
  }

  const toggles: EstimateToggles = {};
  for (const option of TOGGLE_OPTIONS) {
    const value = input?.toggles?.[option.key];
    if (typeof value === 'boolean') toggles[option.key] = value;
  }

  return {
    services: selected,
    size,
    toggles,
    support: isSupportLevel(input?.support) ? input.support : 'none',
    timeline: isTimeline(input?.timeline) ? input.timeline : 'standard',
  };
}

/* ------------------------------------------------------------------ */
/* Engine                                                               */
/* ------------------------------------------------------------------ */

/** Resolve one service line to a tier index, applying size then toggle bumps (never downgrades). */
export function resolveTier(service: EstimateService, size: SizeKey | undefined, toggles: EstimateToggles = {}): TierResolution {
  const tiers = tiersFor(service);
  const option = SIZE_OPTIONS[service].find((entry) => entry.key === size) ?? SIZE_OPTIONS[service][0];
  let index = Math.min(option.tierIndex, tiers.length - 1);
  const drivers: string[] = [`${option.label} → ${tiers[index].name}`];

  for (const toggle of TOGGLE_OPTIONS) {
    if (toggle.key === 'designSupplied') continue;
    if (!toggles[toggle.key]) continue;
    const min = TOGGLE_MIN_TIER[service][toggle.key];
    if (min === undefined) continue;
    if (min > index) {
      index = Math.min(min, tiers.length - 1);
      drivers.push(`${toggle.label} → ${tiers[index].name}`);
    } else {
      drivers.push(`${toggle.label} → included in ${tiers[index].name}`);
    }
  }

  if (service === 'web' && typeof toggles.designSupplied === 'boolean') {
    drivers.push(
      toggles.designSupplied
        ? 'Design supplied → we build pixel-perfect from your Figma, Sketch or XD files'
        : 'Design not supplied → we can collaborate with your team or connect you with a design partner',
    );
  }

  return { index, tier: tiers[index], drivers };
}

function buildLine(service: EstimateService, input: EstimateInput): EstimateLine {
  const tiers = tiersFor(service);
  const { index, tier, drivers } = resolveTier(service, input.size[service], input.toggles);
  const parsed = parsePriceLabel(tier.price);
  const startingAt = service === 'web';

  let low = parsed.low;
  let high = parsed.high;
  let isOpenEnded = parsed.openEnded;

  if (!parsed.isCustom && startingAt) {
    // Web tiers are "starting at" prices: the range runs to the next tier's start.
    const next = tiers[index + 1];
    const nextParsed = next ? parsePriceLabel(next.price) : null;
    high = nextParsed && !nextParsed.isCustom ? nextParsed.low : null;
    isOpenEnded = high === null;
  }

  if (parsed.isCustom) {
    low = null;
    high = null;
    isOpenEnded = false;
    drivers.push(`${tier.name} → Custom, ${FIXED_QUOTE_NOTE.toLowerCase()}`);
  }

  return {
    service,
    serviceName: SERVICE_META[service].label,
    tierName: tier.name,
    tierIndex: index,
    tierDescription: tier.description,
    features: [...tier.features],
    priceLabel: tier.price,
    startingAt,
    low,
    high,
    isOpenEnded,
    isCustom: parsed.isCustom,
    drivers,
  };
}

/** The recurring line a support level maps to for a service, or undefined for "none". */
export function supportLineFor(service: EstimateService, level: SupportLevel): EstimateMonthlyLine | undefined {
  if (level === 'none') return undefined;
  const lines = recurringLinesFor(service);
  const entry = lines[Math.min(SUPPORT_INDEX[service][level], lines.length - 1)];
  if (!entry) return undefined;
  const parsed = parsePriceLabel(entry.price);
  if (parsed.low === null) return undefined;
  return {
    service,
    serviceName: SERVICE_META[service].label,
    name: entry.name,
    priceLabel: entry.price,
    low: parsed.low,
    high: parsed.high ?? parsed.low,
    description: entry.description,
  };
}

/**
 * Partner bundle for a multi-service selection. Automation + tools only →
 * "Agency Automation Partner" (its features: automation & AI workflows,
 * internal tooling support); anything touching web or cloud → "Full Systems
 * Partner" (automation, tools, web, infrastructure).
 */
export function bundleFor(services: readonly EstimateService[]): EstimateBundle | undefined {
  if (services.length < 2) return undefined;
  const automationScope = services.every((service) => service === 'automation' || service === 'tools');
  const entry = pricing.bundles[automationScope ? 0 : 1] ?? pricing.bundles[pricing.bundles.length - 1];
  if (!entry) return undefined;
  const parsed = parsePriceLabel(entry.price);
  if (parsed.low === null) return undefined;
  return {
    name: entry.name,
    description: entry.description,
    price: entry.price,
    features: [...entry.features],
    low: parsed.low,
    high: parsed.high ?? parsed.low,
  };
}

/** Midpoint of the middle ("most popular") tier — the typical project value used by the referral estimator. */
export function typicalProjectValue(service: EstimateService): number {
  const tiers = tiersFor(service);
  const tier = tiers[Math.min(1, tiers.length - 1)];
  const parsed = parsePriceLabel(tier.price);
  if (parsed.low === null) return 0;
  return parsed.high === null ? parsed.low : (parsed.low + parsed.high) / 2;
}

/** Compute the estimate. Accepts a partial input; see `normalizeEstimateInput`. */
export function estimate(rawInput?: Partial<EstimateInput> | null): EstimateResult {
  const input = normalizeEstimateInput(rawInput);
  const lines = input.services.map((service) => buildLine(service, input));

  const priced = lines.filter((line) => !line.isCustom);
  const hasCustom = lines.some((line) => line.isCustom);
  const oneTimeLow = priced.reduce((sum, line) => sum + (line.low ?? 0), 0);
  const unbounded = hasCustom || priced.some((line) => line.high === null);
  const oneTimeHigh = unbounded ? null : priced.reduce((sum, line) => sum + (line.high ?? 0), 0);
  const isOpenEnded = priced.some((line) => line.isOpenEnded) || (hasCustom && priced.length > 0);

  const monthly = input.services
    .map((service) => supportLineFor(service, input.support))
    .filter((line): line is EstimateMonthlyLine => line !== undefined);
  const monthlyLow = monthly.reduce((sum, line) => sum + line.low, 0);
  const monthlyHigh = monthly.reduce((sum, line) => sum + line.high, 0);

  const bundle = bundleFor(input.services);

  const drivers: EstimateDriver[] = [];
  for (const line of lines) {
    line.drivers.forEach((text, i) => {
      drivers.push({ kind: i === 0 ? 'service' : 'addon', service: line.service, text: i === 0 ? `${line.serviceName}, ${text}` : text });
    });
  }
  if (monthly.length > 0) {
    const level = SUPPORT_LEVELS.find((entry) => entry.key === input.support);
    for (const line of monthly) {
      drivers.push({
        kind: 'support',
        service: line.service,
        text: `${level?.label ?? 'Ongoing'} support → ${line.name}, ${formatRange(line.low, line.high)} / month`,
      });
    }
  } else if (lines.length > 0) {
    drivers.push({ kind: 'support', text: 'No ongoing support selected' });
  }
  if (lines.length > 0) {
    drivers.push({
      kind: 'timeline',
      text:
        input.timeline === 'rush'
          ? `Rush timeline → billed at the emergency rate, ${pricing.hourlyRates.emergency}, on top of the range`
          : 'Standard timeline → no rush premium',
    });
  }
  if (bundle) {
    drivers.push({
      kind: 'bundle',
      text: `${lines.length} service lines selected → ${bundle.name} covers this as one monthly partnership, ${formatRange(bundle.low, bundle.high)} / month`,
    });
  }

  const notes: string[] = [FIXED_QUOTE_NOTE];
  if (input.timeline === 'rush') {
    notes.push(
      `Rush timeline: work outside the standard schedule is billed at the emergency rate, ${pricing.hourlyRates.emergency}, on top of the range`,
    );
  }
  for (const line of lines) {
    if (line.isCustom) notes.push(`${line.tierName} (${line.serviceName}) is quoted individually after the scoping call`);
  }

  return {
    input,
    lines,
    oneTimeLow,
    oneTimeHigh,
    isOpenEnded,
    hasCustom,
    monthly,
    monthlyLow,
    monthlyHigh,
    bundle,
    drivers,
    notes,
  };
}

/* ------------------------------------------------------------------ */
/* URL state                                                            */
/* ------------------------------------------------------------------ */

/**
 * Serialise an input to a query string (no leading "?"):
 * `svc=web,tools&size.web=growth&size.tools=portal&cms=1&support=growth&timeline=rush`.
 * Defaults ("none", "standard", unset toggles) are omitted.
 */
export function encodeEstimateParams(rawInput?: Partial<EstimateInput> | null): string {
  const input = normalizeEstimateInput(rawInput);
  const params = new URLSearchParams();
  if (input.services.length > 0) params.set('svc', input.services.join(','));
  for (const service of input.services) {
    const key = input.size[service];
    if (key) params.set(`size.${service}`, key);
  }
  for (const toggle of TOGGLE_OPTIONS) {
    const value = input.toggles[toggle.key];
    if (typeof value === 'boolean') params.set(toggle.param, value ? '1' : '0');
  }
  if (input.support !== 'none') params.set('support', input.support);
  if (input.timeline !== 'standard') params.set('timeline', input.timeline);
  return params.toString();
}

export type EstimateParamsSource =
  | string
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | null
  | undefined;

function toSearchParams(source: EstimateParamsSource): URLSearchParams {
  if (!source) return new URLSearchParams();
  if (source instanceof URLSearchParams) return source;
  if (typeof source === 'string') return new URLSearchParams(source.startsWith('?') ? source.slice(1) : source);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) value.forEach((entry) => params.append(key, entry));
    else if (typeof value === 'string') params.append(key, value);
  }
  return params;
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  const v = value.trim().toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes' || v === 'on') return true;
  if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false;
  return undefined;
}

/**
 * Parse a query string, URLSearchParams or Next `searchParams` object with
 * safe defaults. Accepts `svc=web,tools` or repeated `svc=`, service slugs as
 * aliases, namespaced `size.web=growth` or the legacy bare `size=growth`
 * (applied to every selected service it is valid for), and `1/0`, `true/false`
 * toggles. Anything unknown is ignored; no services → the default input.
 */
export function decodeEstimateParams(source: EstimateParamsSource): EstimateInput {
  const params = toSearchParams(source);

  const services: EstimateService[] = [];
  for (const raw of params.getAll('svc').flatMap((value) => value.split(','))) {
    const service = SERVICE_ALIASES[raw.trim().toLowerCase()];
    if (service && !services.includes(service)) services.push(service);
  }
  if (services.length === 0) return normalizeEstimateInput(DEFAULT_ESTIMATE_INPUT);

  const size: EstimateSize = {};
  const legacySize = params.get('size')?.trim().toLowerCase();
  for (const service of services) {
    const namespaced = params.get(`size.${service}`)?.trim().toLowerCase();
    if (isSizeFor(service, namespaced)) setSize(size, service, namespaced);
    else if (isSizeFor(service, legacySize)) setSize(size, service, legacySize);
  }

  const toggles: EstimateToggles = {};
  for (const [param, key] of Object.entries(TOGGLE_PARAM_ALIASES)) {
    const value = parseBoolean(params.get(param));
    if (value !== undefined) toggles[key] = value;
  }

  const support = params.get('support')?.trim().toLowerCase();
  const timeline = params.get('timeline')?.trim().toLowerCase();

  return normalizeEstimateInput({
    services,
    size,
    toggles,
    support: isSupportLevel(support) ? support : 'none',
    timeline: isTimeline(timeline) ? timeline : 'standard',
  });
}

/** `/pricing?svc=web&size.web=growth#estimator` — the "Refine" / "Continue" href for an input. */
export function estimateHref(
  rawInput: Partial<EstimateInput> | null | undefined,
  opts?: { path?: string; hash?: string | null },
): string {
  const path = opts?.path ?? '/pricing';
  const hash = opts?.hash === undefined ? 'estimator' : opts.hash;
  const query = encodeEstimateParams(rawInput);
  return `${path}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}

/* ------------------------------------------------------------------ */
/* Email                                                                */
/* ------------------------------------------------------------------ */

/** Subject line for the "Send this estimate" email. */
export function estimateSubjectText(result: EstimateResult): string {
  const services = result.lines.map((line) => line.serviceName).join(' + ') || 'Scope estimate';
  return `Scope estimate: ${services} · ${formatEstimateRange(result)}`;
}

/** Plain-text body for the "Send this estimate" email (POST /api/contact `message`). */
export function estimateSummaryText(result: EstimateResult, opts?: { shareUrl?: string }): string {
  const out: string[] = ['MAPL TECH scope estimate', ''];

  out.push(`One-time build: ${formatEstimateRange(result)}`);
  const monthly = formatEstimateMonthly(result);
  if (monthly) out.push(`Ongoing support: ${monthly}`);
  out.push('');

  for (const line of result.lines) {
    const price = line.isCustom
      ? 'Custom'
      : line.startingAt
        ? `${formatLineRange(line)}, starting at ${line.priceLabel}`
        : formatLineRange(line);
    out.push(`${line.serviceName} — ${line.tierName} (${price})`);
    for (const driver of line.drivers) out.push(`  - ${driver}`);
    out.push('');
  }

  const support = result.drivers.filter((driver) => driver.kind === 'support');
  if (support.length > 0) {
    out.push('Support');
    for (const driver of support) out.push(`  - ${driver.text}`);
    out.push('');
  }

  const timeline = result.drivers.find((driver) => driver.kind === 'timeline');
  if (timeline) {
    out.push('Timeline', `  - ${timeline.text}`, '');
  }

  if (result.bundle) {
    out.push(`Partner bundle: ${result.bundle.name}, ${formatRange(result.bundle.low, result.bundle.high)} / month`, '');
  }

  out.push('Notes');
  for (const note of result.notes) out.push(`  - ${note}`);

  if (opts?.shareUrl) out.push('', `Shareable link: ${opts.shareUrl}`);

  return out.join('\n');
}
