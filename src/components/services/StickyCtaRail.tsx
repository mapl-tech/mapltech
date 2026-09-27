'use client';

import { useEffect, useState } from 'react';
import Cta from './Cta';
import styles from './StickyCtaRail.module.scss';

export interface StickyCtaRailProps {
  /** Service short name, e.g. "Web Development". */
  label: string;
  /** Starting price as printed, e.g. "$5,000". */
  price: string;
  note: string;
  estimateHref: string;
  callHref?: string;
  /** Analytics prefix, e.g. the service slug. */
  slug: string;
  /** Display phone + tel: target. */
  phone: { display: string; tel: string };
  /** Selector of the section that ends the rail's travel (the mini-scoper). */
  collapseWhenVisible?: string;
}

/**
 * Desktop conversion lever: a `position: sticky` card in the right column.
 * While the mini-scoper is in view the card collapses to the single ghost
 * "Book a 20-min scoping call" so only one estimate CTA is on screen (IX-2).
 * CSS does the sticking; the only JS is one IntersectionObserver.
 */
export default function StickyCtaRail({
  label,
  price,
  note,
  estimateHref,
  callHref = '/contact-us',
  slug,
  phone,
  collapseWhenVisible = '#scoper',
}: StickyCtaRailProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const target = document.querySelector(collapseWhenVisible);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setCollapsed(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [collapseWhenVisible]);

  return (
    <div className={styles.card} data-collapsed={collapsed || undefined} aria-label={`${label} — get in touch`}>
      <div className={styles.facts}>
        <p className={styles.label}>{label}</p>
        <p className={styles.price}>From {price}</p>
        <p className={styles.note}>{note}</p>
      </div>
      <div className={styles.ctas}>
        <span className={styles.primary}>
          <Cta href={estimateHref} placement={`${slug}_rail_primary`} cursor="estimate" boxClassName={styles.box}>
            Get a 60-second estimate
          </Cta>
        </span>
        <Cta href={callHref} variant="secondary" placement={`${slug}_rail_secondary`} boxClassName={styles.box}>
          Book a 20-min scoping call
        </Cta>
      </div>
      <p className={styles.call}>
        or call{' '}
        <a href={`tel:${phone.tel}`} data-cta-placement={`${slug}_rail_call`}>
          {phone.display}
        </a>
      </p>
    </div>
  );
}
