'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * A footer link that marks the page you are on (aria-current), as the
 * header and phone menu do. The footer itself stays a Server Component.
 */
export default function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Link href={href} aria-current={pathname === href ? 'page' : undefined}>
      {children}
    </Link>
  );
}
