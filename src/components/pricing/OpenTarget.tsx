'use client';

import { useEffect } from 'react';

/** Opens the collapsed <details> that `#hash` names, or that holds the element it names. */
function openFor(hash: string) {
  if (hash.length < 2) return;
  const details = document.getElementById(decodeURIComponent(hash.slice(1)))?.closest('details');
  if (details && !details.open) details.open = true;
}

/**
 * One island for the price list's collapsed rows. A link to a row (the
 * starting-price ledger's "See all 4 packages", the readout's bundle link) or
 * a URL that arrives with its hash (/pricing#bundles) opens that row first, so
 * the jump lands on its packages, not on a closed summary. The click listener
 * runs in the capture phase, ahead of SmoothScroll's handler, which then
 * measures the opened row. Renders nothing.
 */
export default function OpenTarget() {
  useEffect(() => {
    openFor(window.location.hash);
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a[href*="#"]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.origin === window.location.origin && url.pathname === window.location.pathname) openFor(url.hash);
    };
    const onHashChange = () => openFor(window.location.hash);
    document.addEventListener('click', onClick, true);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  return null;
}
