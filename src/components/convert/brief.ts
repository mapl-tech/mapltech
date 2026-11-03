import { pricing, siteConfig } from '@/config/site';
import {
  SERVICE_META,
  SIZE_OPTIONS,
  SUPPORT_LEVELS,
  decodeEstimateParams,
  estimateHref,
  isEstimateService,
  parsePriceLabel,
  resolveTier,
  tiersFor,
  type EstimateInput,
  type EstimateService,
  type SizeKey,
} from '@/lib/estimate';

/**
 * The contact brief, as data: the answers people can give, the prefill read
 * from links into /contact-us (the estimator's ?svc=&size.<svc>=&support=
 * &timeline= and the pricing page's ?bundle=), and the subject and message
 * the brief becomes. Pure functions only, so the island stays thin and the
 * same code composes the preview, the email and the confirmation.
 *
 * The payload contract is /api/contact's: { name, email, phone?,
 * contactMethod?, subject?, message }.
 */

export type BriefKind = EstimateService | 'partner' | 'unsure';
export type ReplyMethod = 'email' | 'phone';

export const UNSURE = 'unsure';

export interface ChoiceOption {
  key: string;
  label: string;
  /** Secondary line: the tier a size maps to, or a plain note. */
  detail?: string;
  /** Public price, already formatted ("From $5,000", "$3,500–$5,000"). */
  price?: string;
}

/** Canonical service names (SERVICE_META), plus the monthly partnership and "not sure". */
const KIND_LABEL: Record<BriefKind, string> = {
  web: SERVICE_META.web.label,
  automation: SERVICE_META.automation.label,
  tools: SERVICE_META.tools.label,
  cloud: SERVICE_META.cloud.label,
  partner: 'Monthly partnership',
  unsure: 'Not sure yet',
};

function money(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

/** "$3,500-$5,000" → "$3,500–$5,000"; "/month" → " a month". */
export function displayPrice(label: string): string {
  return label.replace(/-/g, '–').replace(/\s*\/\s*month/i, ' a month');
}

function lowest(labels: readonly string[]): number | null {
  const lows = labels.map((label) => parsePriceLabel(label).low).filter((n): n is number => typeof n === 'number');
  return lows.length ? Math.min(...lows) : null;
}

function serviceFrom(service: EstimateService): string {
  const low = lowest(tiersFor(service).map((tier) => tier.price));
  return low === null ? 'Custom quote' : `From ${money(low)}`;
}

const partnerLow = lowest(pricing.bundles.map((bundle) => bundle.price));

/** Step 1: what are we building? Every option carries its real public floor price. */
export const KIND_OPTIONS: readonly ChoiceOption[] = [
  ...(['web', 'automation', 'tools', 'cloud'] as const).map((service) => ({
    key: service,
    label: KIND_LABEL[service],
    price: serviceFrom(service),
  })),
  {
    key: 'partner',
    label: KIND_LABEL.partner,
    price: partnerLow === null ? undefined : `From ${money(partnerLow)} a month`,
  },
  { key: 'unsure', label: KIND_LABEL.unsure, detail: 'Tell us the goal in step 3' },
];

export function kindLabel(kind: BriefKind): string {
  return KIND_LABEL[kind];
}

export function isBriefKind(value: unknown): value is BriefKind {
  return typeof value === 'string' && value in KIND_LABEL;
}

export function bundleSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tierPrice(service: EstimateService, price: string): string {
  if (price === 'Custom') return 'Custom quote';
  return service === 'web' ? `From ${displayPrice(price)}` : displayPrice(price);
}

/** Step 2 options for a kind (none for "not sure yet"). */
export function sizeOptions(kind: BriefKind | null): readonly ChoiceOption[] {
  if (!kind || kind === 'unsure') return [];
  const open: ChoiceOption = { key: UNSURE, label: 'Not sure yet', detail: 'Leave it open' };
  if (kind === 'partner') {
    return [
      ...pricing.bundles.map((bundle) => ({
        key: bundleSlug(bundle.name),
        label: bundle.name,
        detail: bundle.features.slice(0, 2).join(', '),
        price: displayPrice(bundle.price),
      })),
      open,
    ];
  }
  const tiers = tiersFor(kind);
  return [
    ...SIZE_OPTIONS[kind].map((option) => {
      const tier = tiers[Math.min(option.tierIndex, tiers.length - 1)];
      return { key: option.key, label: option.label, detail: tier.name, price: tierPrice(kind, tier.price) };
    }),
    open,
  ];
}

export function sizeQuestion(kind: BriefKind | null): string {
  return kind === 'partner' ? 'Which plan fits?' : 'How big is it?';
}

// ---------------------------------------------------------------- prefill

export interface BriefPrefill {
  kind: BriefKind;
  size?: string;
  /** Every service the estimate carried (the first is the brief's kind). */
  services: readonly EstimateService[];
  input?: EstimateInput;
  source: 'estimate' | 'service' | 'bundle';
}

/** Read a /contact-us query string. Unknown values are ignored. */
export function readPrefill(search: string): BriefPrefill | null {
  if (!search) return null;
  const params = new URLSearchParams(search);

  const bundle = params.get('bundle');
  if (bundle) {
    const match = pricing.bundles.find((entry) => bundleSlug(entry.name) === bundle.trim().toLowerCase());
    if (match) return { kind: 'partner', size: bundleSlug(match.name), services: [], source: 'bundle' };
  }

  if (!params.has('svc')) return null;
  const input = decodeEstimateParams(search);
  const [first] = input.services;
  if (!first || !isEstimateService(first)) return null;
  const sized = params.has('size') || input.services.some((service) => params.has(`size.${service}`));
  return {
    kind: first,
    size: sized ? input.size[first] : undefined,
    services: input.services,
    input,
    source: sized ? 'estimate' : 'service',
  };
}

// ---------------------------------------------------------------- compose

export interface BriefAnswers {
  kind: BriefKind | null;
  size: string | null;
  details: string;
  name: string;
  email: string;
  company: string;
  reply: ReplyMethod;
  phone: string;
}

export interface BriefLine {
  label: string;
  value: string;
}

function sizeLine(kind: BriefKind, size: string | null, prefill: BriefPrefill | null): string | null {
  if (kind === 'unsure') return null;
  if (!size || size === UNSURE) return 'Not sure yet';
  if (kind === 'partner') {
    const bundle = pricing.bundles.find((entry) => bundleSlug(entry.name) === size);
    return bundle ? `${bundle.name} (${displayPrice(bundle.price)})` : null;
  }
  const option = SIZE_OPTIONS[kind].find((entry) => entry.key === size);
  if (!option) return null;
  // Estimator add-ons (CMS, e-commerce, auth...) can lift the tier; honour them while the answer still matches.
  const toggles = prefill?.input && prefill.kind === kind && prefill.size === size ? prefill.input.toggles : {};
  const { tier } = resolveTier(kind, size as SizeKey, toggles);
  return `${option.label}: ${tier.name}, ${tierPrice(kind, tier.price).replace(/^From/, 'from')}`;
}

/** The answers as labelled lines: the preview rows, the email body and the confirmation all use these. */
export function briefLines(answers: BriefAnswers, prefill: BriefPrefill | null): BriefLine[] {
  const lines: BriefLine[] = [];
  const { kind } = answers;
  if (!kind) return lines;
  const estimateApplies = prefill?.source === 'estimate' && prefill.kind === kind && prefill.size === answers.size;

  // The canonical service name is added in brackets only when the answer's own
  // label differs from it (they are the same today, which read "Web Development (Web Development)").
  lines.push({
    label: 'Building',
    value:
      isEstimateService(kind) && KIND_LABEL[kind] !== SERVICE_META[kind].label
        ? `${KIND_LABEL[kind]} (${SERVICE_META[kind].label})`
        : KIND_LABEL[kind],
  });
  const size = sizeLine(kind, answers.size, prefill);
  if (size) lines.push({ label: kind === 'partner' ? 'Plan' : 'Size', value: size });

  if (estimateApplies && prefill?.input) {
    const others = prefill.services.slice(1).map((service) => {
      const option = SIZE_OPTIONS[service].find((entry) => entry.key === prefill.input?.size[service]);
      const { tier } = resolveTier(service, prefill.input?.size[service], prefill.input?.toggles);
      return `${SERVICE_META[service].label}${option ? `, ${option.label}` : ''} (${tier.name})`;
    });
    if (others.length) lines.push({ label: 'Also in the estimate', value: others.join('; ') });
    if (prefill.input.timeline === 'rush') {
      lines.push({ label: 'Timeline', value: `Rush, billed at the emergency rate (${pricing.hourlyRates.emergency})` });
    }
    if (prefill.input.support !== 'none') {
      const level = SUPPORT_LEVELS.find((entry) => entry.key === prefill.input?.support);
      lines.push({ label: 'Ongoing support', value: level?.label ?? prefill.input.support });
    }
  }
  return lines;
}

export interface ComposedBrief {
  subject: string;
  message: string;
}

export function composeBrief(answers: BriefAnswers, prefill: BriefPrefill | null): ComposedBrief {
  const kind = answers.kind ?? 'unsure';
  const lines = briefLines({ ...answers, kind }, prefill);
  const size = lines.find((line) => line.label === 'Size' || line.label === 'Plan');
  const subject = size ? `Brief: ${KIND_LABEL[kind]}, ${size.value}` : `Brief: ${KIND_LABEL[kind]}`;

  const body: string[] = ['Project brief from mapltech.com/contact-us', ''];
  for (const line of lines) body.push(`${line.label}: ${line.value}`);
  if (prefill?.source === 'estimate' && prefill.input && prefill.kind === kind && prefill.size === answers.size) {
    body.push(`Estimate link: ${siteConfig.url}${estimateHref(prefill.input)}`);
  }
  body.push(`Reply by: ${answers.reply === 'phone' ? `phone call (${answers.phone})` : 'email'}`);
  if (answers.company) body.push(`Agency or company: ${answers.company}`);
  body.push('', 'Details:', answers.details.trim() || 'No details added.');

  return { subject, message: body.join('\n') };
}

/** The estimator, opened on what the brief describes (services keep their size). */
export function estimateLinkFor(answers: Pick<BriefAnswers, 'kind' | 'size'>): string {
  const { kind, size } = answers;
  if (!kind || !isEstimateService(kind)) return estimateHref(null);
  const sized = size && size !== UNSURE && SIZE_OPTIONS[kind].some((entry) => entry.key === size);
  return estimateHref({ services: [kind], size: sized ? { [kind]: size as SizeKey } : undefined });
}
