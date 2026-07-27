'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Module-scoped: stays false until the first client mount of the session.
let hasMounted = false;

/**
 * App Router template - re-mounts on every navigation to fade pages in (an
 * app-like transition). Opacity only, by design: a transform on this wrapper
 * would become the containing block for any position:fixed descendant mid-anim.
 *
 * Critically, the FIRST render (SSR + hydration) is rendered visible with no
 * animation, so the page is never shipped at opacity:0 waiting on JS - no blank
 * flash. Only client-side navigations animate. Honors reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  // Lazy initializer runs once per mount; reading state during render is safe.
  const [isFirstRender] = useState(() => !hasMounted);

  useEffect(() => {
    hasMounted = true;
  }, []);

  const animateIn = !reduce && !isFirstRender;

  return (
    <motion.div
      initial={animateIn ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
