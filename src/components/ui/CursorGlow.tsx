'use client';

import dynamic from 'next/dynamic';
import { useFinePointer, usePrefersReducedMotion } from './useMediaQuery';

/**
 * Interaction #6: cursor pill island.
 *
 * Renders nothing on the server, on touch devices and under reduced motion.
 * The pill implementation (CursorPill.tsx) is code-split with
 * next/dynamic({ ssr: false }) and only fetched once a fine pointer with
 * motion allowed is confirmed, so phones never download it. Safe to import
 * statically from the server layout: this file is the client boundary.
 */

const CursorPill = dynamic(() => import('./CursorPill'), { ssr: false });

export default function CursorGlow() {
  const finePointer = useFinePointer();
  const reduceMotion = usePrefersReducedMotion();
  if (!finePointer || reduceMotion) return null;
  return <CursorPill />;
}
