import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './Cta.module.scss';

/**
 * CTAs for the work family (/our-work, /labs), in the case template's idiom:
 * plain links, server-rendered, no client JS. The filled style uses the
 * crimson fill and its AA-safe hover (white label 5.01:1 → 5.79:1) from the
 * button-primary mixin. `placement` is written as `data-cta-placement`
 * ("<page>_<slot>"); `hero` marks the hero CTA for the mobile action bar.
 *
 * Labels are fixed site-wide: "Price your project" (estimator) and
 * "Book a call" (/contact-us).
 */
interface BaseProps {
  href: string;
  placement: string;
  children: ReactNode;
  className?: string;
}

export function PrimaryCta({ href, placement, children, className, hero = false }: BaseProps & { hero?: boolean }) {
  return (
    <Link
      href={href}
      className={[styles.primary, className].filter(Boolean).join(' ')}
      data-cta-placement={placement}
      data-hero-cta={hero ? '' : undefined}
    >
      {children}
    </Link>
  );
}

/** Underlined text action ("Book a call", "Read the case study"). External links open in a new tab and say so. */
export function TextCta({
  href,
  placement,
  children,
  className,
  external = false,
  hero = false,
}: BaseProps & { external?: boolean; hero?: boolean }) {
  const cls = [styles.text, className].filter(Boolean).join(' ');
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} data-cta-placement={placement}>
        {children}
        <span className="visually-hidden"> (opens in a new tab)</span>
        <Arrow diagonal />
      </a>
    );
  }
  return (
    <Link href={href} className={cls} data-cta-placement={placement} data-hero-cta={hero ? '' : undefined}>
      {children}
      <Arrow />
    </Link>
  );
}

export function Arrow({ diagonal = false, className }: { diagonal?: boolean; className?: string }) {
  return (
    <svg className={className ?? styles.arrow} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d={diagonal ? 'M4 12 12 4M6 4h6v6' : 'M2.5 8h11M9 3.5 13.5 8 9 12.5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
