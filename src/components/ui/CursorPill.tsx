'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Interaction #6: the cursor pill (implementation).
 *
 * Loaded through CursorGlow.tsx with next/dynamic({ ssr: false }), only on
 * fine-pointer devices without reduced motion. A 56px soft red glow trails the
 * native pointer (never hidden); over `[data-cursor]` it layout-morphs into a
 * label pill. One document listener, pointer-events: none, no React state per
 * frame (position lives in motion values).
 */

export const CURSOR_LABELS: Record<string, string> = {
  view: 'View case study',
  drag: 'Drag',
  play: 'Play',
  external: 'Opens site',
  estimate: 'Adjust',
};

const GLOW_SIZE = 56;
const FOLLOW = { stiffness: 520, damping: 40, mass: 0.35 };

const OUTER: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 9000,
  pointerEvents: 'none',
  translate: '-50% -50%',
};

const DOT: CSSProperties = {
  width: GLOW_SIZE,
  height: GLOW_SIZE,
  borderRadius: 9999,
  background:
    'radial-gradient(circle, rgba(240, 51, 80, 0.45) 0%, rgba(240, 51, 80, 0.12) 45%, transparent 70%)',
};

const PILL: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 32,
  padding: '0 14px',
  borderRadius: 9999,
  background: '#F03350',
  color: '#ffffff',
  whiteSpace: 'nowrap',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontFamily: 'var(--font-jetbrains-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
};

export default function CursorPill() {
  const x = useMotionValue(-GLOW_SIZE);
  const y = useMotionValue(-GLOW_SIZE);
  const springX = useSpring(x, FOLLOW);
  const springY = useSpring(y, FOLLOW);
  const opacity = useMotionValue(0);

  // Label changes are discrete (enter/leave a [data-cursor] element), so a
  // single piece of React state is fine; position never touches React.
  const [label, setLabel] = useState<string | null>(null);
  const currentLabel = useRef<string | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (opacity.get() === 0) opacity.set(1);
    };
    // The nearest [data-cursor] ancestor decides the label. Unknown keys are
    // shown verbatim so pages can add one-off labels without touching this map.
    const onOver = (e: PointerEvent) => {
      const host = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-cursor]') : null;
      const key = host?.dataset.cursor ?? null;
      const next = key ? (CURSOR_LABELS[key] ?? key) : null;
      if (next !== currentLabel.current) {
        currentLabel.current = next;
        setLabel(next);
      }
    };
    const onLeave = () => opacity.set(0);
    const onEnter = () => opacity.set(1);

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.documentElement.addEventListener('pointerenter', onEnter);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeEventListener('pointerenter', onEnter);
    };
  }, [x, y, opacity]);

  return (
    <motion.div aria-hidden="true" className="cursor-pill" style={{ ...OUTER, x: springX, y: springY, opacity }}>
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
        className={label ? 'cursor-pill__body cursor-pill__body--label' : 'cursor-pill__body'}
        style={label ? PILL : DOT}
      >
        {label ? (
          <motion.span
            key={label}
            className="cursor-pill__label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12 }}
          >
            {label}
          </motion.span>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
