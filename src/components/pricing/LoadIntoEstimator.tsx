'use client';

import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import {
  decodeEstimateParams,
  estimateHref,
  normalizeEstimateInput,
  type EstimateService,
  type EstimateSize,
  type SizeKey,
} from '@/lib/estimate';
import { useLenis } from '@/components/ui/SmoothScroll';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import { writeEstimateUrl } from './estimateUrlStore';

interface LoadIntoEstimatorProps {
  service: EstimateService;
  size: SizeKey;
  className?: string;
  children: ReactNode;
}

/** Header is 64px fixed; land the estimator heading just under it. */
const SCROLL_OFFSET = -88;

/**
 * Interaction #10: tier -> estimator hand-off.
 *
 * A real link (`/pricing?svc=web&size.web=growth#estimator`) that works with
 * no JavaScript. With JavaScript it merges the tier into the current estimate
 * (adds the service line, sets its size, keeps the rest), mirrors it to the
 * URL, scrolls to #estimator and moves focus to the live total so the new
 * range is read out as it springs into place.
 */
export default function LoadIntoEstimator({ service, size, className, children }: LoadIntoEstimatorProps) {
  const lenis = useLenis();
  const reduceMotion = usePrefersReducedMotion();
  const href = estimateHref({ services: [service], size: { [service]: size } as EstimateSize });

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    const current = decodeEstimateParams(window.location.search);
    const services = current.services.includes(service) ? current.services : [...current.services, service];
    writeEstimateUrl(
      normalizeEstimateInput({ ...current, services, size: { ...current.size, [service]: size } as EstimateSize }),
      { hash: '#estimator' },
    );

    const target = document.getElementById('estimator');
    if (target) {
      if (lenis) lenis.scrollTo(target, { offset: SCROLL_OFFSET, immediate: reduceMotion });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
    window.setTimeout(() => {
      document.getElementById('estimate-total')?.focus({ preventScroll: true });
    }, 0);
  };

  return (
    <Link
      href={href}
      prefetch={false}
      scroll={false}
      onClick={handleClick}
      className={className}
      data-cursor="estimate"
      data-cta-placement="pricing_tier_load"
      data-service={service}
      data-size={size}
    >
      {children}
    </Link>
  );
}
