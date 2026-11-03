'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEstimateBriefHref } from '@/components/ui/useEstimateBriefHref';

/**
 * The close band's primary link: its page's `href`, except on /pricing once
 * the visitor has an estimate, where it carries that estimate into the brief
 * (the header, phone menu and phone bar do the same).
 */
export default function CloseBandPrimary({
  href,
  className,
  placement,
  hero,
  children,
}: {
  href: string;
  className: string;
  placement: string;
  hero: boolean;
  children: ReactNode;
}) {
  const target = useEstimateBriefHref(usePathname()) ?? href;
  return (
    <Link href={target} className={className} data-cta-placement={placement} data-hero-cta={hero ? '' : undefined}>
      {children}
    </Link>
  );
}
