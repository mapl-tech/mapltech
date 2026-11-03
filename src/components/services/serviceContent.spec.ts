import { describe, expect, it } from 'vitest';
import { services } from '@/config/services';
import { pricing } from '@/config/site';
import { SERVICE_META } from '@/lib/estimate';
import {
  INDEX_META,
  INDEX_STEPS,
  LAYER_VIEWS,
  PARTNERSHIP_FROM,
  PRICE_SUMMARY,
  QUOTE_LINE,
  capabilityViews,
  cleanCopy,
  costTitle,
  faqItems,
  indexMetadata,
  proofCases,
  rowExample,
  sentenceCase,
  serviceMetadata,
  stageViews,
  tierViews,
} from './serviceContent';

/** Visible-copy rules from the flagship guide: no em dashes, no hype words, no exclamation marks. */
const BANNED =
  /—|\bseamless\b|\belevate|\bunleash|\brobust\b|cutting-edge|revolutioni[sz]e|supercharge|\bempower|\bunlock|\bleverage|world-class|best-in-class|!/i;

/** Site-wide rule (Nov 2026): no unmeasured timed claims. */
const TIMED = /\bsub-second\b|\bseconds?\b|\bin minutes\b|\binstant(ly)?\b/i;

/** Retired by the owner (Nov 2026): no construction metaphors anywhere in the services copy. */
const RETIRED = /holds it up|\bsteel\b|\btowers?\b|\bblueprints?\b|\bfloors?\b|\bground\b|foundation(?! automation)/i;

/**
 * Simplify pass (Nov 2026): words a diverse audience should not have to decode
 * in the copy we write. Tier names and inclusions are site.ts data and are not
 * checked here; "CI/CD" is allowed only where it is explained in the same item.
 */
const JARGON =
  /\bheadless\b|\bstack\b|\bembed(ded)?\b|\bdiligence\b|\bstandups?\b|\bscoping\b|\bretainers?\b|\bSLA\b|\borchestration\b|\bdeliverables?\b|\bpipelines?\b|\binfrastructure as code\b|core web vitals|\bobservability\b|\bprovision/i;

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
const sentences = (text: string) => text.split(/(?<=[.?!])\s+/).filter(Boolean);

describe('cleanCopy', () => {
  it('turns numeric hyphens into en dashes and spaced hyphens into punctuation', () => {
    expect(cleanCopy('$3,500-$5,000')).toBe('$3,500–$5,000');
    expect(cleanCopy('Starter sites typically ship in 3-4 weeks.')).toBe('Starter sites typically ship in 3–4 weeks.');
    expect(cleanCopy('engineered from scratch - custom WordPress themes')).toBe(
      'engineered from scratch: custom WordPress themes',
    );
    expect(cleanCopy('pipelines automatically - so your team focuses')).toBe(
      'pipelines automatically, so your team focuses',
    );
    expect(cleanCopy('a 5-year-old Android')).toBe('a 5-year-old Android');
    // The tier name is data: only its range changes.
    expect(cleanCopy('Foundation Automation ($3,500-$5,000)')).toBe('Foundation Automation ($3,500–$5,000)');
    expect(cleanCopy("what's slowing your clients' team")).toBe('what’s slowing your clients’ team');
  });
});

describe('sentenceCase', () => {
  it('keeps acronyms and hyphenated acronyms', () => {
    expect(sentenceCase('AI-Powered Intake & Assistants')).toBe('AI-powered intake & assistants');
    expect(sentenceCase('CI/CD Pipeline Engineering')).toBe('CI/CD pipeline engineering');
    expect(sentenceCase('Custom-Coded, Not Cobbled Together')).toBe('Custom-coded, not cobbled together');
    expect(sentenceCase('CRM That Works for You')).toBe('CRM that works for you');
  });
});

describe('service pages', () => {
  it('has one view per service, in services.ts order', () => {
    expect(LAYER_VIEWS.map((view) => view.service)).toEqual(['web', 'automation', 'tools', 'cloud']);
  });

  it.each(LAYER_VIEWS.map((view) => [view.slug, view] as const))(
    '%s: metadata is self-canonical with a 140-160 character description',
    (slug) => {
      const meta = serviceMetadata(slug);
      const description = String(meta.description);
      expect(description.length).toBeGreaterThanOrEqual(140);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(meta.alternates?.canonical).toBe(`https://mapltech.com/services/${slug}`);
    },
  );

  it.each(LAYER_VIEWS.map((view) => [view.slug, view] as const))(
    '%s: rendered copy obeys the copy rules',
    (_slug, view) => {
      const written = [
        view.role,
        view.lede,
        view.summary,
        view.entryIncludes,
        view.deliverIntro,
        view.headline,
        view.buildTitle,
        view.processTitle,
        view.close.title,
        view.close.lede,
        costTitle(view),
        ...capabilityViews(view).flatMap((c) => [c.title, c.text]),
        ...stageViews(view).flatMap((s) => [s.name, s.text]),
        ...faqItems(view).flatMap((f) => [f.question, f.answer]),
      ];
      const data = tierViews(view).flatMap((t) => [t.who, ...t.features]);
      for (const text of [...written, ...data]) {
        expect(text, text).not.toMatch(BANNED);
        expect(text, text).not.toMatch(RETIRED);
        expect(text, text).not.toMatch(TIMED);
        expect(text, text).not.toMatch(/drowning|Perfect for|page builder/);
      }
      // Plain words: no unexplained jargon, and no sentence a reader has to hold in their head.
      for (const text of written.filter((t) => !faqItems(view).some((f) => f.answer === t && f.list))) {
        expect(text, text).not.toMatch(JARGON);
        for (const sentence of sentences(text)) expect(words(sentence), sentence).toBeLessThanOrEqual(25);
      }
      // Steps stay short: 15 words or fewer each.
      for (const stage of stageViews(view)) expect(words(stage.text), stage.text).toBeLessThanOrEqual(15);
      expect(stageViews(view)).toHaveLength(4);
      // Names and labels use the canonical service name; FAQ questions and the JSON-LD carry the same words.
      expect(view.name).toBe(SERVICE_META[view.service].label);
      expect(faqItems(view).map((f) => f.question)).toEqual(view.record.faqs.map((f) => f.question));
      expect(faqItems(view).length).toBeLessThanOrEqual(5);
      expect(words(view.lede)).toBeLessThan(30);
      // Case labels carry the sector, never a short service name ("Website", "Internal tools").
      for (const item of proofCases(view))
        expect(item.kind).not.toMatch(/^(Website|Internal tools?|Automation|Custom)/);
    },
  );

  it('leads with one promise: the H1 in eight words or fewer, the service name above it', () => {
    const keywords = [/\bwebsites?\b/i, /\bautomation\b/i, /\binternal tools\b/i, /\bcloud\b/i];
    LAYER_VIEWS.forEach((view, i) => {
      expect(words(view.headline), view.headline).toBeLessThanOrEqual(8);
      expect(view.headline).toMatch(keywords[i]);
      // Sentence case: after the first word, only acronyms keep a capital.
      for (const word of view.headline.split(/\s+/).slice(1)) expect(word, view.headline).not.toMatch(/^[A-Z][a-z]/);
      // The eyebrow is the canonical name, and services.ts says the same.
      expect(view.record.heroLabel).toBe(view.name);
      // The promise is the H1 alone: the "What we build" heading says something else.
      expect(view.buildTitle).not.toBe(view.headline);
    });
    expect(LAYER_VIEWS.map((view) => view.headline)).toEqual([
      'Fast, accessible websites under your brand.',
      'Let automation handle the repetitive work.',
      'Internal tools that fit how you work.',
      'Cloud hosting that grows with your clients.',
    ]);
  });

  it('shows the four strongest points under "What we build", none repeating its heading or intro', () => {
    for (const view of LAYER_VIEWS) {
      const points = capabilityViews(view);
      expect(points, view.slug).toHaveLength(4);
      expect(points.map((p) => p.title)).toEqual(view.buildPoints.map(sentenceCase));
      for (const title of view.buildPoints) expect(view.record.capabilities.some((c) => c.title === title), title).toBe(true);
      const said = `${view.buildTitle} ${view.deliverIntro}`.toLowerCase();
      for (const point of points) expect(said, point.title).not.toContain(point.title.toLowerCase());
    }
    expect(LAYER_VIEWS.map((view) => view.buildTitle)).toEqual([
      'What every site gets.',
      'What we automate.',
      'Tools for your team and your clients.',
      'What we set up and look after.',
    ]);
  });

  it('states each process heading and close in plain words', () => {
    const [, automation, tools, cloud] = LAYER_VIEWS;
    expect(cloud.processTitle).toBe('Four steps to reliable hosting.');
    expect(automation.close.title).toBe('Tired of copying data between tools?');
    expect(tools.close.lede).toBe(
      'Tell us what slows your team down. We will build the tool that fixes it, for good. You get a fixed quote after a 20-minute call.',
    );
    expect(QUOTE_LINE).toBe('You get a fixed quote after a 20-minute call.');
    for (const view of LAYER_VIEWS) expect(services.some((s) => s.slug === view.slug)).toBe(true);
  });

  it('prices every tier from site.ts', () => {
    const webView = LAYER_VIEWS[0];
    expect(tierViews(webView).map((t) => t.price)).toEqual(pricing.webDevelopment.tiers.map((t) => cleanCopy(t.price)));
    expect(costTitle(webView)).toBe('Four tiers, from $5,000.');
    expect(costTitle(LAYER_VIEWS[1])).toBe('Three tiers, from $3,500.');
    expect(tierViews(webView).map((t) => t.timeline?.label ?? null)).toEqual([
      '3–4 weeks',
      '5–8 weeks',
      '8–14 weeks',
      '8–14 weeks',
    ]);
    // A starting price reads "From $5,000"; only Custom carries a note. Never "Starting price".
    expect(tierViews(webView).map((t) => t.isFloor)).toEqual([true, true, true, false]);
    expect(tierViews(webView).map((t) => t.priceNote)).toEqual([null, null, null, 'Priced with you on a call']);
    // An open end ("$20,000+") is a floor too; a range stays a range, even an open one.
    const cloudTiers = tierViews(LAYER_VIEWS[3]);
    expect(cloudTiers.map((t) => [t.price, t.isFloor])).toEqual([
      ['$5,000–$8,000', false],
      ['$10,000–$18,000', false],
      ['$20,000', true],
    ]);
    expect(tierViews(LAYER_VIEWS[2]).map((t) => t.price)[2]).toBe('$12,000–$25,000+');
    for (const view of LAYER_VIEWS) {
      for (const tier of tierViews(view)) {
        expect(`${tier.price} ${tier.priceNote ?? ''}`).not.toMatch(/starting|\/\s*mo(nth)?\b|price range/i);
      }
    }
    // Only web states timelines.
    for (const view of LAYER_VIEWS.slice(1)) expect(tierViews(view).every((t) => t.timeline === null)).toBe(true);
  });

  it('shows at most two listed case studies with real captures, and only delivery facts on cloud', () => {
    const cloud = LAYER_VIEWS[3];
    const [tours] = proofCases(cloud);
    expect(tours.slug).toBe('mapl-tours');
    expect(tours.results.length).toBeGreaterThan(0);
    expect(tours.results.every((r) => /tests|payments/i.test(r.label))).toBe(true);
    expect(tours.stages).toEqual([]);
    expect(tours.kind).toBe('Our own product · Travel');
    expect(cloud.exhibit).toBeNull();
    for (const view of LAYER_VIEWS) expect(proofCases(view).length).toBeLessThanOrEqual(2);
    expect(proofCases(LAYER_VIEWS[0]).map((c) => c.slug)).toEqual(['lro-staffing', 'chha-ncr']);
    const leads = LAYER_VIEWS.slice(0, 3).map((view) => proofCases(view)[0]);
    expect(leads.map((c) => c.media?.desktop)).toEqual([
      '/images/cases/lro-desktop.jpg',
      '/images/cases/tours-desktop.jpg',
      '/images/cases/salary-desktop.jpg',
    ]);
    expect(leads.map((c) => c.media?.mobile)).toEqual([
      '/images/cases/lro-mobile.jpg',
      '/images/cases/tours-mobile.jpg',
      '/images/cases/salary-mobile.jpg',
    ]);
    expect(leads.map((c) => c.href)).toEqual(['/our-work/lro-staffing', '/our-work/mapl-tours', '/our-work/lro-salary-guide']);
  });

  it('lists price answers tier by tier, in the words the JSON-LD carries', () => {
    const automation = LAYER_VIEWS[1];
    const [cost, support] = faqItems(automation);
    expect(cost.list?.lead).toBe('From $3,500, across three tiers.');
    expect(cost.list?.points).toEqual(pricing.automation.tiers.map((t) => `${t.name}: ${cleanCopy(t.price)}`));
    expect(cost.list?.close).toBe(QUOTE_LINE);
    expect(cost.answer).toBe(
      [cost.list?.lead, ...(cost.list?.points ?? []).map((p) => `${p}.`), cost.list?.close].join(' '),
    );
    expect(support.list?.lead).toBe('Three monthly plans.');
    expect(support.list?.points[0]).toBe('Light Monitoring & Tweaks: $750 a month');
    // Web prices are starting prices; the custom tier is priced per project.
    const [webCost] = faqItems(LAYER_VIEWS[0]);
    expect(webCost.list?.lead).toBe('From $5,000, across four tiers.');
    expect(webCost.list?.points).toEqual([
      'Starter: from $5,000',
      'Growth / E-Commerce: from $8,500',
      'Advanced / AI-Powered: from $12,000',
      'Enterprise: priced per project',
    ]);
    // An open-ended tier reads like the price card: "from $20,000".
    expect(faqItems(LAYER_VIEWS[3])[0].list?.points[2]).toBe('Enterprise Cloud Platform: from $20,000');
    for (const view of LAYER_VIEWS) for (const faq of faqItems(view)) expect(faq.answer).not.toMatch(/\/month/);
  });
});

describe('services index', () => {
  it('is self-canonical with a 140-160 character description', () => {
    const meta = indexMetadata();
    expect(String(meta.description).length).toBeGreaterThanOrEqual(140);
    expect(String(meta.description).length).toBeLessThanOrEqual(160);
    expect(meta.alternates?.canonical).toBe('https://mapltech.com/services');
    expect(INDEX_META.description).not.toMatch(BANNED);
    expect(PRICE_SUMMARY).toBe(
      'Web Development from $5,000, Automation & AI from $3,500, Custom Internal Tools and Cloud Engineering from $5,000',
    );
  });

  it('tells how it works in the homepage’s short steps, and points bundles to pricing', () => {
    expect(INDEX_STEPS.length).toBeGreaterThanOrEqual(3);
    expect(INDEX_STEPS.length).toBeLessThanOrEqual(4);
    for (const step of INDEX_STEPS) {
      expect(words(step.text), step.text).toBeLessThanOrEqual(15);
      expect(`${step.title} ${step.text}`).not.toMatch(BANNED);
    }
    expect(PARTNERSHIP_FROM).toBe('$4,000 a month');
  });

  it('links each row to one real project, and Cloud (no case study of its own) to none', () => {
    expect(LAYER_VIEWS.map(rowExample)).toEqual([
      { client: 'LRO Staffing', href: '/our-work/lro-staffing' },
      { client: 'MAPL Tours', href: '/our-work/mapl-tours' },
      { client: 'LRO Interactive Salary Guide', href: '/our-work/lro-salary-guide' },
      null,
    ]);
  });
});
