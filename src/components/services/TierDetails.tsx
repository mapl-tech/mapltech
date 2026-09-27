'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useMediaQuery } from '@/components/ui/useMediaQuery';

export interface TierDetailsProps {
  id: string;
  className?: string;
  summaryClassName?: string;
  /** Tier header (name, price, description). Server-rendered, passed through. */
  summary: ReactNode;
  /** Feature list + inline CTA. Always in the HTML; collapsed on phones only. */
  children: ReactNode;
}

const DESKTOP = '(min-width: 768px)';

/**
 * One tier row. Phones get a native <details> accordion (interaction #11);
 * from 768px the row renders open as an editorial row and the summary stops
 * toggling. The feature list is in the SSR HTML either way.
 */
export default function TierDetails({ id, className, summaryClassName, summary, children }: TierDetailsProps) {
  const desktop = useMediaQuery(DESKTOP);

  const keepOpen = (event: MouseEvent<HTMLElement>) => {
    if (desktop) event.preventDefault();
  };

  return (
    <details id={id} className={className} open={desktop || undefined}>
      <summary className={summaryClassName} onClick={keepOpen} tabIndex={desktop ? -1 : undefined}>
        {summary}
      </summary>
      {children}
    </details>
  );
}
