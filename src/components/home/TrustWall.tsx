import type { CSSProperties } from 'react';
import Cta from './Cta';
import CountUp from './CountUp';
import { TRUST, TRUST_METRICS } from './data';
import styles from './TrustWall.module.scss';

/**
 * 02 Trust wall: the white-label promise. Three promises as an ordered list,
 * an inline SVG wall whose strokes draw in on a CSS view() timeline (zero JS,
 * fully drawn under reduced motion), and four literally true counts.
 */

// Brick outlines on a 360x220 canvas; each is a closed path so pathLength applies.
const BRICKS = [
  'M10 150h80v50H10z',
  'M100 150h80v50h-80z',
  'M190 150h80v50h-80z',
  'M280 150h70v50h-70z',
  'M10 95h40v50H10z',
  'M60 95h80v50H60z',
  'M150 95h80v50h-80z',
  'M240 95h80v50h-80z',
  'M330 95h20v50h-20z',
  'M10 40h80v50H10z',
  'M100 40h80v50h-80z',
  'M190 40h80v50h-80z',
  'M280 40h70v50h-70z',
];

// Two red markers on top of the wall: your flags, your name on the work.
const FLAGS = ['M40 24V6', 'M120 24V6'];

export default function TrustWall() {
  return (
    <div className={styles.grid}>
      <div className={styles.copy}>
        <h2 id="h-trust" className={styles.heading}>
          {TRUST.heading}
        </h2>

        <ol className={styles.promises}>
          {TRUST.promises.map((promise, i) => (
            <li key={promise.title} className={styles.promise}>
              <span className={styles.index} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className={styles.promiseTitle}>{promise.title}</h3>
                <p className={styles.promiseBody}>{promise.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.trustCta}>
          <Cta placement="home_trust_nda" href={TRUST.ndaHref} external variant="secondary" size="small">
            {TRUST.ndaLabel}
          </Cta>
          <p className={styles.trustNote}>We sign it before you share a brief.</p>
        </div>
      </div>

      <div className={styles.visual}>
        <figure className={styles.wall} aria-hidden="true">
          <svg className={styles.wallSvg} viewBox="0 0 360 220" focusable="false">
            {BRICKS.map((d, i) => (
              <path key={d} d={d} pathLength={1} className={styles.brick} style={{ '--i': i } as CSSProperties} />
            ))}
            {FLAGS.map((d) => (
              <path key={d} d={d} pathLength={1} className={styles.flag} />
            ))}
          </svg>
          <figcaption className={styles.wallLabels}>
            <span>{TRUST.wallLabels.left}</span>
            <span>{TRUST.wallLabels.right}</span>
          </figcaption>
        </figure>

        <dl className={styles.metrics}>
          {TRUST_METRICS.map((metric) => (
            <div key={metric.label} className={styles.metric}>
              <dt className={styles.metricLabel}>{metric.label}</dt>
              <dd className={styles.metricValue}>
                <CountUp value={metric.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
