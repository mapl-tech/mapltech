import Link from 'next/link';
import { LOGO_WALL } from './data';
import styles from './LogoMarquee.module.scss';

/**
 * Interaction #8 (marquee form): a pure-CSS translateX loop of client marks,
 * paused on hover and focus-within, each mark a real link to its case study.
 * The list is duplicated once (aria-hidden, unfocusable) for the seamless
 * loop; reduced motion and save-data render a static wrapped row instead.
 * MAPL Tours is our own product (MAPL Labs) and is labelled as such.
 */
export default function LogoMarquee() {
  const count = LOGO_WALL.length;
  const items = [...LOGO_WALL, ...LOGO_WALL];

  return (
    <section className={styles.root} aria-label="Selected client partners">
      <div className={styles.inner}>
        <p className={`eyebrow ${styles.label}`}>Selected client partners</p>
        <div className={styles.viewport}>
          <ul className={styles.track}>
            {items.map((entry, i) => {
              const clone = i >= count;
              return (
                <li key={`${entry.name}-${i}`} className={styles.item} aria-hidden={clone || undefined}>
                  <Link href={entry.href} className={styles.link} tabIndex={clone ? -1 : undefined}>
                    {entry.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- pre-sized marks duplicated for the loop; next/image's lazy pop-in would flicker mid-scroll.
                      <img
                        src={entry.logo}
                        alt={entry.name}
                        width={entry.width}
                        height={entry.height}
                        loading="eager"
                        decoding="async"
                        className={styles.logo}
                        style={{ filter: entry.filter }}
                      />
                    ) : (
                      <span className={styles.wordmark}>{entry.name}</span>
                    )}
                    {entry.note ? <span className={styles.note}>{entry.note}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
