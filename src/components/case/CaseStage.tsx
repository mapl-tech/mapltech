'use client';

import { useRef, ViewTransition } from 'react';
import Image from 'next/image';
import { useScrollProgress } from '@/components/ui/useScrollProgress';
import styles from './Case.module.scss';

/**
 * The case hero's product shot: the live site in a browser, tilted back,
 * that straightens and grows to meet the reader as they scroll in; the phone
 * view rises past it. The browser frame carries the same view-transition name
 * as the work cards that link here, so the card's screenshot morphs into it.
 */
export default function CaseStage({
  slug,
  url,
  desktop,
  mobile,
  alt,
}: {
  slug: string;
  url?: string;
  desktop: string;
  mobile?: string;
  alt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, { mode: 'through', rest: 0.5 });

  return (
    <div ref={ref} className={styles.stage}>
      <ViewTransition name={`case-media-${slug}`} share="morph" default="none">
        <div className={styles.stageBrowser}>
          <div className={styles.chrome} aria-hidden="true">
            <span className={styles.lights}>
              <i />
              <i />
              <i />
            </span>
            {url ? <span className={styles.url}>{url}</span> : null}
          </div>
          <Image
            src={desktop}
            alt={alt}
            width={1800}
            height={1125}
            sizes="(min-width: 1440px) 1180px, 90vw"
            preload
            className={styles.stageShot}
          />
        </div>
      </ViewTransition>
      {mobile ? (
        <div className={styles.stagePhone} aria-hidden="true">
          <Image src={mobile} alt="" width={780} height={1688} sizes="(min-width: 1024px) 220px, 30vw" className={styles.stageShot} />
        </div>
      ) : null}
    </div>
  );
}
