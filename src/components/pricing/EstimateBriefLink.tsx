'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { PROJECT_HREF } from '@/components/layout/chrome';
import { estimateHref, normalizeEstimateInput, type EstimateService, type EstimateSize, type SizeKey } from '@/lib/estimate';
import { useEstimateState } from './estimateUrlStore';

interface EstimateBriefLinkProps {
  service: EstimateService;
  size: SizeKey;
  className?: string;
  /** data-cta-placement. */
  placement: string;
  children: ReactNode;
}

/**
 * "Start a project" for a package that is quoted after a call (Web
 * Development's Enterprise): the brief with that package chosen and, once the
 * visitor has an estimate of their own, the rest of it carried along (other
 * services, support, timeline, add-ons), so the brief opens on what they have
 * already answered. Before any answer (and in the server HTML) it is the plain
 * package link, /contact-us?svc=web&size.web=enterprise.
 */
export default function EstimateBriefLink({ service, size, className, placement, children }: EstimateBriefLinkProps) {
  const { input, touched } = useEstimateState();
  const current = touched ? input : null;
  const services = current ? (current.services.includes(service) ? current.services : [...current.services, service]) : [service];
  const href = estimateHref(
    normalizeEstimateInput({ ...current, services, size: { ...current?.size, [service]: size } as EstimateSize }),
    { path: PROJECT_HREF, hash: null },
  );

  return (
    <Link href={href} className={className} data-cta-placement={placement}>
      {children}
    </Link>
  );
}
