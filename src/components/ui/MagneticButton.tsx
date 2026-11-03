'use client';

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { createSpring, type Spring } from './spring';
import { useFinePointer, usePrefersReducedMotion } from './useMediaQuery';
import styles from './MagneticButton.module.scss';

export interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  /** Applied to the visual surface, so it can resize or restyle the button. */
  className?: string;
  /** Stretch to the container's width (phone menu). */
  block?: boolean;
  external?: boolean;
  disabled?: boolean;
  /** When set, a click dispatches window `cta_click` with { placement, href }. */
  placement?: string;
  'aria-label'?: string;
}

/** Interaction #5: the magnetic pull's spring. */
const SPRING = { stiffness: 350, damping: 18, mass: 0.4 };
const PULL = 0.18;
const MAX_PULL = 12;

const SIZE_CLASS = { small: styles.sm, medium: styles.md, large: styles.lg } as const;

const clamp = (n: number) => Math.max(-MAX_PULL, Math.min(MAX_PULL, n));

/** Analytics hook: `window.addEventListener('cta_click', (e) => e.detail.placement)`. */
export function emitCtaClick(placement: string, href?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cta_click', { detail: { placement, href } }));
}

export default function MagneticButton({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  className = '',
  block = false,
  external = false,
  disabled = false,
  placement,
  'aria-label': ariaLabel,
}: MagneticButtonProps) {
  // The magnetic lean: two springs writing one transform to the surface span.
  const surfaceRef = useRef<HTMLSpanElement>(null);
  const springs = useRef<{ x: Spring; y: Spring } | null>(null);
  useEffect(() => {
    let x = 0;
    let y = 0;
    const write = () => {
      if (surfaceRef.current) surfaceRef.current.style.transform = x || y ? `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)` : '';
    };
    const pair = {
      x: createSpring(0, SPRING, (v) => ((x = v), write())),
      y: createSpring(0, SPRING, (v) => ((y = v), write())),
    };
    springs.current = pair;
    return () => {
      pair.x.stop();
      pair.y.stop();
      springs.current = null;
    };
  }, []);

  const finePointer = useFinePointer();
  const reduceMotion = usePrefersReducedMotion();
  const magnetic = finePointer && !reduceMotion;

  // Zero React state per move: pointer position goes straight to motion values
  // (magnetism) and CSS variables (radial highlight) on the visual surface.
  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const box = e.currentTarget;
      const rect = box.getBoundingClientRect();
      const surface = box.firstElementChild as HTMLElement | null;
      surface?.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      surface?.style.setProperty('--my', `${e.clientY - rect.top}px`);
      if (!magnetic) return;
      springs.current?.x.set(clamp((e.clientX - (rect.left + rect.width / 2)) * PULL));
      springs.current?.y.set(clamp((e.clientY - (rect.top + rect.height / 2)) * PULL));
    },
    [magnetic],
  );

  const handlePointerLeave = useCallback(() => {
    springs.current?.x.set(0);
    springs.current?.y.set(0);
  }, []);

  const handleClick = () => {
    if (placement) emitCtaClick(placement, href);
    onClick?.();
  };

  // The transform lives on this inner surface; the <a>/<button> box never moves,
  // so the hit area and layout stay stable while the label leans toward the pointer.
  const surface = (
    // Press feedback is CSS (`scale` on the box's :active), which composes
    // with the magnetic transform written by the springs above.
    <span ref={surfaceRef} className={`${styles.surface} ${styles[variant]} ${SIZE_CLASS[size]} ${className}`.trim()}>
      <span className={styles.text}>{children}</span>
      <span className={styles.glow} aria-hidden="true" />
    </span>
  );

  const boxClass = block ? `${styles.box} ${styles.block}` : styles.box;
  const shared = {
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    onClick: handleClick,
    'aria-label': ariaLabel,
  };

  if (href) {
    if (external) {
      const newTab = !/^(mailto:|tel:|sms:)/i.test(href);
      return (
        <a
          href={href}
          className={boxClass}
          {...shared}
          {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {surface}
        </a>
      );
    }
    return (
      <Link href={href} className={boxClass} {...shared}>
        {surface}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={`${boxClass} ${styles.reset}`} {...shared}>
      {surface}
    </button>
  );
}
