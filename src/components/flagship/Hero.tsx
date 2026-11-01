import Link from 'next/link';
import { getImageProps } from 'next/image';
import Cta from '@/components/home/Cta';
import towerDesktop from '@/assets/flagship/tower-desktop.jpg';
import towerMobile from '@/assets/flagship/tower-mobile.jpg';
import DepthScene from './DepthScene';
import { HERO, PRIMARY_CTA, SECONDARY_CTA } from './content';
import { COLUMN_SEGMENTS, FLOOR_SEGMENTS, NODES, TRACE_VIEWBOX, segmentPath } from './towerTrace';
import styles from './Hero.module.scss';

/**
 * Act 1, Recognition. A layered photographic hero: the plate (with the
 * structural trace locked to it) drifts and settles behind copy that rides at
 * 1x. Scrolling draws the steel frame in red: "we engineer what holds it up".
 *
 * Art direction: landscape viewports get the 16:9 plate, portrait viewports
 * (phones, portrait tablets) get a native 9:16 composition with sky on top for
 * the copy. Only one source downloads. The H1 is in the first paint, never
 * faded in, so it can be the LCP element on text-first devices.
 */
export default function Hero() {
  const common = { alt: HERO.imageAlt, sizes: '100vw' };
  const {
    props: { srcSet: desktopSet },
  } = getImageProps({ ...common, src: towerDesktop });
  const {
    props: { srcSet: mobileSet, ...img },
  } = getImageProps({ ...common, src: towerMobile });

  return (
    <DepthScene as="section" className={styles.hero} aria-labelledby="home-h1">
      <div className={styles.scene}>
        <picture>
          <source media="(min-aspect-ratio: 1/1)" srcSet={desktopSet} sizes="100vw" />
          <img {...img} alt={HERO.imageAlt} srcSet={mobileSet} className={styles.plate} loading="eager" fetchPriority="high" />
        </picture>
        <svg
          className={styles.trace}
          viewBox={`0 0 ${TRACE_VIEWBOX.width} ${TRACE_VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <g className={styles.columns}>
            {COLUMN_SEGMENTS.map((segment, i) => (
              <path key={`c${i}`} d={segmentPath(segment)} pathLength={1} />
            ))}
          </g>
          <g className={styles.floors}>
            {FLOOR_SEGMENTS.map((segment, i) => (
              <path key={`f${i}`} d={segmentPath(segment)} pathLength={1} />
            ))}
          </g>
          <g className={styles.nodes}>
            {NODES.map(([cx, cy], i) => (
              <circle key={`n${i}`} cx={cx} cy={cy} r={7} />
            ))}
          </g>
        </svg>
      </div>

      <div className={styles.haze} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.copy}>
        <p className={styles.eyebrow}>{HERO.eyebrow}</p>
        <h1 id="home-h1" className={styles.title}>
          {HERO.titleLines.map((line) => (
            <span key={line} className={styles.titleLine}>
              {line}
            </span>
          ))}
        </h1>
        <p className={styles.lede}>{HERO.lede}</p>
        <div className={styles.actions}>
          <Cta placement="home_hero_primary" hero href={PRIMARY_CTA.href} size="large">
            {PRIMARY_CTA.label}
          </Cta>
          <Link href={SECONDARY_CTA.href} className={styles.secondary} data-cta-placement="home_hero_secondary">
            {SECONDARY_CTA.label}
            <span aria-hidden="true" className={styles.arrow}>
              →
            </span>
          </Link>
        </div>
        <p className={styles.trust}>{HERO.trust}</p>
      </div>
    </DepthScene>
  );
}
