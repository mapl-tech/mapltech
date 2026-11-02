'use client';

import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { createSpring, type Spring } from './spring';
import { useFinePointer, usePrefersReducedMotion } from './useMediaQuery';

export type CursorLabel = 'view' | 'drag' | 'play' | 'external' | 'estimate';

export interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  external?: boolean;
  disabled?: boolean;
  /** Sets data-cursor so the cursor pill labels the hover (desktop). */
  cursor?: CursorLabel;
  /** When set, a click dispatches window `cta_click` with { placement, href }. */
  placement?: string;
  'aria-label'?: string;
}

/** Interaction #5: spring config shared with the cursor pill's press feel. */
const SPRING = { stiffness: 350, damping: 18, mass: 0.4 };
const PULL = 0.18;
const MAX_PULL = 12;

const SIZE_CLASS = { small: 'btn-sm', medium: 'btn-md', large: 'btn-lg' } as const;

const BOX_STYLE: CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  verticalAlign: 'middle',
};

const BUTTON_STYLE: CSSProperties = {
  ...BOX_STYLE,
  background: 'none',
  border: 0,
  padding: 0,
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
};

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
  external = false,
  disabled = false,
  cursor,
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
    // Press feedback is CSS (`scale` on :active in globals.scss), which composes
    // with the magnetic transform written by the springs above.
    <span
      ref={surfaceRef}
      className={`magnetic-btn magnetic-btn--${variant} ${SIZE_CLASS[size]} ${className}`.trim()}
      style={{ touchAction: 'manipulation' }}
    >
      <span className="magnetic-btn__text">{children}</span>
      <span className="magnetic-btn__glow" aria-hidden="true" />
    </span>
  );

  const shared = {
    className: 'magnetic-btn-box',
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave,
    onClick: handleClick,
    'data-cursor': cursor,
    'aria-label': ariaLabel,
  };

  if (href) {
    if (external) {
      const newTab = !/^(mailto:|tel:|sms:)/i.test(href);
      return (
        <a
          href={href}
          style={BOX_STYLE}
          {...shared}
          {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {surface}
        </a>
      );
    }
    return (
      <Link href={href} style={BOX_STYLE} {...shared}>
        {surface}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      style={disabled ? { ...BUTTON_STYLE, cursor: 'not-allowed', opacity: 0.5 } : BUTTON_STYLE}
      {...shared}
    >
      {surface}
    </button>
  );
}
