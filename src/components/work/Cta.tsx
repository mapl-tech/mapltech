import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './Cta.module.scss';

/**
 * CTAs for the work family (/our-work, /labs), in the homepage's idiom: plain
 * links, server-rendered, no client JS. The filled pill is the homepage hero's
 * (crimson #D91C3F, white label 5.01:1); the text action draws its underline
 * away on hover. `placement` is written as `data-cta-placement`
 * ("<page>_<slot>"); `hero` marks the page's hero CTA for the mobile action bar
 * and the header.
 *
 * Labels come from the caller; the site-wide vocabulary lives in
 * components/layout/chrome.ts ("Start a project", "See pricing").
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
      <span aria-hidden="true" className={styles.arrow}>
        →
      </span>
    </Link>
  );
}

/**
 * Text action ("See pricing", "Read the case study"). Takes the surrounding
 * text colour; `tone="paper"` swaps the focus ring to the ink-safe crimson.
 * External links open in a new tab and say so. `arrow={false}` sets it as the
 * site's quiet secondary (the hero and close-band "See pricing": words only).
 */
export function TextCta({
  href,
  placement,
  children,
  className,
  external = false,
  hero = false,
  tone = 'dark',
  arrow = true,
}: BaseProps & { external?: boolean; hero?: boolean; tone?: 'dark' | 'paper'; arrow?: boolean }) {
  const cls = [styles.text, className].filter(Boolean).join(' ');
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} data-tone={tone} data-cta-placement={placement}>
        {children}
        <span className="visually-hidden"> (opens in a new tab)</span>
        <span aria-hidden="true" className={styles.arrow}>
          ↗
        </span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} data-tone={tone} data-cta-placement={placement} data-hero-cta={hero ? '' : undefined}>
      {children}
      {arrow ? (
        <span aria-hidden="true" className={styles.arrow}>
          →
        </span>
      ) : null}
    </Link>
  );
}
