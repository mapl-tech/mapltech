'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CursorGlow() {
  const [visible, setVisible] = useState(false);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    // Only show on devices with fine pointers (no touch)
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) return;

    setVisible(true);

    const handleMouse = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [x, y]);

  if (!visible) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: -200,
        left: -200,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240, 51, 80, 0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
        x,
        y,
        filter: 'blur(40px)',
      }}
      aria-hidden="true"
    />
  );
}
