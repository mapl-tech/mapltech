import Image from 'next/image';
import type { CaseShot } from './stories';
import styles from './Case.module.scss';

/**
 * A close-up of the live site, in the same browser frame as "The live site,
 * top to bottom", with the page's address in the bar, so a reader can tell
 * at a glance it is the real page, not a mock-up (Nov 5, 2026, after the
 * Scaling Process review: screens inside the story, not only above it).
 * The captures are 1440x900; the frame runs the story column's width.
 */
export default function CaseShotFrame({ shot, sizes }: { shot: CaseShot; sizes: string }) {
  return (
    <figure className={`${styles.shot} reveal`}>
      <figcaption className={styles.shotBar}>
        <span className={styles.shotLights} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="visually-hidden">The live page at </span>
        {shot.path}
      </figcaption>
      <Image src={shot.src} alt={shot.alt} width={1440} height={900} sizes={sizes} className={styles.shotImg} />
    </figure>
  );
}
