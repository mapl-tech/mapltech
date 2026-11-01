import type { ReactNode } from 'react';

interface TierDetailsProps {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  summaryClassName?: string;
}

/**
 * A tier's feature list on a native <details>, server-rendered closed. One
 * island (WideOpen, rendered once by PriceList) opens every list from 768px
 * up; on phones they stay a tap away. Motion (height, red rule) comes from the
 * global accordion-item hooks in styles/_motion.scss.
 */
export default function TierDetails({ summary, children, className = '', summaryClassName = '' }: TierDetailsProps) {
  return (
    <details className={`${className} accordion-item`.trim()} data-wide-open="">
      <summary className={`${summaryClassName} accordion-summary`.trim()}>{summary}</summary>
      {children}
    </details>
  );
}
