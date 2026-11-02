import { describe, expect, it } from 'vitest';
import { services } from '@/config/services';
import { pricing } from '@/config/site';
import { SERVICE_META } from '@/lib/estimate';
import {
  ENGAGEMENT,
  INDEX_META,
  LAYER_VIEWS,
  PARTNERSHIPS,
  PRICE_SUMMARY,
  RATES,
  capabilityViews,
  cleanCopy,
  faqItems,
  indexMetadata,
  proofCases,
  sentenceCase,
  serviceMetadata,
  stageViews,
  tierSentence,
  tierViews,
} from './serviceContent';

/** Visible-copy rules from the flagship guide: no em dashes, no hype words, no exclamation marks. */
const BANNED =
  /—|\bseamless\b|\belevate|\bunleash|\brobust\b|cutting-edge|revolutioni[sz]e|supercharge|\bempower|\bunlock|!/i;

/** Site-wide rule (Nov 2026): no unmeasured timed claims. */
const TIMED = /\bsub-second\b|\bseconds?\b|\bin minutes\b|\binstant(ly)?\b/i;

/** Retired by the owner (Nov 2026): no construction metaphors anywhere in the services copy. */
const RETIRED = /holds it up|\bsteel\b|\btowers?\b|\bblueprints?\b|\bfloors?\b|\bground\b|foundation(?! automation)/i;

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
  it('has one view per service line, in services.ts order', () => {
    expect(LAYER_VIEWS.map((view) => view.service)).toEqual(['web', 'automation', 'tools', 'cloud']);
    expect(LAYER_VIEWS.map((view) => view.numeral)).toEqual(['01', '02', '03', '04']);
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
      const strings = [
        view.role,
        view.lede,
        view.summary,
        view.entryIncludes,
        view.who,
        view.deliverIntro,
        view.promise,
        view.processTitle,
        view.close.title,
        view.close.lede,
        tierSentence(view),
        ...capabilityViews(view).flatMap((c) => [c.title, c.text]),
        ...stageViews(view).flatMap((s) => [s.name, s.text]),
        ...tierViews(view).flatMap((t) => [t.who, ...t.features]),
        ...faqItems(view).flatMap((f) => [f.question, f.answer]),
      ];
      for (const text of strings) {
        expect(text, text).not.toMatch(BANNED);
        expect(text, text).not.toMatch(RETIRED);
        expect(text, text).not.toMatch(TIMED);
        expect(text, text).not.toMatch(/drowning|Perfect for|page builder/);
      }
      // Names and labels use the canonical service name; sentences (FAQ questions) keep services.ts's words.
      expect(view.name).toBe(SERVICE_META[view.service].label);
      expect(faqItems(view).map((f) => f.question)).toEqual(view.record.faqs.map((f) => f.question));
      expect(view.lede.split(/\s+/).length).toBeLessThan(30);
      // Case labels carry the sector, never a short service name ("Website", "Internal tools").
      for (const item of proofCases(view))
        expect(item.kind).not.toMatch(/^(Website|Internal tools?|Automation|Custom)/);
    },
  );

  it('takes the promise, the process heading and the close from the live copy in services.ts', () => {
    const [webView, automation, tools, cloud] = LAYER_VIEWS;
    expect(webView.promise).toBe('Web development that actually performs.');
    expect(automation.promise).toBe('Stop doing manually what should happen automatically.');
    expect(tools.promise).toBe('Internal tools built around your agency, not the other way around.');
    expect(cloud.promise).toBe('Infrastructure that scales when your clients do.');
    expect(cloud.processTitle).toBe('From audit to always-on.');
    expect(automation.close.title).toBe('Ready to stop copy-pasting between tools?');
    expect(tools.close.lede).toBe(
      'Tell us what’s slowing your team down. We’ll build the tool that fixes it, for good. You get a fixed quote after a 20-minute scoping call.',
    );
    for (const view of LAYER_VIEWS) expect(services.some((s) => s.slug === view.slug)).toBe(true);
  });

  it('prices every tier from site.ts', () => {
    const webView = LAYER_VIEWS[0];
    expect(tierViews(webView).map((t) => t.price)).toEqual(pricing.webDevelopment.tiers.map((t) => cleanCopy(t.price)));
    expect(tierSentence(webView)).toBe(
      'Web Development at MAPL TECH: from $5,000 for Starter, from $8,500 for Growth / E-Commerce and from $12,000 for Advanced / AI-Powered. Enterprise is priced per project.',
    );
    expect(tierViews(webView).map((t) => t.timeline?.label ?? null)).toEqual([
      '3–4 weeks',
      '5–8 weeks',
      '8–14 weeks',
      '8–14 weeks',
    ]);
    // Only web states timelines.
    for (const view of LAYER_VIEWS.slice(1)) expect(tierViews(view).every((t) => t.timeline === null)).toBe(true);
  });

  it('shows only listed case studies with real captures, and only infrastructure facts on cloud', () => {
    const cloud = LAYER_VIEWS[3];
    const [tours] = proofCases(cloud);
    expect(tours.slug).toBe('mapl-tours');
    expect(tours.results.every((r) => /tests|payments/i.test(r.label))).toBe(true);
    expect(tours.stages.map((s) => s.name)).toEqual(['Review', 'Money']);
    expect(tours.kind).toBe('Our own product · Travel');
    expect(cloud.exhibit).toBeNull();
    expect(proofCases(LAYER_VIEWS[0]).map((c) => c.slug)).toEqual(['lro-staffing', 'chha-ncr', 'focas-canada']);
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
    expect(cost.list?.close).toBe('You get a fixed quote after a 20-minute scoping call.');
    expect(cost.answer).toBe(
      [cost.list?.lead, ...(cost.list?.points ?? []).map((p) => `${p}.`), cost.list?.close].join(' '),
    );
    expect(support.list?.points[0]).toBe('Light Monitoring & Tweaks: $750 a month');
    // The web page's own price question keeps its words.
    expect(faqItems(LAYER_VIEWS[0])[0].list).toBeUndefined();
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

  it('states engagement terms and partnerships from the config only', () => {
    const text = ENGAGEMENT.map((term) => `${term.title} ${term.text}`).join(' ');
    expect(text).toContain('$500 a month');
    expect(text).toContain('$65–$120 an hour');
    expect(text).toContain('30–90 days');
    expect(text).not.toMatch(BANNED);
    expect(text).not.toMatch(TIMED);
    expect(PARTNERSHIPS.map((p) => p.name)).toEqual(pricing.bundles.map((b) => b.name));
    expect(PARTNERSHIPS.map((p) => p.price)).toEqual(['$4,000–$7,500 a month', '$7,500–$12,000 a month']);
    expect(RATES).toEqual({ monthlyFrom: '$500 a month', hourly: '$65–$120 an hour', emergency: '$150+ an hour' });
    for (const p of PARTNERSHIPS) for (const s of [p.description, ...p.features]) expect(s).not.toMatch(BANNED);
  });
});
