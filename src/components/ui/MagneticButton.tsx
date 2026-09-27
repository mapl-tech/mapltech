'use client';

import { useCallback, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

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
      x.set(clamp((e.clientX - (rect.left + rect.width / 2)) * PULL));
      y.set(clamp((e.clientY - (rect.top + rect.height / 2)) * PULL));
    },
    [magnetic, x, y],
  );

  const handlePointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const handleClick = () => {
    if (placement) emitCtaClick(placement, href);
    onClick?.();
  };

  // The transform lives on this inner surface; the <a>/<button> box never moves,
  // so the hit area and layout stay stable while the label leans toward the pointer.
  const surface = (
    <motion.span
      className={`magnetic-btn magnetic-btn--${variant} ${SIZE_CLASS[size]} ${className}`.trim()}
      style={{ x: springX, y: springY, touchAction: 'manipulation' }}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.97 }}
    >
      <span className="magnetic-btn__text">{children}</span>
      <span className="magnetic-btn__glow" aria-hidden="true" />
    </motion.span>
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
