'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, type LenisRef } from 'lenis/react';
import type { LenisOptions } from 'lenis';
import { frame, cancelFrame } from 'framer-motion';
import { useFinePointer, usePrefersReducedMotion } from './useMediaQuery';

/**
 * Returns the site-wide Lenis instance, or `undefined` on touch devices, under
 * reduced motion, and during SSR. Callers must handle `undefined` (native scroll).
 *
 * `useLenis((lenis) => ...)` also accepts a scroll callback, see lenis/react.
 */
export { useLenis } from 'lenis/react';

/** Interaction #12: weighted scroll, desktop only. */
const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.1,
  smoothWheel: true,
  syncTouch: false,
  autoRaf: false,
  // <a href="#section"> clicks (Backbone nodes, in-page links) scroll through Lenis.
  anchors: true,
  // data-lenis-prevent, data-lenis-prevent-wheel and data-lenis-prevent-touch are
  // honoured by Lenis on every node in the event path; no custom `prevent` needed.
};

type FrameProcess = Parameters<typeof frame.update>[0];

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

  // Tick Lenis from Framer's frameloop so the site runs a single RAF.
  useEffect(() => {
    const tick: FrameProcess = (data) => {
      ref.current?.lenis?.raf(data.timestamp);
    };
    frame.update(tick, true);
    return () => cancelFrame(tick);
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
