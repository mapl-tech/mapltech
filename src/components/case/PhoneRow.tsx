'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useScrollProgress } from '@/components/ui/useScrollProgress';
import type { FullCapture } from './fullPages';
import styles from './Case.module.scss';

/** Three windows into the full phone capture: the top of the page, its middle, further down. */
const WINDOWS = ['0%', '42%', '84%'] as const;

/**
 * On every screen: the phone capture shown three times at different depths
 * of the page. Desktop drifts the phones at different speeds as the section
 * passes; phones get a swipeable, snapping row.
 */
export default function PhoneRow({ client, mobile }: { client: string; mobile: FullCapture }) {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, { mode: 'through', rest: 0.5 });

  return (
    <section ref={ref} className={styles.phones} aria-labelledby="case-phones">
      <div className={styles.phonesHead}>
        <p className={styles.sectionLabel}>On every screen</p>
        <h2 id="case-phones" className={styles.phonesTitle}>
          Every page designed for the phone as carefully as for the desktop.
        </h2>
      </div>
      <ul className={styles.phoneTrack} aria-label={`${client} on a phone`}>
        {WINDOWS.map((offset, i) => (
          <li key={offset} className={styles.phoneItem} style={{ ['--i' as string]: i }}>
            <div className={styles.phoneFrame}>
              <Image
                src={mobile.src}
                alt={i === 0 ? `${client} on a phone: the top of the homepage` : ''}
                width={mobile.width}
                height={mobile.height}
                sizes="(min-width: 1024px) 300px, 70vw"
                className={styles.phoneShot}
                style={{ objectPosition: `50% ${offset}` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
