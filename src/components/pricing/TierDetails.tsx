'use client';

import type { ReactNode } from 'react';
import { useMediaQuery } from '@/components/ui/useMediaQuery';

interface TierDetailsProps {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  summaryClassName?: string;
  /** Force a state regardless of viewport (e.g. the example card on mobile). */
  open?: boolean;
}

/**
 * Interaction #11 on tier cards: a native <details> whose feature list is
 * open on desktop and collapsed on phones. SSR renders it open (the crawlable
 * price statement); the user can toggle it freely afterwards - React only
 * writes `open` when the breakpoint flips. Motion (height, red rule) comes
 * from the global accordion-item hooks in styles/_motion.scss.
 */
export default function TierDetails({ summary, children, className = '', summaryClassName = '', open }: TierDetailsProps) {
  const desktop = useMediaQuery('(min-width: 768px)', true);
  return (
    <details className={`${className} accordion-item`.trim()} open={open ?? desktop}>
      <summary className={`${summaryClassName} accordion-summary`.trim()}>{summary}</summary>
      {children}
    </details>
  );
}
