'use client';

import { useId } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationFrame,
} from 'framer-motion';

interface ScrollOrbProps {
  variant?: 'red' | 'teal' | 'mixed';
  rotationMultiplier?: number;
}

export default function ScrollOrb({ variant = 'red', rotationMultiplier = 1 }: ScrollOrbProps) {
  const uid = useId();

  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 30,
    restDelta: 0.001,
  });

  // Continuous time-based rotation so the orb is always alive
  const elapsed = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    elapsed.set(elapsed.get() + delta / 1000);
  });

  // Scroll-based ring rotation
  const scrollRotate1 = useTransform(smoothProgress, [0, 1], [0, 360]);
  const scrollRotate2 = useTransform(smoothProgress, [0, 1], [0, -240]);
  const scrollRotate3 = useTransform(smoothProgress, [0, 1], [0, 180]);

  // Auto-rotation (continuous, always spinning)
  const autoRotate1 = useTransform(elapsed, (t) => t * 12 * rotationMultiplier);
  const autoRotate2 = useTransform(elapsed, (t) => t * -18 * rotationMultiplier);
  const autoRotate3 = useTransform(elapsed, (t) => t * 25 * rotationMultiplier);

  // Combined rotation: auto + scroll
  const rotate1 = useTransform(() => autoRotate1.get() + scrollRotate1.get());
  const rotate2 = useTransform(() => autoRotate2.get() + scrollRotate2.get());
  const rotate3 = useTransform(() => autoRotate3.get() + scrollRotate3.get());

  const colors = {
    red: {
      core: 'rgba(240, 51, 80, 0.14)',
      mid: 'rgba(196, 33, 60, 0.08)',
      ring1: '#F03350',
      ring2: '#c4213c',
      ring3: '#ff3d5a',
      glow: 'rgba(240, 51, 80, 0.18)',
    },
    teal: {
      core: 'rgba(51, 240, 208, 0.12)',
      mid: 'rgba(51, 240, 208, 0.06)',
      ring1: '#33F0D0',
      ring2: '#28c4a8',
      ring3: '#5ff7de',
      glow: 'rgba(51, 240, 208, 0.15)',
    },
    mixed: {
      core: 'rgba(240, 51, 80, 0.12)',
      mid: 'rgba(51, 240, 208, 0.06)',
      ring1: '#F03350',
      ring2: '#33F0D0',
      ring3: '#c4213c',
      glow: 'rgba(240, 51, 80, 0.15)',
    },
  };

  const c = colors[variant];

  const g1 = `${uid}-grad1`;
  const g2 = `${uid}-grad2`;
  const g3 = `${uid}-grad3`;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* Outer glow */}
      <div
        style={{
          position: 'absolute',
          inset: '-15%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c.glow} 0%, transparent 65%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Core gradient sphere */}
      <div
        style={{
          position: 'absolute',
          inset: '10%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${c.core} 0%, ${c.mid} 40%, transparent 70%)`,
          filter: 'blur(2px)',
        }}
      />

      {/* SVG rotating rings */}
      <svg
        viewBox="0 0 500 500"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id={g1} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.ring1} stopOpacity="0.6" />
            <stop offset="50%" stopColor={c.ring1} stopOpacity="0.08" />
            <stop offset="100%" stopColor={c.ring1} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={g2} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c.ring2} stopOpacity="0.5" />
            <stop offset="50%" stopColor={c.ring2} stopOpacity="0.05" />
            <stop offset="100%" stopColor={c.ring2} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={g3} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={c.ring3} stopOpacity="0.45" />
            <stop offset="50%" stopColor={c.ring3} stopOpacity="0.05" />
            <stop offset="100%" stopColor={c.ring3} stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Ring 1 — outermost */}
        <g transform="translate(250, 250)">
          <motion.g style={{ rotate: rotate1 }}>
            <ellipse cx="0" cy="0" rx="240" ry="240" fill="none" stroke={`url(#${g1})`} strokeWidth="1" />
            <ellipse cx="0" cy="0" rx="235" ry="180" fill="none" stroke={`url(#${g1})`} strokeWidth="0.7" transform="rotate(20)" />
            <ellipse cx="0" cy="0" rx="230" ry="130" fill="none" stroke={`url(#${g1})`} strokeWidth="0.5" transform="rotate(40)" />
          </motion.g>
        </g>

        {/* Ring 2 — mid, counter-rotation */}
        <g transform="translate(250, 250)">
          <motion.g style={{ rotate: rotate2 }}>
            <ellipse cx="0" cy="0" rx="200" ry="200" fill="none" stroke={`url(#${g2})`} strokeWidth="0.8" />
            <ellipse cx="0" cy="0" rx="195" ry="145" fill="none" stroke={`url(#${g2})`} strokeWidth="0.6" transform="rotate(-30)" />
            <ellipse cx="0" cy="0" rx="190" ry="100" fill="none" stroke={`url(#${g2})`} strokeWidth="0.4" transform="rotate(-60)" />
          </motion.g>
        </g>

        {/* Ring 3 — inner, fastest */}
        <g transform="translate(250, 250)">
          <motion.g style={{ rotate: rotate3 }}>
            <ellipse cx="0" cy="0" rx="155" ry="155" fill="none" stroke={`url(#${g3})`} strokeWidth="0.7" />
            <ellipse cx="0" cy="0" rx="150" ry="110" fill="none" stroke={`url(#${g3})`} strokeWidth="0.5" transform="rotate(50)" />
            <ellipse cx="0" cy="0" rx="145" ry="70" fill="none" stroke={`url(#${g3})`} strokeWidth="0.35" transform="rotate(80)" />
          </motion.g>
        </g>

        {/* Central dot */}
        <circle cx="250" cy="250" r="5" fill={c.ring1} opacity="0.4" />
      </svg>

      {/* Inner breathing pulse */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '30%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c.core} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
