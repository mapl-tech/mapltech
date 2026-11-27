import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { testimonials } from '@/config/site';
import QuoteText from '@/components/ui/QuoteText';
import { caseFor } from './caseFor';
import { APPROACH, CLOSE_BAND, LOWEST_PRICE, PROOF, PROOF_SECTION, REASONS, VOICES, WORK, WORK_SECTION } from './content';

const quoteHtml = (props: { quote: string; highlight?: string; marks?: boolean }) =>
  renderToStaticMarkup(createElement(QuoteText, props));
const text = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

describe('testimonial highlights (site.ts)', () => {
  it('are each, word for word, one part of their own quote', () => {
    for (const t of testimonials) {
      if (!t.highlight) continue;
      expect(t.quote.split(t.highlight).length - 1, t.name).toBe(1);
    }
  });

  it('cover every testimonial shown in full', () => {
    for (const t of testimonials) expect(t.highlight, t.name).toBeTruthy();
  });
});

describe('QuoteText', () => {
  const quote = 'One. Two words here. Three.';

  it('marks the highlight and never changes the words', () => {
    const html = quoteHtml({ quote, highlight: 'Two words here.' });
    expect(html).toMatch(/<mark[^>]*>Two words here\.<\/mark>/);
    expect(text(html)).toBe(`“${quote}”`);
  });

  it('marks nothing when the highlight is not part of the quote', () => {
    const html = quoteHtml({ quote, highlight: 'Not in it.' });
    expect(html).not.toContain('<mark');
    expect(text(html)).toBe(`“${quote}”`);
  });

  it('leaves the quotation marks to the page when asked', () => {
    expect(text(quoteHtml({ quote, highlight: 'Three.', marks: false }))).toBe(quote);
    expect(text(quoteHtml({ quote, marks: false }))).toBe(quote);
  });

  it('keeps every published testimonial word for word', () => {
    for (const t of testimonials) expect(text(quoteHtml({ quote: t.quote, highlight: t.highlight }))).toBe(`“${t.quote}”`);
  });
});

describe('Why agencies work with us (PROOF_SECTION, REASONS)', () => {
  it('gives four reasons, each figure read from where the site publishes it', () => {
    expect(REASONS).toHaveLength(4);
    const figures = REASONS.map((r) => r.figure);
    expect(figures).toContain(`$${LOWEST_PRICE.toLocaleString('en-US')}`);
    expect(figures).toContain(WORK.find((card) => card.slug === 'mapl-tours')?.metrics[0].value);
    const [projects, , offices] = PROOF.stats;
    expect(figures).toContain(`${projects.value}${projects.suffix}`);
    expect(figures).toContain(`${offices.value}${offices.suffix}`);
  });

  it('names MAPL Tours as our own company wherever its figure is used', () => {
    const tours = REASONS.find((r) => r.caption.includes('MAPL Tours'));
    expect(tours?.caption).toContain('our own');
  });

  it('does not repeat the steps a screen above, or the other asks', () => {
    const steps = APPROACH.steps.flatMap((step) => [step.title, step.text]);
    for (const reason of REASONS) {
      for (const words of [reason.title, reason.text]) {
        expect(steps.some((s) => s.includes(words) || words.includes(s)), words).toBe(false);
      }
    }
    expect(PROOF_SECTION.ask).not.toBe(WORK_SECTION.ask);
    expect(PROOF_SECTION.ask).not.toBe(CLOSE_BAND.title);
  });

  it('keeps the copy rules: no exclamation marks, curly apostrophes, never "Inc."', () => {
    const copy = [
      ...Object.values(PROOF_SECTION),
      ...REASONS.flatMap((r) => [r.figure, r.caption, r.title, r.text]),
    ];
    for (const words of copy) {
      expect(words, words).not.toMatch(/!/);
      expect(words, words).not.toMatch(/'/);
      expect(words, words).not.toMatch(/\bInc\./);
    }
  });

  it('ends every testimonial on the case study it is about', () => {
    for (const voice of VOICES) expect(caseFor(voice.quote), voice.name).not.toBeNull();
  });
});
