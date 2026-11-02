import Link from 'next/link';
import Backbone from '@/components/backbone/Backbone';
import { LiveClocks } from '@/components/ui/TimezoneOverlap';
import { HERO, PRIMARY_CTA, SECONDARY_CTA } from './content';
import styles from './Hero.module.scss';

/**
 * Homepage hero. The purpose is the live site's, word for word: the
 * engineering backbone behind agencies that refuse to cut corners. The stage
 * is new: the Backbone, a real-time spine of capsules (the bar from the MA|PL
 * wordmark) that visitors can push, swipe and shake, and that always settles
 * back into line.
 *
 * Everything that carries meaning is server-rendered text in the first paint
 * (the H1 is the LCP element and never fades); the scene arrives after idle as
 * decoration, with the CSS light underneath as its fallback.
 */
export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="home-h1">
      <div className={styles.light} aria-hidden="true" />
      <Backbone className={styles.stage} toggleClassName={styles.toggle} />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.caret} aria-hidden="true" />
            {HERO.eyebrow}
          </p>
          <h1 id="home-h1" className={styles.title}>
            {HERO.titleLines.map((runs, line) => (
              <span key={line} className={styles.titleLine}>
                {runs.map((run) =>
                  run.accent ? (
                    <span key={run.text} className={styles.accent}>
                      {run.text}
                    </span>
                  ) : (
                    run.text
                  ),
                )}{' '}
              </span>
            ))}
          </h1>
          <p className={styles.lede}>{HERO.lede}</p>
          <div className={styles.actions}>
            <Link
              href={PRIMARY_CTA.href}
              className={styles.primary}
              data-hero-cta=""
              data-cta-placement="home_hero_primary"
            >
              {PRIMARY_CTA.label}
              <span aria-hidden="true" className={styles.arrow}>
                →
              </span>
            </Link>
            <Link href={SECONDARY_CTA.href} className={styles.secondary} data-cta-placement="home_hero_secondary">
              {SECONDARY_CTA.label}
            </Link>
          </div>
        </div>

        <div className={styles.foot}>
          <LiveClocks className={styles.clocks} />
          {/* Shown once the scene is live, gone after the first touch (CSS :has on the stage's data attributes). */}
          <p className={styles.hint} aria-hidden="true">
            Move through it. It holds.
          </p>
        </div>
      </div>
    </section>
  );
}
