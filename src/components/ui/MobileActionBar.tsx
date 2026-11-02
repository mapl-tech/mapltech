'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrefersReducedMotion } from './useMediaQuery';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { MOBILE_BAR_CONTEXT } from '@/components/flagship/content';

/**
 * Interaction #9: sticky mobile action bar (md:hidden).
 *
 * It repeats the page's own hero action: the link marked `data-hero-cta` (or
 * the first link inside it) gives the label and the target, so a service page
 * opens the estimator with its service selected and /referral offers "Refer an
 * agency". Without a hero link it offers "Start a project". The context line
 * is the hero CTA's `data-bar-context` if set, else the public price floor for
 * pricing actions, else nothing.
 *
 * Appears once the hero CTA (fallback: the page H1) has left the viewport;
 * hides while any <form> is in view or the keyboard is up. While it shows, the
 * page gets bottom scroll padding so a focused control is never hidden under
 * it (WCAG 2.4.11). Clicks dispatch `cta_click` on window with
 * { placement: 'sticky_bar', action, href }.
 */

export interface MobileActionBarProps {
  estimateHref?: string;
  estimateLabel?: string;
  /** Context beside the estimator action (price floor, reassurance). */
  context?: string;
}

interface BarAction {
  path: string;
  href: string;
  label: string;
  context: string;
}

const KEYBOARD_RATIO = 0.75;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** The bar's height plus a margin: how far focused controls stay above it. */
const FOCUS_CLEARANCE = '88px';

const BAR_STYLE: CSSProperties = {
  background: 'rgba(10, 10, 10, 0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
};

const PRIMARY_STYLE: CSSProperties = {
  minHeight: 48,
  background: 'var(--bar-primary-bg, #D91C3F)', // crimson fill: white label 5.01:1
  color: '#ffffff',
  fontSize: 17,
  fontWeight: 600,
};

const isEstimate = (href: string) => href.startsWith('/pricing') || href === '#estimator';

function emit(action: 'estimate' | 'hero', href: string) {
  window.dispatchEvent(
    new CustomEvent('cta_click', { detail: { placement: 'sticky_bar', action, href } }),
  );
}

export default function MobileActionBar({
  estimateHref = PROJECT_HREF,
  estimateLabel = PROJECT_LABEL,
  context = MOBILE_BAR_CONTEXT,
}: MobileActionBarProps) {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  const [heroGone, setHeroGone] = useState(false);
  const [formInView, setFormInView] = useState(false);
  const [keyboardUp, setKeyboardUp] = useState(false);
  // The page's hero action, keyed by path so a previous page's never shows.
  const [pageAction, setPageAction] = useState<BarAction | null>(null);

  // Hero CTA and form visibility, re-observed on every route.
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    let raf = 0;

    const heroCta = document.querySelector('[data-hero-cta]');
    const heroLink = heroCta?.matches('a[href]') ? heroCta : heroCta?.querySelector('a[href]');
    const href = heroLink?.getAttribute('href');
    const action: BarAction | null =
      heroCta && heroLink && href
        ? {
            path: pathname,
            href,
            label: (heroLink.textContent ?? '').replace(/[\s→]+$/u, '').trim() || estimateLabel,
            context: heroCta.getAttribute('data-bar-context') ?? (isEstimate(href) ? context : ''),
          }
        : null;
    const actionFrame = requestAnimationFrame(() => setPageAction(action));

    const hero = heroCta ?? document.querySelector('main h1') ?? document.querySelector('h1');
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
      cancelAnimationFrame(actionFrame);
    };
  }, [pathname, estimateLabel, context]);

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
  const action = pageAction?.path === pathname ? pageAction : null;
  const href = action?.href ?? estimateHref;
  const label = action?.label ?? estimateLabel;
  // The price-floor line only ever sits beside a pricing action.
  const line = action ? action.context : isEstimate(href) ? context : '';

  // Keep focused controls clear of the bar while it covers the bottom edge.
  // Restores whatever was there before (the pricing estimate bar sets its own).
  useEffect(() => {
    if (!visible) return;
    const root = document.documentElement;
    const previous = root.style.scrollPaddingBottom;
    root.style.scrollPaddingBottom = FOCUS_CLEARANCE;
    return () => {
      root.style.scrollPaddingBottom = previous;
    };
  }, [visible]);

  const transition = reduceMotion
    ? 'none'
    : visible
      ? `transform 240ms ${EASE}, visibility 0s`
      : `transform 240ms ${EASE}, visibility 0s linear 240ms`;

  const linkProps = {
    className: 'mobile-action-bar__primary flex shrink-0 items-center justify-center rounded-full px-5 text-center',
    style: PRIMARY_STYLE,
    onClick: () => emit(isEstimate(href) ? 'estimate' : 'hero', href),
  };

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
      {/* One action only (Sentinel sticky-mobile-cta-bar): context left, the CTA right. */}
      <div className={`flex items-center gap-3 px-4 py-2${line ? '' : ' justify-end'}`}>
        {line ? (
          <p className="m-0 flex-1 text-[15px] leading-tight" style={{ color: 'rgba(246, 243, 239, 0.78)' }}>
            {line}
          </p>
        ) : null}
        {/* Same-page fragments are plain anchors (no router round trip). */}
        {href.startsWith('#') ? (
          <a href={href} {...linkProps}>
            {label}
          </a>
        ) : (
          <Link href={href} {...linkProps}>
            {label}
          </Link>
        )}
      </div>
    </div>
  );
}
