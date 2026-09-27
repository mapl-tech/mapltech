import { describe, expect, it } from 'vitest';
import { labsProjects, portfolioProjects, pricing } from '@/config/site';
import { services, getService, getServiceByEstimateKey, SERVICE_SLUGS } from '@/config/services';
import { slugify } from '@/lib/schema';
import {
  DEFAULT_ESTIMATE_INPUT,
  ESTIMATE_SERVICES,
  FIXED_QUOTE_NOTE,
  SIZE_OPTIONS,
  SUPPORT_LEVELS,
  TOGGLE_OPTIONS,
  bundleFor,
  decodeEstimateParams,
  encodeEstimateParams,
  estimate,
  estimateHref,
  estimateSubjectText,
  estimateSummaryText,
  formatEstimateMonthly,
  formatEstimateRange,
  formatMoney,
  formatRange,
  normalizeEstimateInput,
  parsePriceLabel,
  resolveTier,
  supportLineFor,
  tiersFor,
  typicalProjectValue,
  type EstimateInput,
  type EstimateService,
  type SizeKey,
} from '@/lib/estimate';

const one = (service: EstimateService, size: SizeKey, extra: Partial<EstimateInput> = {}): Partial<EstimateInput> => ({
  services: [service],
  size: { [service]: size } as EstimateInput['size'],
  ...extra,
});

/* ------------------------------------------------------------------ */
/* §2.3 mapping table                                                   */
/* ------------------------------------------------------------------ */

describe('service × size → tier (synthesis §2.3)', () => {
  it.each<[EstimateService, SizeKey, string, number | null, number | null, boolean]>([
    // Web: "starting at" prices → range to the next tier's start
    ['web', 'starter', 'Starter', 5000, 8500, false],
    ['web', 'growth', 'Growth / E-Commerce', 8500, 12000, false],
    ['web', 'advanced', 'Advanced / AI-Powered', 12000, null, false],
    ['web', 'enterprise', 'Enterprise', null, null, true],
    // Automation: $3,500–5,000 / $6,000–10,000 / $10,000–18,000
    ['automation', 'foundation', 'Foundation Automation', 3500, 5000, false],
    ['automation', 'advanced', 'Advanced Automation', 6000, 10000, false],
    ['automation', 'enterprise', 'Enterprise AI Workflows', 10000, 18000, false],
    // Tools: $5,000–8,000 / $8,000–15,000 / $12,000–25,000+
    ['tools', 'dashboard', 'Internal Dashboards', 5000, 8000, false],
    ['tools', 'portal', 'Client Portals', 8000, 15000, false],
    ['tools', 'ops', 'Ops & Reporting Systems', 12000, 25000, false],
    // Cloud: $5,000–8,000 / $10,000–18,000 / $20,000+
    ['cloud', 'starter', 'Starter Cloud Setup', 5000, 8000, false],
    ['cloud', 'production', 'Production Infrastructure', 10000, 18000, false],
    ['cloud', 'enterprise', 'Enterprise Cloud Platform', 20000, null, false],
  ])('%s / %s → %s', (service, size, tierName, low, high, isCustom) => {
    const result = estimate(one(service, size));
    expect(result.lines).toHaveLength(1);
    const line = result.lines[0];
    expect(line.tierName).toBe(tierName);
    expect(line.low).toBe(low);
    expect(line.high).toBe(high);
    expect(line.isCustom).toBe(isCustom);
    expect(line.priceLabel).toBe(tiersFor(service)[line.tierIndex].price);
  });

  it('every size option points at a real tier in site.ts', () => {
    for (const service of ESTIMATE_SERVICES) {
      const tiers = tiersFor(service);
      expect(SIZE_OPTIONS[service]).toHaveLength(tiers.length);
      for (const option of SIZE_OPTIONS[service]) {
        expect(tiers[option.tierIndex]).toBeDefined();
      }
    }
  });

  it('marks open-ended tiers and prints them with a trailing plus', () => {
    const ops = estimate(one('tools', 'ops')).lines[0];
    expect(ops.isOpenEnded).toBe(true);
    expect(formatEstimateRange(estimate(one('tools', 'ops')))).toBe('$12,000–$25,000+');

    const cloudEnterprise = estimate(one('cloud', 'enterprise'));
    expect(cloudEnterprise.lines[0].isOpenEnded).toBe(true);
    expect(formatEstimateRange(cloudEnterprise)).toBe('$20,000+');

    const webAdvanced = estimate(one('web', 'advanced'));
    expect(formatEstimateRange(webAdvanced)).toBe('$12,000+');
  });

  it('web tiers are flagged as starting-at prices and keep the site.ts label', () => {
    const line = estimate(one('web', 'growth')).lines[0];
    expect(line.startingAt).toBe(true);
    expect(line.priceLabel).toBe('$8,500');
    expect(line.features).toEqual(pricing.webDevelopment.tiers[1].features);
  });

  it('Enterprise web is Custom: no numbers, hasCustom, headline "Custom"', () => {
    const result = estimate(one('web', 'enterprise'));
    expect(result.hasCustom).toBe(true);
    expect(result.oneTimeLow).toBe(0);
    expect(result.oneTimeHigh).toBeNull();
    expect(formatEstimateRange(result)).toBe('Custom');
    expect(result.notes.some((note) => /quoted individually/.test(note))).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* Toggles                                                              */
/* ------------------------------------------------------------------ */

describe('toggles bump tiers, never downgrade', () => {
  it('CMS or e-commerce pull a web Starter up to Growth', () => {
    expect(resolveTier('web', 'starter', { cms: true }).tier.name).toBe('Growth / E-Commerce');
    expect(resolveTier('web', 'starter', { ecommerce: true }).tier.name).toBe('Growth / E-Commerce');
  });

  it('auth or AI pull web up to Advanced', () => {
    expect(resolveTier('web', 'growth', { auth: true }).tier.name).toBe('Advanced / AI-Powered');
    expect(resolveTier('web', 'starter', { ai: true }).tier.name).toBe('Advanced / AI-Powered');
  });

  it('compliance makes web Enterprise (Custom)', () => {
    const result = estimate(one('web', 'starter', { toggles: { compliance: true } }));
    expect(result.lines[0].tierName).toBe('Enterprise');
    expect(result.lines[0].isCustom).toBe(true);
    expect(result.hasCustom).toBe(true);
  });

  it('a toggle already covered by the size is reported as included, not a bump', () => {
    const { tier, drivers } = resolveTier('web', 'advanced', { cms: true });
    expect(tier.name).toBe('Advanced / AI-Powered');
    expect(drivers).toContain('CMS integration (headless or WordPress) → included in Advanced / AI-Powered');
  });

  it('toggles never lower a tier', () => {
    expect(resolveTier('web', 'enterprise', { cms: true, ecommerce: true }).tier.name).toBe('Enterprise');
  });

  it('AI features pull automation up to Advanced Automation', () => {
    expect(resolveTier('automation', 'foundation', { ai: true }).tier.name).toBe('Advanced Automation');
  });

  it('compliance lands on the top tier for automation, tools and cloud', () => {
    expect(resolveTier('automation', 'foundation', { compliance: true }).tier.name).toBe('Enterprise AI Workflows');
    expect(resolveTier('tools', 'dashboard', { compliance: true }).tier.name).toBe('Ops & Reporting Systems');
    expect(resolveTier('cloud', 'starter', { compliance: true }).tier.name).toBe('Enterprise Cloud Platform');
  });

  it('web-only toggles do not touch other services', () => {
    expect(resolveTier('cloud', 'starter', { cms: true, ecommerce: true, auth: true }).tier.name).toBe('Starter Cloud Setup');
    expect(resolveTier('automation', 'foundation', { cms: true }).drivers).toHaveLength(1);
  });

  it('auth on tools is included from Internal Dashboards (role-based access control)', () => {
    const { tier, drivers } = resolveTier('tools', 'dashboard', { auth: true });
    expect(tier.name).toBe('Internal Dashboards');
    expect(drivers).toContain('User authentication & roles → included in Internal Dashboards');
  });

  it('design supplied only annotates web and never changes the tier', () => {
    const supplied = resolveTier('web', 'starter', { designSupplied: true });
    expect(supplied.tier.name).toBe('Starter');
    expect(supplied.drivers.at(-1)).toMatch(/pixel-perfect from your Figma, Sketch or XD/);
    const notSupplied = resolveTier('web', 'starter', { designSupplied: false });
    expect(notSupplied.drivers.at(-1)).toMatch(/design partner/);
    expect(resolveTier('tools', 'dashboard', { designSupplied: true }).drivers).toHaveLength(1);
  });

  it('every toggle option applies to at least one service and has a unique URL param', () => {
    const params = TOGGLE_OPTIONS.map((toggle) => toggle.param);
    expect(new Set(params).size).toBe(params.length);
    for (const toggle of TOGGLE_OPTIONS) expect(toggle.appliesTo.length).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ */
/* Support add-ons                                                      */
/* ------------------------------------------------------------------ */

describe('ongoing support maps to the matching maintenance / retainer line', () => {
  it.each<[EstimateService, 'light' | 'growth' | 'priority', string, number, number]>([
    ['web', 'light', 'Essential Care', 500, 500],
    ['web', 'growth', 'Growth Support', 1000, 2000],
    ['web', 'priority', 'Priority Retainer', 2500, 5000],
    ['automation', 'light', 'Light Monitoring & Tweaks', 750, 750],
    ['automation', 'growth', 'Ongoing Optimization', 1500, 2500],
    ['automation', 'priority', 'Priority / Multi-Client', 3000, 5000],
    ['tools', 'light', 'Feature Updates', 1000, 2000],
    ['tools', 'growth', 'Feature Updates', 1000, 2000],
    ['tools', 'priority', 'Dedicated Dev Time', 3000, 6000],
    ['cloud', 'light', 'Infrastructure Monitoring', 1000, 2000],
    ['cloud', 'growth', 'Infrastructure Monitoring', 1000, 2000],
    ['cloud', 'priority', 'Managed Cloud Operations', 3000, 6000],
  ])('%s / %s → %s', (service, level, name, low, high) => {
    const line = supportLineFor(service, level);
    expect(line?.name).toBe(name);
    expect(line?.low).toBe(low);
    expect(line?.high).toBe(high);
  });

  it('"none" adds no monthly line', () => {
    const result = estimate(one('web', 'starter', { support: 'none' }));
    expect(result.monthly).toHaveLength(0);
    expect(result.monthlyLow).toBe(0);
    expect(formatEstimateMonthly(result)).toBeNull();
    expect(result.drivers.some((driver) => driver.kind === 'support' && /No ongoing support/.test(driver.text))).toBe(true);
  });

  it('monthly totals sum across selected services', () => {
    const result = estimate({
      services: ['web', 'automation'],
      size: { web: 'growth', automation: 'foundation' },
      support: 'growth',
    });
    expect(result.monthly.map((line) => line.name)).toEqual(['Growth Support', 'Ongoing Optimization']);
    expect(result.monthlyLow).toBe(2500);
    expect(result.monthlyHigh).toBe(4500);
    expect(formatEstimateMonthly(result)).toBe('$2,500–$4,500 / month');
  });

  it('exposes every support level for the chips', () => {
    expect(SUPPORT_LEVELS.map((level) => level.key)).toEqual(['none', 'light', 'growth', 'priority']);
  });
});

/* ------------------------------------------------------------------ */
/* Totals, bundles, notes                                               */
/* ------------------------------------------------------------------ */

describe('totals', () => {
  it('sums lows and highs across priced lines', () => {
    const result = estimate({ services: ['web', 'automation'], size: { web: 'growth', automation: 'foundation' } });
    expect(result.oneTimeLow).toBe(12000);
    expect(result.oneTimeHigh).toBe(17000);
    expect(formatEstimateRange(result)).toBe('$12,000–$17,000');
  });

  it('a custom line beside priced lines makes the total open-ended', () => {
    const result = estimate({ services: ['web', 'automation'], size: { web: 'enterprise', automation: 'foundation' } });
    expect(result.hasCustom).toBe(true);
    expect(result.oneTimeLow).toBe(3500);
    expect(result.oneTimeHigh).toBeNull();
    expect(formatEstimateRange(result)).toBe('$3,500+');
  });

  it('an unbounded line makes the total open-ended', () => {
    const result = estimate({ services: ['web', 'cloud'], size: { web: 'starter', cloud: 'enterprise' } });
    expect(result.oneTimeLow).toBe(25000);
    expect(result.oneTimeHigh).toBeNull();
    expect(formatEstimateRange(result)).toBe('$25,000+');
  });

  it('with no services there are no lines and the headline is a dash', () => {
    const result = estimate({ services: [] });
    expect(result.lines).toHaveLength(0);
    expect(formatEstimateRange(result)).toBe('—');
    expect(result.bundle).toBeUndefined();
  });
});

describe('partner bundles surface with two or more services', () => {
  it('a single service has no bundle', () => {
    expect(estimate(one('web', 'starter')).bundle).toBeUndefined();
    expect(bundleFor(['automation'])).toBeUndefined();
  });

  it('automation + tools → Agency Automation Partner', () => {
    const bundle = estimate({ services: ['automation', 'tools'] }).bundle;
    expect(bundle?.name).toBe('Agency Automation Partner');
    expect(bundle?.price).toBe(pricing.bundles[0].price);
    expect(bundle?.low).toBe(4000);
    expect(bundle?.high).toBe(7500);
  });

  it('anything touching web or cloud → Full Systems Partner', () => {
    expect(estimate({ services: ['web', 'tools'] }).bundle?.name).toBe('Full Systems Partner');
    expect(estimate({ services: ['automation', 'cloud'] }).bundle?.name).toBe('Full Systems Partner');
    const all = estimate({ services: ['web', 'automation', 'tools', 'cloud'] });
    expect(all.bundle?.price).toBe(pricing.bundles[1].price);
    expect(all.drivers.at(-1)?.kind).toBe('bundle');
  });
});

describe('notes and drivers', () => {
  it('always carries the fixed-quote line', () => {
    expect(estimate(one('web', 'starter')).notes[0]).toBe(FIXED_QUOTE_NOTE);
    expect(FIXED_QUOTE_NOTE).toBe('Fixed quote after a 20-min scoping call');
  });

  it('rush adds the emergency hourly rate from site.ts; standard does not', () => {
    const rush = estimate(one('web', 'starter', { timeline: 'rush' }));
    expect(rush.notes.some((note) => note.includes(pricing.hourlyRates.emergency))).toBe(true);
    expect(rush.drivers.find((driver) => driver.kind === 'timeline')?.text).toContain('$150+/hour');

    const standard = estimate(one('web', 'starter'));
    expect(standard.notes.some((note) => note.includes(pricing.hourlyRates.emergency))).toBe(false);
    expect(standard.drivers.find((driver) => driver.kind === 'timeline')?.text).toBe('Standard timeline → no rush premium');
  });

  it('the "What drove this" list reads service → add-ons → support → timeline', () => {
    const result = estimate(one('web', 'growth', { toggles: { cms: true, designSupplied: true }, support: 'growth' }));
    expect(result.drivers.map((driver) => driver.kind)).toEqual(['service', 'addon', 'addon', 'support', 'timeline']);
    expect(result.drivers[0].text).toBe('Web Development, 8–12 pages → Growth / E-Commerce');
    expect(result.drivers[3].text).toBe('Growth support → Growth Support, $1,000–$2,000 / month');
  });
});

/* ------------------------------------------------------------------ */
/* URL state                                                            */
/* ------------------------------------------------------------------ */

describe('encode / decode', () => {
  it('round-trips a full input', () => {
    const input: EstimateInput = {
      services: ['web', 'tools'],
      size: { web: 'growth', tools: 'portal' },
      toggles: { cms: true, designSupplied: false },
      support: 'growth',
      timeline: 'rush',
    };
    const encoded = encodeEstimateParams(input);
    expect(encoded).toBe('svc=web%2Ctools&size.web=growth&size.tools=portal&cms=1&design=0&support=growth&timeline=rush');
    expect(decodeEstimateParams(encoded)).toEqual(input);
    expect(decodeEstimateParams(`?${encoded}`)).toEqual(input);
    expect(decodeEstimateParams(new URLSearchParams(encoded))).toEqual(input);
  });

  it('omits defaults so the shareable URL stays short', () => {
    expect(encodeEstimateParams({ services: ['web'] })).toBe('svc=web&size.web=starter');
    expect(encodeEstimateParams(DEFAULT_ESTIMATE_INPUT)).toBe('svc=web&size.web=starter');
  });

  it('falls back to the default input on empty or unknown params', () => {
    expect(decodeEstimateParams('')).toEqual(DEFAULT_ESTIMATE_INPUT);
    expect(decodeEstimateParams(null)).toEqual(DEFAULT_ESTIMATE_INPUT);
    expect(decodeEstimateParams('svc=bogus&size.web=huge&support=platinum&timeline=yesterday')).toEqual(DEFAULT_ESTIMATE_INPUT);
  });

  it('reads the legacy bare size, comma and repeated svc, slug aliases and Next searchParams objects', () => {
    expect(decodeEstimateParams('svc=automation&size=foundation&support=none')).toEqual({
      services: ['automation'],
      size: { automation: 'foundation' },
      toggles: {},
      support: 'none',
      timeline: 'standard',
    });
    // bare size applies to every selected service it is valid for
    expect(decodeEstimateParams('svc=web,cloud&size=enterprise').size).toEqual({ web: 'enterprise', cloud: 'enterprise' });
    expect(decodeEstimateParams('svc=web&svc=tools').services).toEqual(['web', 'tools']);
    expect(decodeEstimateParams('svc=web-development,custom-internal-tools').services).toEqual(['web', 'tools']);
    expect(decodeEstimateParams({ svc: ['tools', 'web'], 'size.tools': 'ops', cms: 'true', ecom: 'off' })).toEqual({
      services: ['web', 'tools'],
      size: { web: 'starter', tools: 'ops' },
      toggles: { cms: true, ecommerce: false },
      support: 'none',
      timeline: 'standard',
    });
  });

  it('normalises services into canonical order and drops sizes for unselected services', () => {
    const normalized = normalizeEstimateInput({
      services: ['cloud', 'web', 'web'],
      size: { web: 'growth', automation: 'advanced' },
      toggles: { ai: true, cms: undefined },
    });
    expect(normalized.services).toEqual(['web', 'cloud']);
    expect(normalized.size).toEqual({ web: 'growth', cloud: 'starter' });
    expect(normalized.toggles).toEqual({ ai: true });
    expect(normalizeEstimateInput(normalized)).toEqual(normalized);
  });

  it('builds the Refine / Continue hrefs', () => {
    expect(estimateHref({ services: ['web'], size: { web: 'growth' }, toggles: { cms: true } })).toBe(
      '/pricing?svc=web&size.web=growth&cms=1#estimator',
    );
    expect(estimateHref({ services: ['automation'] }, { path: '/contact-us', hash: null })).toBe(
      '/contact-us?svc=automation&size.automation=foundation',
    );
  });
});

/* ------------------------------------------------------------------ */
/* Formatting                                                           */
/* ------------------------------------------------------------------ */

describe('formatRange / formatMoney / parsePriceLabel', () => {
  it('formats the documented cases', () => {
    expect(formatRange(5000, 8000)).toBe('$5,000–$8,000');
    expect(formatRange(20000, null)).toBe('$20,000+');
    expect(formatRange(20000)).toBe('$20,000+');
    expect(formatRange(null)).toBe('Custom');
    expect(formatRange(null, 5000)).toBe('Custom');
    expect(formatRange(500, 500)).toBe('$500');
    expect(formatRange(12000, 25000, { openEnded: true })).toBe('$12,000–$25,000+');
    expect(formatMoney(1234567)).toBe('$1,234,567');
    expect(formatMoney(0)).toBe('$0');
  });

  it('parses every price label in site.ts without throwing', () => {
    const labels = [
      ...Object.values(pricing.hourlyRates),
      ...pricing.bundles.map((bundle) => bundle.price),
      ...pricing.webDevelopment.maintenance.map((line) => line.price),
    ];
    for (const service of ESTIMATE_SERVICES) labels.push(...tiersFor(service).map((tier) => tier.price));
    for (const label of labels) {
      const parsed = parsePriceLabel(label);
      if (label === 'Custom') expect(parsed.isCustom).toBe(true);
      else expect(parsed.low).toBeGreaterThan(0);
    }
    expect(parsePriceLabel('$3,500-$5,000')).toEqual({ low: 3500, high: 5000, openEnded: false, isCustom: false, unit: 'once' });
    expect(parsePriceLabel('$12,000-$25,000+')).toEqual({ low: 12000, high: 25000, openEnded: true, isCustom: false, unit: 'once' });
    expect(parsePriceLabel('$20,000+')).toEqual({ low: 20000, high: null, openEnded: true, isCustom: false, unit: 'once' });
    expect(parsePriceLabel('$500/month')).toEqual({ low: 500, high: 500, openEnded: false, isCustom: false, unit: 'month' });
    expect(parsePriceLabel('$150+/hour')).toEqual({ low: 150, high: null, openEnded: true, isCustom: false, unit: 'hour' });
    expect(parsePriceLabel('Custom').isCustom).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/* Email text                                                           */
/* ------------------------------------------------------------------ */

describe('estimateSummaryText / estimateSubjectText', () => {
  it('writes a plain-text body with every driver, note and the share link', () => {
    const result = estimate(one('web', 'growth', { toggles: { cms: true }, support: 'growth', timeline: 'rush' }));
    const text = estimateSummaryText(result, { shareUrl: 'https://mapltech.com/pricing?svc=web&size.web=growth&cms=1#estimator' });
    expect(text.startsWith('MAPL TECH scope estimate')).toBe(true);
    expect(text).toContain('One-time build: $8,500–$12,000');
    expect(text).toContain('Ongoing support: $1,000–$2,000 / month');
    expect(text).toContain('Web Development — Growth / E-Commerce ($8,500–$12,000, starting at $8,500)');
    expect(text).toContain('  - CMS integration (headless or WordPress) → included in Growth / E-Commerce');
    expect(text).toContain('  - Growth support → Growth Support, $1,000–$2,000 / month');
    expect(text).toContain(FIXED_QUOTE_NOTE);
    expect(text).toContain(pricing.hourlyRates.emergency);
    expect(text.trim().endsWith('Shareable link: https://mapltech.com/pricing?svc=web&size.web=growth&cms=1#estimator')).toBe(true);
  });

  it('subject names the services and the headline range', () => {
    expect(estimateSubjectText(estimate({ services: ['web', 'tools'], size: { web: 'starter', tools: 'dashboard' } }))).toBe(
      'Scope estimate: Web Development + Custom Internal Tools · $10,000–$16,500',
    );
  });
});

/* ------------------------------------------------------------------ */
/* Referral helper                                                      */
/* ------------------------------------------------------------------ */

describe('typicalProjectValue', () => {
  it('is the midpoint of the middle tier', () => {
    expect(typicalProjectValue('web')).toBe(8500);
    expect(typicalProjectValue('automation')).toBe(8000);
    expect(typicalProjectValue('tools')).toBe(11500);
    expect(typicalProjectValue('cloud')).toBe(14000);
  });
});

/* ------------------------------------------------------------------ */
/* Shared config                                                        */
/* ------------------------------------------------------------------ */

describe('site.ts slugs', () => {
  it('every project slug is the kebab-case of its title and unique within its list', () => {
    const portfolioSlugs = portfolioProjects.map((project) => project.slug);
    expect(new Set(portfolioSlugs).size).toBe(portfolioSlugs.length);
    for (const project of portfolioProjects) expect(project.slug).toBe(slugify(project.title));

    const labSlugs = labsProjects.map((project) => project.slug);
    expect(new Set(labSlugs).size).toBe(labSlugs.length);
    for (const project of labsProjects) expect(project.slug).toBe(slugify(project.name));
  });
});

describe('services.ts', () => {
  it('has one record per service line, wired to pricing and the estimator', () => {
    expect(SERVICE_SLUGS).toEqual(['web-development', 'automation-ai-workflow-setup', 'custom-internal-tools', 'cloud-engineering']);
    expect(services.map((service) => service.estimateKey)).toEqual(ESTIMATE_SERVICES);
    for (const record of services) {
      expect(record.path).toBe(`/services/${record.slug}`);
      expect(pricing[record.pricingKey].tiers.length).toBeGreaterThan(0);
      expect(record.buyerSituations).toHaveLength(3);
      expect(record.processSteps).toHaveLength(4);
      expect(record.capabilities).toHaveLength(6);
      expect(record.faqs.length).toBeGreaterThanOrEqual(3);
      expect(record.deliverables.length).toBeGreaterThan(0);
      expect(record.deliverables.some((item) => /^everything in /i.test(item))).toBe(false);
      expect(record.stack.length).toBeGreaterThan(0);
      for (const situation of record.buyerSituations) {
        expect(pricing[record.pricingKey].tiers[situation.tierIndex].name).toBe(situation.tierName);
      }
    }
  });

  it('composed FAQ answers quote the prices in site.ts', () => {
    const automation = getService('automation-ai-workflow-setup');
    for (const tier of pricing.automation.tiers) expect(automation.faqs[0].answer).toContain(tier.price);
    for (const line of pricing.automation.retainers) expect(automation.faqs[1].answer).toContain(line.price);

    const web = getServiceByEstimateKey('web');
    expect(web.faqs[0].answer).toContain('$8,500');
    expect(web.faqs[0].answer).toContain('$12,000');
    expect(web.typicalTimeline).toBeDefined();
    expect(getServiceByEstimateKey('cloud').typicalTimeline).toBeUndefined();
    expect(getServiceByEstimateKey('cloud').portfolioCategory).toBeNull();
  });
});
