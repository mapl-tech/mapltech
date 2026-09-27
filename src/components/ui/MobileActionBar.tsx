'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrefersReducedMotion } from './useMediaQuery';

/**
 * Interaction #9: sticky mobile action bar (md:hidden).
 *
 * Appears once the element marked `data-hero-cta` (fallback: the page H1) has
 * left the viewport; hides while any <form> is in view or the keyboard is up.
 * Clicks dispatch `cta_click` on window with { placement: 'sticky_bar', action }.
 */

export interface MobileActionBarProps {
  estimateHref?: string;
  estimateLabel?: string;
  /** E.164 number for the tel: link. */
  phone?: string;
  callLabel?: string;
}

const KEYBOARD_RATIO = 0.75;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

const BAR_STYLE: CSSProperties = {
  background: 'rgba(10, 10, 10, 0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
};

const PRIMARY_STYLE: CSSProperties = {
  minHeight: 52,
  background: 'var(--bar-primary-bg, #F03350)',
  color: '#ffffff',
  fontSize: 17,
  fontWeight: 600,
};

const SECONDARY_STYLE: CSSProperties = {
  minHeight: 52,
  minWidth: 88,
  border: '1px solid rgba(255, 255, 255, 0.18)',
  color: '#ffffff',
  fontSize: 17,
  fontWeight: 600,
};

function emit(action: 'estimate' | 'call', href: string) {
  window.dispatchEvent(
    new CustomEvent('cta_click', { detail: { placement: 'sticky_bar', action, href } }),
  );
}

export default function MobileActionBar({
  estimateHref = '/pricing#estimator',
  estimateLabel = 'Get a 60-second estimate',
  phone = '+16473756724',
  callLabel = 'Call',
}: MobileActionBarProps) {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const [heroGone, setHeroGone] = useState(false);
  const [formInView, setFormInView] = useState(false);
  const [keyboardUp, setKeyboardUp] = useState(false);

  // Hero CTA and form visibility, re-observed on every route.
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    let raf = 0;

    const hero =
      document.querySelector('[data-hero-cta]') ??
      document.querySelector('main h1') ??
      document.querySelector('h1');
    if (hero) {
      const heroIO = new IntersectionObserver(
        ([entry]) => setHeroGone(!entry.isIntersecting),
        { threshold: 0 },
      );
      heroIO.observe(hero);
      observers.push(heroIO);
    } else {
      raf = requestAnimationFrame(() => setHeroGone(true));
    }

    const forms = Array.from(document.querySelectorAll('form'));
    if (forms.length > 0) {
      const inView = new Set<Element>();
      const formIO = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) inView.add(entry.target);
            else inView.delete(entry.target);
          }
          setFormInView(inView.size > 0);
        },
        { threshold: 0.05 },
      );
      forms.forEach((form) => formIO.observe(form));
      observers.push(formIO);
    } else {
      raf = requestAnimationFrame(() => setFormInView(false));
    }

    return () => {
      observers.forEach((io) => io.disconnect());
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // Soft keyboard: the visual viewport shrinks while the layout viewport does not.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () =>
      setKeyboardUp(vv.height < document.documentElement.clientHeight * KEYBOARD_RATIO);
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  const visible = heroGone && !formInView && !keyboardUp;

  const transition = reduceMotion
    ? 'none'
    : visible
      ? `transform 240ms ${EASE}, visibility 0s`
      : `transform 240ms ${EASE}, visibility 0s linear 240ms`;

  return (
    <div
      className="mobile-action-bar fixed inset-x-0 bottom-0 z-[200] md:hidden pb-[env(safe-area-inset-bottom)]"
      data-visible={visible ? 'true' : 'false'}
      style={{
        ...BAR_STYLE,
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        visibility: visible ? 'visible' : 'hidden',
        transition,
      }}
    >
      <div className="flex items-stretch gap-2 px-4 py-2">
        <Link
          href={estimateHref}
          className="mobile-action-bar__primary flex flex-1 items-center justify-center rounded-full text-center"
          style={PRIMARY_STYLE}
          onClick={() => emit('estimate', estimateHref)}
        >
          {estimateLabel}
        </Link>
        <a
          href={`tel:${phone}`}
          className="mobile-action-bar__call flex items-center justify-center rounded-full"
          style={SECONDARY_STYLE}
          onClick={() => emit('call', `tel:${phone}`)}
        >
          {callLabel}
        </a>
      </div>
    </div>
  );
}
