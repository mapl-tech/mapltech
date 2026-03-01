'use client';

import { motion } from 'framer-motion';

interface Orb {
  size: number;
  x: string;
  y: string;
  color: string;
  blur: number;
  duration: number;
  delay: number;
}

const orbs: Orb[] = [
  { size: 500, x: '15%', y: '20%', color: 'rgba(240, 51, 80, 0.08)', blur: 120, duration: 20, delay: 0 },
  { size: 400, x: '70%', y: '60%', color: 'rgba(240, 51, 80, 0.05)', blur: 100, duration: 25, delay: 2 },
  { size: 300, x: '80%', y: '15%', color: 'rgba(196, 33, 60, 0.12)', blur: 90, duration: 18, delay: 1 },
  { size: 250, x: '30%', y: '75%', color: 'rgba(51, 240, 208, 0.04)', blur: 80, duration: 22, delay: 3 },
];

export default function FloatingOrbs() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
            willChange: 'transform',
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.05, 0.95, 1.02, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
