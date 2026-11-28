import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { caseStudies, testimonials } from '@/config/site';
import QuoteText from '@/components/ui/QuoteText';
import { caseFor } from './caseFor';
import { APPROACH, CLOSE_BAND, LOWEST_PRICE, PROOF, PROOF_SECTION, PROOF_WALL, WORK, WORK_SECTION, excerpt } from './content';
import Proof from './Proof';

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

describe('excerpt', () => {
  const quote = 'One two. Three four five. Six seven.';

  it('keeps a whole sentence as it is', () => {
    expect(excerpt(quote, quote.indexOf('Three'), quote.indexOf('Six'))).toBe('Three four five.');
  });

  it('marks a piece that starts or stops mid-sentence', () => {
    expect(excerpt(quote, quote.indexOf('four'))).toBe('…four five. Six seven.');
    expect(excerpt(quote, 0, quote.indexOf(' five'))).toBe('One two. Three four…');
  });
});

describe('Why agencies work with us: the proof wall (PROOF_WALL)', () => {
  const { voice, price, team, hours, search, audit } = PROOF_WALL;
  const tours = WORK.find((card) => card.slug === 'mapl-tours');
  const chha = WORK.find((card) => card.slug === 'chha-ncr');

  it('shows every tile while its source exists', () => {
    expect(voice).not.toBeNull();
    expect(search).not.toBeNull();
    expect(audit).not.toBeNull();
    expect(hours.cities).toEqual(['Toronto', 'Kingston', 'Lagos']);
  });

  it('reads every figure from where the site publishes it', () => {
    const [projects, years] = PROOF.stats;
    expect(price.figure).toBe(`$${LOWEST_PRICE.toLocaleString('en-US')}`);
    expect(team.figure).toBe(`${projects.value}${projects.suffix}`);
    expect(team.heading.toLowerCase()).toBe(projects.label);
    expect(team.caption).toBe(`${years.value}${years.suffix} ${years.label}`);
    expect(search?.figure).toBe(tours?.metrics[0].value);
    // The card's own claim, with the company named: "of customers … now arrive through ChatGPT".
    expect(search?.caption.endsWith(tours?.metrics[0].label.replace(/^of customers /, '') ?? '-')).toBe(true);
    expect(audit?.figure).toBe(chha?.metrics[0].value);
  });

  it('quotes only exact words, marking any piece cut mid-sentence', () => {
    const client = testimonials.find((t) => t.kind === 'client');
    const verdict = testimonials.find((t) => t.kind === 'audit');
    expect(voice?.excerpt).toBe(client?.highlight);
    expect(client?.quote.includes(voice?.excerpt ?? '-')).toBe(true);
    expect(audit?.excerpt.startsWith('…')).toBe(true);
    expect(verdict?.quote.endsWith(audit?.excerpt.slice(1) ?? '-')).toBe(true);
  });

  it('calls the audit independent only because its case study does', () => {
    const study = caseStudies.find((c) => c.slug === 'chha-ncr');
    expect(audit?.heading.toLowerCase()).toContain('independent');
    expect(study?.results.some((line) => line.includes('an independent August 2026 audit'))).toBe(true);
  });

  it('names MAPL Tours as our own company wherever its figure is used', () => {
    expect(search?.caption).toContain(`${tours?.client}, our own`);
  });

  it('does not repeat the steps a screen above, or the other asks', () => {
    const steps = APPROACH.steps.flatMap((step) => [step.title, step.text]);
    for (const words of [price.caption, search?.heading ?? '', hours.heading]) {
      expect(steps.some((s) => s.includes(words) || words.includes(s)), words).toBe(false);
    }
    expect(PROOF_SECTION.ask).not.toBe(WORK_SECTION.ask);
    expect(PROOF_SECTION.ask).not.toBe(CLOSE_BAND.title);
  });

  it('keeps the copy rules: no exclamation marks, curly apostrophes, never "Inc."', () => {
    const copy = [
      ...Object.values(PROOF_SECTION),
      voice?.heading ?? '',
      price.heading,
      price.caption,
      team.heading,
      team.caption,
      hours.heading,
      audit?.heading ?? '',
      audit?.by ?? '',
      search?.heading ?? '',
      search?.caption ?? '',
    ];
    for (const words of copy) {
      expect(words, words).not.toMatch(/!/);
      expect(words, words).not.toMatch(/'/);
      expect(words, words).not.toMatch(/\bInc\./);
    }
  });

  it('ends both quotes on the case study they are about', () => {
    expect(caseFor(voice?.quote ?? '')).not.toBeNull();
    expect(caseFor(audit?.quote ?? '')).not.toBeNull();
  });

  // The rendered wall: one tile per <li data-tile>, named by its second class
  // (CSS modules print "_voice_<hash>").
  const tiles = renderToStaticMarkup(createElement(Proof))
    .split('<li data-tile=""')
    .slice(1)
    .map((html) => ({ name: /^ class="_tile_\w+ _([a-z]+)_\w+"/.exec(html)?.[1] ?? '?', html }));

  it('renders the tiles in the order the grids place them', () => {
    // It opens on a client's words and closes on the audit's, the third-party proof nearest the ask.
    expect(tiles.map((tile) => tile.name)).toEqual(['voice', 'price', 'team', 'hours', 'search', 'audit']);
  });

  it('opens every tile with its heading, so heading navigation lands before the proof', () => {
    for (const tile of tiles) {
      expect(/^ class="[^"]*">(?:<div class="[^"]*">)?<h3 /.test(tile.html), tile.name).toBe(true);
    }
  });

  it('gives every tile a heading that reads whole in a list of headings', () => {
    const headings = tiles.map((tile) => text(/<h3[^>]*>(.*?)<\/h3>/.exec(tile.html)?.[1] ?? '').replace(/\s+/g, ' ').trim());
    expect(headings).toEqual([
      voice?.heading,
      `${price.heading} ${price.figure}`,
      `${team.heading} ${team.figure}`,
      hours.heading,
      search?.heading,
      audit?.heading,
    ]);
  });

  it('labels the figure tiles’ links with the site’s own words, the nav’s where space is short', () => {
    expect(price.link.label).toBe('See pricing');
    expect([price.link.short, team.link.short]).toEqual(['Pricing', 'Team']);
    // Both labels sit in the markup, so analytics is handed the full one explicitly.
    const labels = tiles.map((tile) => /data-cta-label="([^"]*)"/.exec(tile.html)?.[1] ?? null);
    expect(labels).toEqual([null, 'See pricing', 'Meet the team', null, null, null]);
  });

  it('lets only the figure tiles cover themselves with their link, so both quotations stay selectable', () => {
    const covered = tiles.filter((tile) => /_cover_/.test(tile.html)).map((tile) => tile.name);
    expect(covered).toEqual(['price', 'team', 'search']);
  });
});
