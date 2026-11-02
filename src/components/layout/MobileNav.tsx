'use client';

import { useState, type RefObject, type SyntheticEvent } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import BottomSheet, { type SnapPoint } from '@/components/ui/BottomSheet';
import MagneticButton from '@/components/ui/MagneticButton';
import { LiveClocks } from '@/components/ui/TimezoneOverlap';
import { PROJECT_HREF, PROJECT_LABEL, telHref } from './chrome';
import styles from './Header.module.scss';

/**
 * Mobile navigation: the interaction #9 bottom sheet (vaul via BottomSheet).
 *
 * Rows are large display type with a numbered index (64px targets). Sections
 * with children (Services, Work, About) are native <details> groups, so their
 * links are in the DOM and the sheet expands to full height the first time a
 * group opens. One CTA ("Start a project") and the two contact lines close the
 * sheet; the office clocks sit underneath. Escape, the overlay and a downward
 * drag dismiss it; focus returns to the hamburger.
 */

const SNAP_POINTS: SnapPoint[] = [0.86, 1];

function Chevron() {
  return (
    <svg
      className={styles.sheetChevron}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export interface MobileNavProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  /** The hamburger: focus returns here when the sheet closes. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export default function MobileNav({ id, open, onOpenChange, pathname, returnFocusRef }: MobileNavProps) {
  const [snap, setSnap] = useState<SnapPoint | null>(SNAP_POINTS[0]);

  const close = () => onOpenChange(false);
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setSnap(SNAP_POINTS[0]);
  };
  // A group opening adds rows below the fold of the 86% sheet: go full height.
  const onGroupToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    if (event.currentTarget.open) setSnap(SNAP_POINTS[SNAP_POINTS.length - 1]);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Menu"
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      className={styles.sheet}
      returnFocusRef={returnFocusRef}
    >
      <nav id={id} aria-label="Mobile" className={styles.sheetNav}>
        <ul className={styles.sheetList}>
          {siteConfig.nav.map((item, index) =>
            item.children ? (
              <li key={item.href} style={{ ['--i' as string]: index }}>
                <details className={styles.group} name="mobile-nav" onToggle={onGroupToggle}>
                  <summary className={styles.row}>
                    <span className={styles.rowIndex} aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.rowLabel}>{item.label}</span>
                    <Chevron />
                  </summary>
                  <ul className={styles.subList}>
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={styles.subRow}
                          aria-current={pathname === child.href ? 'page' : undefined}
                          onClick={close}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ) : (
              <li key={item.href} style={{ ['--i' as string]: index }}>
                <Link
                  href={item.href}
                  className={styles.row}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  onClick={close}
                >
                  <span className={styles.rowIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.rowLabel}>{item.label}</span>
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>

      <div className={styles.sheetCta} data-cta-placement="drawer_project">
        <MagneticButton href={PROJECT_HREF} size="medium" placement="drawer_project" onClick={close}>
          {PROJECT_LABEL}
        </MagneticButton>
      </div>

      <ul className={styles.sheetContact} aria-label="Contact">
        <li>
          <a href={`mailto:${siteConfig.email}`} onClick={close}>
            {siteConfig.email}
          </a>
        </li>
        <li>
          <a href={telHref(siteConfig.phone)} onClick={close}>
            {siteConfig.phone}
          </a>
        </li>
      </ul>
      <LiveClocks className={styles.sheetClocks} />
    </BottomSheet>
  );
}
