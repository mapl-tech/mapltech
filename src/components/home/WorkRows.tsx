'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useFinePointer, usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import WorkTransition from './WorkTransition';
import type { WorkRow } from './data';
import styles from './WorkRows.module.scss';

/**
 * 05 Selected work — interaction #4: work rows + hover preview + morph.
 *
 * Fine pointer: every row's thumbnail is stacked (preloaded) at the top of the
 * list and only the hovered one is visible; all of them share one pair of
 * motion values so the visible card trails the pointer on a spring
 * (stiffness 260 / damping 28). Reduced motion: the card snaps to a fixed
 * slot beside the row. Coarse pointer: the thumbnail is inline (40% width,
 * right-aligned) and the whole row is the tap target.
 *
 * Each thumbnail is wrapped once in <WorkTransition name="work-{slug}">, so the
 * image you click morphs into the case-study hero (one name per slug per page).
 */

const PREVIEW_W = 360;
const PREVIEW_H = 240;
const OFFSET_X = 32;
const SPRING = { stiffness: 260, damping: 28 };

export default function WorkRows({ rows }: { rows: readonly WorkRow[] }) {
  const finePointer = useFinePointer();
  const reduceMotion = usePrefersReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<string | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);
  const previewX = reduceMotion ? x : springX;
  const previewY = reduceMotion ? y : springY;

  const place = (clientX: number, clientY: number, snap: boolean) => {
    const list = listRef.current;
    if (!list) return;
    const rect = list.getBoundingClientRect();
    const nextX = Math.min(Math.max(0, rect.width - PREVIEW_W), clientX - rect.left + OFFSET_X);
    const nextY = clientY - rect.top - PREVIEW_H / 2;
    x.set(nextX);
    y.set(nextY);
    if (snap) {
      springX.jump(nextX);
      springY.jump(nextY);
    }
  };

  const onRowEnter = (row: WorkRow, e: ReactPointerEvent<HTMLLIElement>) => {
    if (!finePointer) return;
    setActive(row.slug);
    const list = listRef.current;
    if (!list) return;
    if (reduceMotion) {
      // Fixed slot beside the row, no trailing.
      const rect = list.getBoundingClientRect();
      const rowRect = e.currentTarget.getBoundingClientRect();
      x.jump(Math.max(0, rect.width - PREVIEW_W));
      y.jump(rowRect.top - rect.top + rowRect.height / 2 - PREVIEW_H / 2);
      return;
    }
    // First entry: appear in place, then trail.
    if (active === null) place(e.clientX, e.clientY, true);
  };

  const onMove = (e: ReactPointerEvent<HTMLUListElement>) => {
    if (!finePointer || reduceMotion) return;
    place(e.clientX, e.clientY, false);
  };

  const onLeave = () => {
    if (finePointer) setActive(null);
  };

  return (
    <ul
      ref={listRef}
      className={styles.list}
      data-mode={finePointer ? 'preview' : 'inline'}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {rows.map((row) => {
        const isActive = active === row.slug;
        return (
          <li
            key={row.slug}
            className={styles.row}
            data-cursor={row.ownProduct ? 'Open Labs' : 'view'}
            onPointerEnter={(e) => onRowEnter(row, e)}
          >
            {/* Positioned container for the stretched link; in preview mode the row
                itself is static so the thumbnail positions against the list. */}
            <div className={styles.rowBody}>
              <h3 className={styles.title}>
                <Link href={row.href} className={styles.link}>
                  {row.title}
                </Link>
                {row.ownProduct ? <span className={styles.badge}>own product</span> : null}
              </h3>
              <p className={styles.meta}>
                <span>{row.service}</span>
                {row.year ? <span className={styles.year}>{row.year}</span> : null}
              </p>
              <p className={styles.outcome}>{row.outcome}</p>
              <span className={styles.chip} aria-hidden="true">
                View
              </span>
            </div>

            <motion.div
              className={styles.thumb}
              data-active={isActive ? 'true' : 'false'}
              style={finePointer ? { x: previewX, y: previewY } : undefined}
              aria-hidden={finePointer ? 'true' : undefined}
            >
              <WorkTransition name={`work-${row.slug}`} share="morph" default="none">
                <div className={styles.thumbFrame}>
                  <Image
                    src={row.image}
                    alt={`${row.title} preview`}
                    fill
                    sizes="(max-width: 767px) 40vw, 360px"
                    className={styles.thumbImage}
                  />
                </div>
              </WorkTransition>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
