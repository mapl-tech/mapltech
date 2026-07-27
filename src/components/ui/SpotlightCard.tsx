'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

type SpotlightCardProps = {
  /** When provided, the card renders as a next/link Link to this href. */
  href?: string;
  /** Element/component to render as when there is no href. Defaults to 'div'. */
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
} & Record<string, unknown>;

/**
 * Wraps a card and paints a soft red spotlight that tracks the cursor within it.
 * Pointer position is written to CSS variables (no React re-render), rAF-throttled,
 * and the glow only reveals on fine-pointer hover - so touch devices pay nothing.
 *
 * Ref-free (reads e.currentTarget) so it can render as any element. When `href` is
 * set it renders next/link internally, so callers only ever pass a serializable
 * string - safe to use from Server Components (no component passed across the RSC boundary).
 */
export default function SpotlightCard({
  href,
  as,
  children,
  className = '',
  ...rest
}: SpotlightCardProps) {
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget; // capture synchronously - stable DOM node
    pos.current = { x: e.clientX, y: e.clientY };
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--spot-x', `${pos.current.x - r.left}px`);
      target.style.setProperty('--spot-y', `${pos.current.y - r.top}px`);
    });
  };

  const Comp: React.ElementType = href ? Link : (as ?? 'div');

  return (
    <Comp
      className={`spotlight-card ${className}`.trim()}
      onMouseMove={handleMove}
      {...(href ? { href } : {})}
      {...rest}
    >
      {children}
      <span className="spotlight-card__glow" aria-hidden="true" />
    </Comp>
  );
}
