'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEstimateBriefHref } from './useEstimateBriefHref';
import { useMediaQuery, usePrefersReducedMotion } from './useMediaQuery';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { MOBILE_BAR_CONTEXT } from '@/components/flagship/content';
import MailHint from '@/components/editorial/MailHint';
import styles from './MobileActionBar.module.scss';

/**
 * Interaction #9: sticky mobile action bar (hidden from 768px).
 *
 * It repeats the page's own hero action: the link marked `data-hero-cta` (or
 * the first link inside it) gives the label and the target, so a service page
 * opens the estimator with its service selected and /referral offers "Refer an
 * agency". The hero CTA's `data-bar-label` / `data-bar-href` override them
 * where the bar should do something else (careers: "Apply" to the form).
 * Without a hero link it offers "Start a project". The context line is the
 * hero CTA's `data-bar-context` if set, else the public price floor for
 * pricing actions, else nothing.
 *
 * Appears once the page H1 and the hero CTA have both left the viewport (so
 * a hero without its own action is never covered at load); hides while that
 * CTA, any <form>, the page's close band (it carries the same ask) or the
 * keyboard is up. While it shows, the
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
  // The bar is display:none from md (768px), so wider screens reserve no room for it.
  const onPhone = useMediaQuery('(max-width: 767.98px)');
  // On /pricing, once there is an estimate, the bar's next step carries it.
  const briefWithEstimate = useEstimateBriefHref(pathname);
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
    const href = heroCta?.getAttribute('data-bar-href') ?? heroLink?.getAttribute('href');
    const action: BarAction | null =
      heroCta && heroLink && href
        ? {
            path: pathname,
            href,
            label:
              heroCta.getAttribute('data-bar-label') ??
              ((heroLink.textContent ?? '').replace(/[\s→]+$/u, '').trim() || estimateLabel),
            context: heroCta.getAttribute('data-bar-context') ?? (isEstimate(href) ? context : ''),
          }
        : null;
    const actionFrame = requestAnimationFrame(() => setPageAction(action));

    // The bar waits until the page's H1 has scrolled away and stands down while
    // the page's own action is on screen. Where that action sits further down
    // (a case study's close band), the bar no longer covers the hero at load.
    const heading = document.querySelector('main h1') ?? document.querySelector('h1');
    const watched = [heading, heroCta].filter((el): el is Element => Boolean(el));
    if (watched.length > 0) {
      const onScreen = new Set<Element>();
      const heroIO = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) onScreen.add(entry.target);
            else onScreen.delete(entry.target);
          }
          setHeroGone(onScreen.size === 0);
        },
        { threshold: 0 },
      );
      watched.forEach((el) => heroIO.observe(el));
      observers.push(heroIO);
    } else {
      raf = requestAnimationFrame(() => setHeroGone(true));
    }

    // Forms, the close band and any region marked data-bar-stand-down (a list with
    // its own per-row actions): the page is already asking, so the bar stands down.
    const forms = Array.from(document.querySelectorAll('form, [data-page-close], [data-bar-stand-down]'));
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
  // With an estimate on /pricing the bar stops looping back to the estimator and
  // offers the brief with that estimate in it.
  const href = briefWithEstimate ?? action?.href ?? estimateHref;
  const label = briefWithEstimate ? PROJECT_LABEL : (action?.label ?? estimateLabel);
  // The price-floor line only ever sits beside a pricing action.
  const line = briefWithEstimate ? '' : action ? action.context : isEstimate(href) ? context : '';

  // Keep focused controls clear of the bar while it covers the bottom edge.
  // Restores whatever was there before (the pricing estimate bar sets its own).
  useEffect(() => {
    if (!visible || !onPhone) return;
    const root = document.documentElement;
    const previous = root.style.scrollPaddingBottom;
    root.style.scrollPaddingBottom = FOCUS_CLEARANCE;
    return () => {
      root.style.scrollPaddingBottom = previous;
    };
  }, [visible, onPhone]);

  const transition = reduceMotion
    ? 'none'
    : visible
      ? `transform 240ms ${EASE}, visibility 0s`
      : `transform 240ms ${EASE}, visibility 0s linear 240ms`;

  const linkProps = {
    className: styles.primary,
    onClick: () => emit(isEstimate(href) ? 'estimate' : 'hero', href),
  };

  return (
    <div
      className={`mobile-action-bar ${styles.bar}`}
      data-visible={visible ? 'true' : 'false'}
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        visibility: visible ? 'visible' : 'hidden',
        transition,
      }}
    >
      <div className={styles.row} data-solo={line ? undefined : ''}>
        {line ? <p className={styles.line}>{line}</p> : null}
        {/* Same-page fragments and email links (a legal page's request) are
            plain anchors: no router round trip, and an email link says it
            opens the mail app, as the page's own email buttons do. */}
        {href.startsWith('#') || href.startsWith('mailto:') ? (
          <a href={href} {...linkProps}>
            {label}
            {href.startsWith('mailto:') ? <MailHint /> : null}
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
