'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Toc.module.scss';

export interface TocItem {
  id: string;
  text: string;
}

interface ArticleTocProps {
  items: readonly TocItem[];
  /** The element whose reading progress the rail and the phone line show. */
  bodyId: string;
  label?: string;
  /** Paper for documents set on the light surface (legal pages). */
  tone?: 'dark' | 'paper';
}

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The sticky contents rail beside long-form text (posts and legal pages),
 * numbered like the sections it lists (01, 02, ...).
 *
 * - Every entry is a real in-page link (a plain anchor: the site's smooth
 *   scroll honours each heading's scroll-margin and moves focus).
 * - The section you are reading is marked `aria-current="location"`: the last
 *   heading that has crossed 35% of the viewport.
 * - Reading progress: a hairline beside the list fills in crimson as the body
 *   passes; phones and tablets get the same reading as a 2px line along the
 *   top edge of the viewport. Both are written straight to `transform` from
 *   one rAF-throttled scroll handler, never through React state, and both are
 *   hidden under reduced motion (the current-section marker carries the
 *   position instead).
 */
export default function ArticleToc({ items, bodyId, label = 'In this article', tone = 'dark' }: ArticleTocProps) {
  const [active, setActive] = useState<string | null>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.getElementById(bodyId);
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      if (body) {
        const rect = body.getBoundingClientRect();
        const read = clamp((vh - rect.top) / Math.max(rect.height, 1));
        if (fillRef.current) fillRef.current.style.transform = `scaleY(${read.toFixed(4)})`;
        if (barRef.current) barRef.current.style.transform = `scaleX(${read.toFixed(4)})`;
      }
      let current: string | null = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= vh * 0.35) current = heading.id;
        else break;
      }
      setActive(current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [bodyId, items]);

  return (
    <>
      <div ref={barRef} className={styles.bar} aria-hidden="true" />
      <nav className={styles.rail} aria-label={label} data-tone={tone}>
        <p className={styles.railLabel}>{label}</p>
        <div className={styles.railTrack}>
          <span className={styles.railLine} aria-hidden="true">
            <span ref={fillRef} className={styles.railFill} />
          </span>
          <ol className={styles.railList} role="list">
            {items.map((item, index) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={styles.railLink}
                  aria-current={active === item.id ? 'location' : undefined}
                >
                  <span className={styles.railIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.railText}>{item.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
