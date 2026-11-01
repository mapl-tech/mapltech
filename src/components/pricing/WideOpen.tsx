'use client';

import { useEffect } from 'react';

const WIDE = '(min-width: 768px)';

/**
 * One island for every feature list in the price list. The server renders
 * each `<details data-wide-open>` closed (the list is in the HTML either way,
 * so it stays crawlable and phones never shift after hydration); from 768px up
 * this opens them, and it only writes `open` again when the breakpoint flips,
 * so a visitor's own toggles are kept. Renders nothing.
 */
export default function WideOpen() {
  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const apply = () => {
      document.querySelectorAll<HTMLDetailsElement>('details[data-wide-open]').forEach((details) => {
        details.open = query.matches;
      });
    };
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  return null;
}
