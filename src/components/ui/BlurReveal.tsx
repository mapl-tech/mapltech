'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export default function BlurReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  yOffset = 20,
}: BlurRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ height: '100%' }}
      initial={{
        opacity: 0,
        y: yOffset,
        filter: 'blur(12px)',
      }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: yOffset, filter: 'blur(12px)' }
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
