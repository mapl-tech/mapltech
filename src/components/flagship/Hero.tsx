import Link from 'next/link';
import Backbone from '@/components/backbone/Backbone';
import { HERO, PRICE_TRUST_ITEMS, PRIMARY_CTA, SECONDARY_CTA } from './content';
import TrustList from './TrustList';
import styles from './Hero.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * Homepage hero. The purpose is the live site's brand line, said to the
 * reader: the engineering backbone behind your agency. The stage
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
                <Arrow />
              </span>
            </Link>
            <Link href={SECONDARY_CTA.href} className={styles.secondary} data-cta-placement="home_hero_secondary">
              {SECONDARY_CTA.label}
            </Link>
          </div>
          {/* The ask and the trust line only: the testimonials are given in full
              in the track record below, where they are read, not skimmed. */}
          <TrustList items={PRICE_TRUST_ITEMS} className={styles.reassure} />
        </div>

        <div className={styles.foot}>
          {/* Shown once the scene is live, gone after the first touch (CSS :has on the stage's data
              attributes); mouse and landscape only, so it names the mouse. What to do, then what a click does. */}
          <p className={styles.hint} aria-hidden="true">
            Move your mouse to push the rods. Click to scatter them.
          </p>
        </div>
      </div>
    </section>
  );
}
