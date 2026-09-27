import type { ReactNode } from 'react';
import { REDESIGN_DATE, routeLastModified } from '@/config/routes';
import Cta from './Cta';
import styles from '@/app/company.module.scss';

export interface HeroFact {
  term: string;
  detail: ReactNode;
}

export interface HeroBlockProps {
  eyebrow: string;
  title: string;
  /** 40-60 words naming MAPL TECH, the audience and one real number. */
  lede: string;
  facts: HeroFact[];
  /** `about`, `team`, `nigeria`, `jamaica` - prefix for data-cta-placement. */
  placementPrefix: string;
}

/** "Last reviewed" value bound to the route registry (never `new Date()`). */
export function ReviewedOn({ path }: { path: string }) {
  const date = routeLastModified(path) ?? REDESIGN_DATE;
  return <time dateTime={date}>{date}</time>;
}

/**
 * The shared top-of-page anatomy (brief §2 preamble): H1 → lede → key facts
 * <dl class="kv"> → primary + secondary CTA. Everything here is SSR text and
 * nothing carries a reveal; the CTA group is the MobileActionBar's sentinel.
 */
export default function HeroBlock({ eyebrow, title, lede, facts, placementPrefix }: HeroBlockProps) {
  return (
    <section className={styles.hero} aria-labelledby="page-title">
      <div className={styles.heroInner}>
        <p className={`eyebrow ${styles.heroEyebrow}`}>{eyebrow}</p>
        <h1 id="page-title" className={styles.h1}>
          {title}
        </h1>
        <p className={`lede ${styles.lede}`}>{lede}</p>
        <div className={styles.heroGrid}>
          <dl className={`kv ${styles.kv}`}>
            {facts.map((fact) => (
              <div key={fact.term}>
                <dt>{fact.term}</dt>
                <dd>{fact.detail}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.ctas} data-hero-cta>
            <Cta placement={`${placementPrefix}_hero_primary`} href="/pricing#estimator" size="large">
              Get a 60-second estimate
            </Cta>
            <Cta placement={`${placementPrefix}_hero_secondary`} href="/contact-us" variant="secondary" size="large">
              Book a 20-min scoping call
            </Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
