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

/** Clearance under the fixed header if the page sets no scroll-padding-top. */
const DEFAULT_ANCHOR_CLEARANCE = 88;

/**
 * Where an in-page jump should leave `target`: the same place the browser's own
 * hash jump and focus scrolling put it, i.e. the root's scroll-padding-top (the
 * fixed header plus 16px, globals.scss) plus the target's own scroll-margin-top
 * (breathing room only). Lenis gets this as its offset, negated.
 */
export function anchorOffset(target: Element): number {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || DEFAULT_ANCHOR_CLEARANCE;
  return padding + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
}

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
  // Driven by LenisSingleton's own loop, which runs only while a glide is in
  // progress: Lenis's autoRaf ticks every frame forever, even on an idle page.
  autoRaf: false,
  // In-page anchors are handled in LenisSingleton, not by Lenis's `anchors`
  // option: that scrolls with offset 0 and ignores the header clearance, which
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
  // them (anchorOffset), with the URL hash updated
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
      // Glide from where the page really is. Lenis aims at an element from its own record of the
      // scroll, which a native scroll updates only when that scroll's event fires: a click in the
      // same frame as one (a browser's or a tool's scroll-into-view before it clicks) aimed from the
      // old position and parked the page far from the target (Nov 7, 2026, /nigeria's price rows).
      if (Math.abs(lenis.animatedScroll - window.scrollY) > 1) lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      lenis.scrollTo(target, {
        offset: -anchorOffset(target),
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

  // The frame loop, only while Lenis is gliding: a wheel turn or any scrollTo
  // (anchors, the estimator) wakes it, and it stops when the glide ends, so an
  // idle page runs no frames. Every glide steps exactly as autoRaf did.
  useEffect(() => {
    let frame = 0;
    let tries = 0;
    let cleanup: (() => void) | undefined;
    const attach = () => {
      const lenis = ref.current?.lenis;
      if (!lenis) {
        if (tries++ < 60) frame = requestAnimationFrame(attach);
        return;
      }
      frame = 0;
      const tick = (time: number) => {
        lenis.raf(time);
        frame = lenis.isScrolling ? requestAnimationFrame(tick) : 0;
      };
      const wake = () => {
        if (frame) return;
        // Restart Lenis's clock, so the first step after a pause is one frame, not the pause.
        lenis.time = performance.now();
        frame = requestAnimationFrame(tick);
      };
      const scrollTo = lenis.scrollTo.bind(lenis);
      lenis.scrollTo = ((...args: Parameters<typeof scrollTo>) => {
        scrollTo(...args);
        wake();
      }) as typeof lenis.scrollTo;
      window.addEventListener('wheel', wake, { passive: true });
      cleanup = () => {
        window.removeEventListener('wheel', wake);
        lenis.scrollTo = scrollTo;
      };
    };
    attach();
    return () => {
      cancelAnimationFrame(frame);
      cleanup?.();
    };
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
