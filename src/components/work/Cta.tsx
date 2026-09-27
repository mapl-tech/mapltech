import type { ReactNode } from 'react';
import Link from 'next/link';
import MagneticButton, { type MagneticButtonProps } from '@/components/ui/MagneticButton';

/**
 * CTA wrapper for the work family. Carries `data-cta-placement` (and
 * `data-hero-cta` on the hero primary) on a wrapping span, because
 * MagneticButton exposes `placement` for the `cta_click` event but does not
 * pass arbitrary data attributes through to its anchor.
 */
export interface CtaProps extends Omit<MagneticButtonProps, 'placement'> {
  /** "<page>_<slot>", e.g. "work_hero_primary". */
  placement: string;
  /** Marks the hero primary CTA for the mobile action bar's observer. */
  hero?: boolean;
}

export default function Cta({ placement, hero = false, ...button }: CtaProps) {
  return (
    <span
      data-cta-placement={placement}
      {...(hero ? { 'data-hero-cta': '' } : {})}
      style={{ display: 'inline-block' }}
    >
      <MagneticButton placement={placement} {...button} />
    </span>
  );
}

export interface TextCtaProps {
  href: string;
  placement: string;
  children: ReactNode;
  className?: string;
  cursor?: 'view' | 'external';
  external?: boolean;
}

/** Tertiary text link ("See the work", "Visit MAPL Tours"). */
export function TextCta({ href, placement, children, className, cursor, external = false }: TextCtaProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        data-cta-placement={placement}
        data-cursor={cursor ?? 'external'}
      >
        {children}
        <Arrow diagonal />
      </a>
    );
  }
  return (
    <Link href={href} className={className} data-cta-placement={placement} data-cursor={cursor}>
      {children}
      <Arrow />
    </Link>
  );
}

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <path
        d={diagonal ? 'M3 11 11 3M5 3h6v6' : 'M2 7h10M8 3l4 4-4 4'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
