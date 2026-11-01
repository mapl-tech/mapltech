import { describe, expect, it } from 'vitest';
import { pricing } from '@/config/site';
import { SERVICE_META } from '@/lib/estimate';
import {
  ENGAGEMENT,
  INDEX_META,
  LAYER_VIEWS,
  PRICE_SUMMARY,
  capabilityViews,
  cleanCopy,
  faqItems,
  indexMetadata,
  jobViews,
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
    expect(cleanCopy('connect every tool into one seamless pipeline')).toBe('connect every tool into one pipeline');
  });

  it('retires the construction metaphors', () => {
    expect(cleanCopy('We architect your automation blueprint: triggers')).toBe(
      'We architect your automation plan: triggers',
    );
    expect(cleanCopy('integrations without rewriting the foundation.')).toBe('integrations without a rewrite.');
    expect(cleanCopy('a fixed quote after a 20-min scoping call')).toBe('a fixed quote after a 20-minute scoping call');
    // The tier name is data, never a metaphor.
    expect(cleanCopy('Foundation Automation ($3,500-$5,000)')).toBe('Foundation Automation ($3,500–$5,000)');
  });

  it('keeps one spelling per tier name', () => {
    expect(cleanCopy('Growth/E-Commerce projects run 5-8 weeks.')).toBe('Growth / E-Commerce projects run 5–8 weeks.');
  });
});

/** Retired by the owner (Nov 2026): no construction metaphors anywhere in the services copy. */
const RETIRED = /holds it up|\bsteel\b|\btowers?\b|\bblueprints?\b|\bfloors?\b|\bground\b|foundation(?! automation)/i;

describe('sentenceCase', () => {
  it('keeps acronyms and hyphenated acronyms', () => {
    expect(sentenceCase('AI-Powered Intake & Assistants')).toBe('AI-powered intake & assistants');
    expect(sentenceCase('CI/CD Pipeline Engineering')).toBe('CI/CD pipeline engineering');
    expect(sentenceCase('Custom-Coded, Not Cobbled Together')).toBe('Custom-coded, not cobbled together');
    expect(sentenceCase('CRM That Works for You')).toBe('CRM that works for you');
  });
});

describe('service pages', () => {
  it('has one view per service line, surface to foundation', () => {
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
      const strings = [
        view.lede,
        view.summary,
        view.entryIncludes,
        view.deliverIntro,
        view.stagesIntro,
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
        expect(text, text).not.toMatch(/drowning|Perfect for/);
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

  it('prices every tier from site.ts', () => {
    const web = LAYER_VIEWS[0];
    expect(tierViews(web).map((t) => t.price)).toEqual(pricing.webDevelopment.tiers.map((t) => cleanCopy(t.price)));
    expect(tierSentence(web)).toBe(
      'Web Development at MAPL TECH: from $5,000 for Starter, from $8,500 for Growth / E-Commerce and from $12,000 for Advanced / AI-Powered. Enterprise is priced per project.',
    );
    expect(tierViews(web).map((t) => t.timeline?.label ?? null)).toEqual([
      '3–4 weeks',
      '5–8 weeks',
      '8–14 weeks',
      '8–14 weeks',
    ]);
    // Only web states timelines.
    for (const view of LAYER_VIEWS.slice(1)) expect(tierViews(view).every((t) => t.timeline === null)).toBe(true);
  });

  it('shows only listed case studies, and only infrastructure facts on cloud', () => {
    const cloud = LAYER_VIEWS[3];
    const [tours] = proofCases(cloud);
    expect(tours.slug).toBe('mapl-tours');
    expect(tours.results.every((r) => /tests|payments/i.test(r.label))).toBe(true);
    expect(tours.stages.map((s) => s.name)).toEqual(['Tests', 'Money']);
    expect(proofCases(LAYER_VIEWS[0]).map((c) => c.slug)).toEqual(['lro-staffing', 'chha-ncr', 'focas-canada']);
    expect(tours.kind).toBe('Our own product · Travel');
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

  it('maps every job to a real tier and a preselected estimate', () => {
    const jobs = jobViews();
    expect(jobs).toHaveLength(8);
    for (const job of jobs) {
      expect(job.href).toContain(`svc=${job.service}`);
      expect(job.href).toContain(`size.${job.service}=`);
      expect(job.label).not.toMatch(BANNED);
    }
    expect(jobs.find((j) => j.id === 'web-growth')?.price).toBe('$8,500');
  });

  it('states engagement terms from the config only', () => {
    const text = ENGAGEMENT.map((term) => `${term.title} ${term.text}`).join(' ');
    expect(text).toContain('$500 a month');
    expect(text).toContain('$65–$120 an hour');
    expect(text).toContain('$4,000–$7,500 a month');
    expect(text).toContain('Automation & AI with Custom Internal Tools support');
    expect(text).not.toMatch(BANNED);
    expect(text).not.toMatch(TIMED);
  });
});
