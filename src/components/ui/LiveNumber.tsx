'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useMotionValue, useMotionValueEvent, useSpring, type SpringOptions } from 'framer-motion';
import { usePrefersReducedMotion } from './useMediaQuery';

/**
 * Interaction #7: a number that springs to its new value.
 *
 * The animated digits are written straight to the DOM from a MotionValue
 * (no React state per frame). SSR renders the final formatted value as text,
 * and a visually hidden copy carries the final value to `aria-live`, so screen
 * readers hear one announcement per change instead of every frame.
 */

export interface LiveNumberProps {
  value: number;
  /** Formats the interpolated value; defaults to en-CA integer grouping. */
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
  spring?: SpringOptions;
  /** ids of the controls that drive this value (<output for>). */
  htmlFor?: string;
  id?: string;
}

const DEFAULT_SPRING: SpringOptions = { stiffness: 120, damping: 22, mass: 0.6 };

const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export const formatInteger = (n: number) => Math.round(n).toLocaleString('en-CA');

export const formatCad = (n: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(
    Math.round(n),
  );

export default function LiveNumber({
  value,
  format = formatInteger,
  prefix = '',
  suffix = '',
  className,
  spring = DEFAULT_SPRING,
  htmlFor,
  id,
}: LiveNumberProps) {
  const reduceMotion = usePrefersReducedMotion();
  const source = useMotionValue(value);
  const animated = useSpring(source, spring);
  const digits = useRef<HTMLSpanElement>(null);

  // Captured once so React never rewrites the animated span after mount;
  // from then on the MotionValue owns its text.
  const [initialText] = useState(() => `${prefix}${format(value)}${suffix}`);
  const finalText = `${prefix}${format(value)}${suffix}`;

  useEffect(() => {
    if (reduceMotion) {
      source.jump(value);
      animated.jump(value);
    } else {
      source.set(value);
    }
  }, [value, reduceMotion, source, animated]);

  useMotionValueEvent(animated, 'change', (v) => {
    if (digits.current) digits.current.textContent = `${prefix}${format(v)}${suffix}`;
  });

  return (
    <output id={id} htmlFor={htmlFor} className={className} aria-live="polite" aria-atomic="true">
      <span ref={digits} aria-hidden="true">
        {initialText}
      </span>
      <span style={VISUALLY_HIDDEN}>{finalText}</span>
    </output>
  );
}
