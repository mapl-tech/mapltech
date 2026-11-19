import { describe, expect, it } from 'vitest';
import { CLIENTS } from './content';
import { COPIES, GAP_MIN, MARK_MAX, MARK_MIN, ROW_MAX, listWidth } from './parade';

describe('the client parade', () => {
  it('never shows a gap at the seam: the copies after the first span the widest row', () => {
    // Each list slides left by its own width, so at every moment the lists after the
    // first must cover the row. The narrowest a list gets (smallest mark and gap)
    // against the widest the row gets.
    const narrowest = listWidth(CLIENTS.logos, MARK_MIN, GAP_MIN);
    expect((COPIES - 1) * narrowest).toBeGreaterThanOrEqual(ROW_MAX);
  });

  it('shows every client the homepage shows, each with a name and its file’s own proportions', () => {
    expect(CLIENTS.logos.length).toBeGreaterThan(0);
    for (const logo of CLIENTS.logos) {
      expect(logo.name.trim()).not.toBe('');
      expect(logo.src).toMatch(/^\/images\/clients\/mono\//);
      expect(logo.width).toBeGreaterThan(0);
      expect(logo.height).toBeGreaterThan(0);
      expect(logo.scale).toBeGreaterThan(0);
    }
    expect(MARK_MAX).toBeGreaterThanOrEqual(MARK_MIN);
  });
});
