'use client';

import { useRef, ViewTransition, type ReactNode } from 'react';
import Image from 'next/image';
import { useScrollProgress } from '@/components/ui/useScrollProgress';
import styles from './LabsStage.module.scss';

/**
 * The /labs product shot: the live site in a browser, tilted back, that
 * straightens and grows as it scrolls into view while the phone view rises
 * past it (scroll-linked through `--p`; flat under reduced motion). The same
 * treatment as the case hero, and the same view-transition name, so following
 * the case-study link morphs this frame into the case hero's.
 */
export default function LabsStage({
  slug,
  address,
  desktop,
  mobile,
  alt,
  caption,
}: {
  slug: string;
  address?: string;
  desktop: string;
  mobile?: string;
  alt: string;
  caption?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, { mode: 'through', rest: 0.5 });

  return (
    <figure ref={ref} className={styles.stage}>
      <div className={styles.frames}>
        <ViewTransition name={`case-media-${slug}`} share="morph" default="none">
          <div className={styles.browser}>
            <div className={styles.chrome} aria-hidden="true">
              <span className={styles.lights}>
                <i />
                <i />
                <i />
              </span>
              {address ? <span className={styles.url}>{address}</span> : null}
            </div>
            <Image
              src={desktop}
              alt={alt}
              width={1800}
              height={1125}
              sizes="(min-width: 1440px) 1080px, 88vw"
              loading="eager"
              className={styles.shot}
            />
          </div>
        </ViewTransition>
        {mobile ? (
          <div className={styles.phone} aria-hidden="true">
            <Image src={mobile} alt="" width={780} height={1688} sizes="(min-width: 1024px) 240px, 22vw" className={styles.shot} />
          </div>
        ) : null}
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
