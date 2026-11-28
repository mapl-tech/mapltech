import { describe, expect, it } from 'vitest';
import { linkText } from './Analytics';

/** Just enough of an Element for linkText: its attributes and its text. */
const el = (attrs: Record<string, string>, textContent: string) =>
  ({ getAttribute: (name: string) => attrs[name] ?? null, textContent }) as unknown as Element;

describe('linkText (cta_click and contact_click link_text)', () => {
  it('reports a link that names itself in data-cta-label by that name, whatever its markup holds', () => {
    // A tile link with two labels in its markup (one shown per width): its text would read both.
    expect(linkText(el({ 'data-cta-label': 'See pricing' }, 'See pricingPricing'))).toBe('See pricing');
  });

  it('otherwise uses the accessible label, then the text, with its white space collapsed', () => {
    expect(linkText(el({ 'aria-label': 'Call us' }, '+1 647'))).toBe('Call us');
    expect(linkText(el({}, '  Read the case study\n: LRO Staffing '))).toBe('Read the case study : LRO Staffing');
  });

  it('keeps at most 100 characters', () => {
    expect(linkText(el({}, 'x'.repeat(140)))).toHaveLength(100);
  });
});
