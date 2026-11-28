'use client';

import { useEffect, useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';

/**
 * The proof wall's list, with one touch for a mouse: the tile under the
 * pointer carries its position (--spot-x, --spot-y), and its CSS draws a soft
 * crimson light there on the tiles that are links (Proof.module.scss
 * .tile::before). Mouse only, and the light shows only for a fine pointer
 * with motion allowed; touch, pens and keyboards get the tiles as they are.
 * The work is done at most once a frame, however fast the mouse reports. The
 * tiles themselves stay server rendered (children).
 */
export default function WallSpot({ className, children }: { className: string; children: ReactNode }) {
  const frame = useRef(0);
  const latest = useRef<{ tile: HTMLElement; x: number; y: number } | null>(null);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const onPointerMove = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'mouse') return;
    const tile = (event.target as Element).closest<HTMLElement>('[data-tile]');
    if (!tile || !event.currentTarget.contains(tile)) return;
    latest.current = { tile, x: event.clientX, y: event.clientY };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const spot = latest.current;
      if (!spot) return;
      const box = spot.tile.getBoundingClientRect();
      spot.tile.style.setProperty('--spot-x', `${Math.round(spot.x - box.left)}px`);
      spot.tile.style.setProperty('--spot-y', `${Math.round(spot.y - box.top)}px`);
    });
  };

  return (
    <ul className={className} role="list" onPointerMove={onPointerMove}>
      {children}
    </ul>
  );
}
