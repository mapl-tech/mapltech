'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './IndexRows.module.scss';

/**
 * The index rows' one enhancement, after the homepage's services index: with
 * a mouse (and motion allowed), real work for the row under the pointer trails
 * the cursor, eased in a rAF loop that writes only a transform. Keyboard focus
 * shows the same preview beside the focused row. Touch and reduced motion get
 * the same frames inline in each row instead (CSS), so this adds nothing there.
 *
 * The rows themselves are server-rendered children; this only listens on
 * their container and positions the decorative frames (aria-hidden). A row's
 * frame shows over its `[data-index]` element (the service link), so the
 * small links under it never carry a preview of another project.
 */
export default function IndexPreview({ frames, children }: { frames: readonly ReactNode[]; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const preview = previewRef.current;
    if (!root || !preview) return;
    const query = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let placed = false;

    const indexOf = (target: EventTarget | null) => {
      const row = target instanceof Element ? target.closest<HTMLElement>('[data-index]') : null;
      return row && root.contains(row) ? Number(row.dataset.index) : null;
    };
    const loop = () => {
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;
      preview.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const aim = (nextX: number, nextY: number) => {
      targetX = nextX;
      targetY = nextY;
      if (!placed) {
        x = targetX;
        y = targetY;
        placed = true;
      }
      if (!frame) frame = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      if (!query.matches || event.pointerType !== 'mouse') return;
      const rect = root.getBoundingClientRect();
      // Right of the cursor, vertically centred on it; flipped left near the right edge.
      const width = preview.offsetWidth;
      const px = event.clientX - rect.left;
      const left = px + 32 + width > rect.width ? px - 32 - width : px + 32;
      aim(left, event.clientY - rect.top - preview.offsetHeight / 2);
      setActive(indexOf(event.target));
    };
    const onLeave = () => {
      placed = false;
      setActive(null);
    };
    const onFocusIn = (event: FocusEvent) => {
      const index = indexOf(event.target);
      if (!query.matches) return;
      // A link under a row (its example, its actions): no preview there.
      if (index === null) {
        setActive(null);
        return;
      }
      const row = (event.target as HTMLElement).closest<HTMLElement>('[data-index]');
      if (!row) return;
      const rect = root.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      placed = false;
      aim(rect.width - preview.offsetWidth - 96, rowRect.top - rect.top + rowRect.height / 2 - preview.offsetHeight / 2);
      setActive(index);
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!root.contains(event.relatedTarget as Node | null)) setActive(null);
    };

    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.body}>
      {children}
      <div ref={previewRef} className={styles.preview} data-on={active !== null ? '' : undefined} aria-hidden="true">
        {frames.map((node, i) => (
          <div key={i} className={styles.previewFrame} data-shown={active === i ? '' : undefined}>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}
