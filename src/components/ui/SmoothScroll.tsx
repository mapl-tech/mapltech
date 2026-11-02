'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, type LenisRef } from 'lenis/react';
import type { LenisOptions } from 'lenis';
import { useFinePointer, usePrefersReducedMotion } from './useMediaQuery';

/**
 * Returns the site-wide Lenis instance, or `undefined` on touch devices, under
 * reduced motion, and during SSR. Callers must handle `undefined` (native scroll).
 *
 * `useLenis((lenis) => ...)` also accepts a scroll callback, see lenis/react.
 */
export { useLenis } from 'lenis/react';

/** Clearance under the fixed header for targets that set no scroll-margin-top. */
const DEFAULT_ANCHOR_CLEARANCE = 88;

/** Can receive focus without help (otherwise it gets tabindex="-1"). */
const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex]';

/**
 * The live site's scroll feel, kept exactly: a 1.2s glide on an exponential
 * ease-out (Leshan: "I like how smooth the current version of the website is").
 * Desktop fine pointers only; touch keeps native momentum scrolling.
 */
const LENIS_OPTIONS: LenisOptions = {
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  syncTouch: false,
  autoRaf: true,
  // In-page anchors are handled in LenisSingleton, not by Lenis's `anchors`
  // option: that scrolls with offset 0 and ignores scroll-margin-top, which
  // parked headings under the fixed header.
  // data-lenis-prevent, data-lenis-prevent-wheel and data-lenis-prevent-touch are
  // honoured by Lenis on every node in the event path; no custom `prevent` needed.
};

export default function SmoothScroll() {
  const finePointer = useFinePointer();
  const reduceMotion = usePrefersReducedMotion();

  // Never instantiated on touch or under reduced motion: native scroll, no RAF loop.
  if (!finePointer || reduceMotion) return null;
  return <LenisSingleton />;
}

function LenisSingleton() {
  const ref = useRef<LenisRef>(null);
  const pathname = usePathname();

  // In-page anchors glide through Lenis but land where the browser would put
  // them: below the target's own scroll-margin-top, with the URL hash updated
  // and keyboard focus moved to the target (so the next Tab starts there).
  // Cross-page hash links are left to the router.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest('a[href*="#"]');
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank') return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.hash.length < 2) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      const lenis = ref.current?.lenis;
      if (!target || !lenis) return;

      event.preventDefault();
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || DEFAULT_ANCHOR_CLEARANCE;
      lenis.scrollTo(target, {
        offset: -margin,
        onComplete: () => {
          if (window.location.hash !== url.hash) window.history.pushState(null, '', url.hash);
          if (!target.matches(FOCUSABLE)) {
            target.setAttribute('tabindex', '-1');
            target.dataset.anchorTarget = ''; // focusable for the jump only: no ring (globals.scss)
          }
          target.focus({ preventScroll: true });
        },
      });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Route change: jump to the top instead of destroying and recreating the
  // instance. Hash targets (e.g. /pricing#estimator) are left to the router.
  useEffect(() => {
    if (window.location.hash) return;
    ref.current?.lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  // `root` binds to window; ReactLenis renders nothing without children and
  // publishes the instance to the root store that `useLenis()` reads.
  return <ReactLenis root ref={ref} options={LENIS_OPTIONS} />;
}
