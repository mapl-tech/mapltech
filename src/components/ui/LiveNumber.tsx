'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createSpring, type Spring, type SpringOptions } from './spring';
import { usePrefersReducedMotion } from './useMediaQuery';

/**
 * Interaction #7: a number that springs to its new value.
 *
 * The animated digits are written straight to the DOM from a spring
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
  /**
   * Visual only: no live region and no hidden copy, for callers that announce
   * a composed sentence themselves (a range is one announcement, not two).
   */
  decorative?: boolean;
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

/** Accepts the framer-motion-shaped options callers already pass. */
function springOptions({ stiffness, damping, mass }: SpringOptions): SpringOptions {
  return { stiffness, damping, mass };
}

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
  decorative = false,
}: LiveNumberProps) {
  const reduceMotion = usePrefersReducedMotion();
  const digits = useRef<HTMLSpanElement>(null);
  const animated = useRef<Spring | null>(null);

  // Captured once so React never rewrites the animated span after mount;
  // from then on the spring (and a change of format, below) owns its text.
  const [initialText] = useState(() => `${prefix}${format(value)}${suffix}`);
  const finalText = `${prefix}${format(value)}${suffix}`;

  // Latest formatting, read by the spring callback without re-creating the spring,
  // and the value the digits show right now (mid-spring included).
  const view = useRef({ prefix, suffix, format });
  const shown = useRef(value);

  // The spring only writes when the value moves, so a new prefix, suffix or format at
  // the same value ("$3,500+" becoming the "$3,500" of "$3,500–$5,000", the same
  // instance reused by the parent) is written here: the digits always match the props.
  useEffect(() => {
    view.current = { prefix, suffix, format };
    if (digits.current) digits.current.textContent = `${prefix}${format(shown.current)}${suffix}`;
  }, [prefix, suffix, format]);

  useEffect(() => {
    const instance = createSpring(value, { restDelta: 0.5, ...springOptions(spring) }, (v) => {
      const { prefix: p, suffix: s, format: f } = view.current;
      shown.current = v;
      if (digits.current) digits.current.textContent = `${p}${f(v)}${s}`;
    });
    animated.current = instance;
    return () => instance.stop();
    // The spring is created once; its options are fixed for the component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reduceMotion) animated.current?.jump(value);
    else animated.current?.set(value);
  }, [value, reduceMotion]);

  if (decorative) {
    return (
      <span id={id} className={className} aria-hidden="true">
        <span ref={digits}>{initialText}</span>
      </span>
    );
  }

  return (
    <output id={id} htmlFor={htmlFor} className={className} aria-live="polite" aria-atomic="true">
      <span ref={digits} aria-hidden="true">
        {initialText}
      </span>
      <span style={VISUALLY_HIDDEN}>{finalText}</span>
    </output>
  );
}
