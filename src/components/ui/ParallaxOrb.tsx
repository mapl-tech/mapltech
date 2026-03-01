'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollOrb from './ScrollOrb';

interface ParallaxOrbProps {
  variant?: 'red' | 'teal' | 'mixed';
  rotationMultiplier?: number;
  side: 'left' | 'right';
  className?: string;
}

export default function ParallaxOrb({
  variant = 'red',
  rotationMultiplier = 1,
  side,
  className,
}: ParallaxOrbProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Vertical: orb starts at top and drifts downward as section scrolls through viewport
  const y = useTransform(scrollYProgress, [0, 1], ['-30%', '30%']);

  // Horizontal: left orbs drift right, right orbs drift left (zigzag)
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    side === 'left' ? ['-15%', '15%'] : ['15%', '-15%']
  );

  // Subtle scale pulse as the section scrolls through
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.85]);

  // Fade in/out at edges of viewport
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.05, 0.2, 0.2, 0.05]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y, scale, opacity }}
      aria-hidden="true"
    >
      <ScrollOrb variant={variant} rotationMultiplier={rotationMultiplier} />
    </motion.div>
  );
}
