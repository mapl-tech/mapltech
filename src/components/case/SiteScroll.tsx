'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useScrollProgress } from '@/components/ui/useScrollProgress';
import type { FullCapture } from './fullPages';
import styles from './Case.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * "Scroll the real site": the section pins and the live homepage, captured
 * full length, scrolls through its frame as the reader scrolls the page.
 * Landscape shows the desktop capture in a browser; portrait shows the phone
 * capture in a phone. The image's travel is measured, then driven by `--p`.
 *
 * Reduced motion: no pin, no scrub; the frame becomes an ordinary scrollable
 * region the reader can move through themselves.
 *
 * The pin holds the reader for a while, so a visible "Skip the live site" link
 * sits in the pinned head (on screen for the whole pin, first in the tab
 * order) and jumps to `skipTo`, the first thing after the section.
 */
export default function SiteScroll({
  client,
  url,
  desktop,
  mobile,
  skipTo,
}: {
  client: string;
  url?: string;
  desktop: FullCapture;
  mobile: FullCapture;
  /** Id of the element right after this section. */
  skipTo?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useScrollProgress(sectionRef, { mode: 'pinned', rest: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) return;
    const measure = () => {
      // Only one frame is displayed (desktop or phone, by orientation): measure that one.
      const shown = [...section.querySelectorAll<HTMLElement>('[data-frame]')].find((el) => el.offsetParent !== null);
      const viewport = shown?.querySelector<HTMLElement>('[data-viewport]');
      const img = viewport?.querySelector('img');
      if (!viewport || !img) return;
      section.style.setProperty('--shift', `${Math.max(0, img.offsetHeight - viewport.clientHeight)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    section.querySelectorAll('[data-viewport] img').forEach((img) => ro.observe(img));
    ro.observe(section);
    return () => ro.disconnect();
  }, [reduceMotion]);

  const label = `${client}${url ? ` (${url})` : ''}: the live site, captured from top to bottom`;
  // Scrubbed by scroll it is a picture; still, it is a region the reader scrolls by hand.
  const viewportProps = reduceMotion
    ? ({ role: 'region', 'aria-label': label, tabIndex: 0 } as const)
    : ({ role: 'img', 'aria-label': label } as const);

  // data-bar-stand-down: the pinned frame fills the phone screen down to its
  // progress line, which the phone action bar would otherwise cover for the
  // whole pin; the bar steps aside until the section has scrolled away.
  return (
    <section
      ref={sectionRef}
      className={styles.siteScroll}
      data-still={reduceMotion ? '' : undefined}
      data-bar-stand-down=""
      aria-labelledby="case-live"
    >
      <div className={styles.siteSticky}>
        <div className={styles.siteHead}>
          <h2 id="case-live" className={styles.siteTitle}>
            The live site, top to bottom.
          </h2>
          {/* Still (reduced motion), the page does not drive the capture: the reader scrolls the frame. */}
          <p className={styles.siteNote}>
            {reduceMotion ? 'Scroll inside the frame' : 'Keep scrolling'}: this is the real site, captured in full, not a
            mock-up.
          </p>
          {skipTo ? (
            <a href={`#${skipTo}`} className={styles.siteSkip}>
              Skip the live site
              <Arrow direction="down" />
            </a>
          ) : null}
        </div>

        <div className={styles.siteFrameDesktop} data-frame="">
          <div className={styles.chrome} aria-hidden="true">
            <span className={styles.lights}>
              <i />
              <i />
              <i />
            </span>
            {url ? <span className={styles.url}>{url}</span> : null}
          </div>
          <div className={styles.siteViewport} data-viewport="" {...viewportProps}>
            <Image
              src={desktop.src}
              alt=""
              width={desktop.width}
              height={desktop.height}
              sizes="(min-width: 1440px) 1100px, 80vw"
              className={styles.siteShot}
            />
          </div>
        </div>

        <div className={styles.siteFramePhone} data-frame="">
          <div className={styles.siteViewport} data-viewport="" {...viewportProps}>
            <Image src={mobile.src} alt="" width={mobile.width} height={mobile.height} sizes="300px" className={styles.siteShot} />
          </div>
        </div>

        <div className={styles.siteProgress} aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
