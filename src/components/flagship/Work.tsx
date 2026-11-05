import { ViewTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { keepTogether } from '@/components/services/keepTogether';
import { HERO_REASSURE, PRIMARY_CTA, WORK, WORK_SECTION } from './content';
import styles from './Work.module.scss';
import Arrow from '@/components/ui/Arrow';

/** Real captures per case (public/images/cases): the live desktop site and its phone view. */
const SHOTS: Record<string, { desktop: string; mobile: string; url: string }> = {
  'lro-staffing': { desktop: 'lro-desktop', mobile: 'lro-mobile', url: 'lrostaffing.com' },
  'dodo-island-discoveries': { desktop: 'dodo-desktop', mobile: 'dodo-mobile', url: 'dodoislanddiscoveries.com' },
  'mapl-tours': { desktop: 'tours-desktop', mobile: 'tours-mobile', url: 'mapltours.com' },
  'chha-ncr': { desktop: 'chha-desktop', mobile: 'chha-mobile', url: 'chhancr.ca' },
};

/**
 * Selected work: the featured cases as cards that stack as they
 * scroll, each one sliding over the last, then the ask while the proof is
 * still on screen (with the hero's reassurance under it). Every number on a
 * card is sourced in content.ts.
 */
export default function Work() {
  return (
    <section className={styles.work} aria-labelledby="work-title">
      <div className={styles.head}>
        <p className={styles.label}>{WORK_SECTION.label}</p>
        <h2 id="work-title" className={styles.title}>
          {WORK_SECTION.title}
        </h2>
        <div className={styles.headAside}>
          <p className={styles.lede}>{WORK_SECTION.lede}</p>
          <Link href={WORK_SECTION.all.href} className={styles.all} data-cta-placement="home_work_all">
            {WORK_SECTION.all.label}
            <Arrow />
          </Link>
        </div>
      </div>

      <ol className={styles.stack}>
        {WORK.map((card, i) => {
          const shots = SHOTS[card.slug];
          return (
            <li key={card.slug} className={styles.slot} style={{ ['--i' as string]: i }}>
              <article className={styles.card} aria-labelledby={`work-${card.slug}`}>
                <div className={styles.copy}>
                  <p className={styles.kind}>{card.kind}</p>
                  <h3 id={`work-${card.slug}`} className={styles.client}>
                    {card.client}
                  </h3>
                  <p className={styles.outcome}>{card.outcome}</p>
                  <dl className={styles.metrics}>
                    {card.metrics.map((metric) => (
                      // The term is what is counted, the value its number; CSS sets the number first.
                      <div key={metric.label} className={styles.metric}>
                        <dt className={styles.metricLabel}>{metric.label}</dt>
                        <dd className={styles.value}>{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link href={card.href} className={styles.read} data-cta-placement={`home_work_${card.slug}`}>
                    Read the case study<span className="visually-hidden">: {card.client}</span>
                    <span aria-hidden="true" className={styles.readArrow}>
                      <Arrow />
                    </span>
                  </Link>
                </div>

                {shots ? (
                  <div className={styles.media} aria-hidden="true">
                    {/* Same name as the case hero's browser: the screenshot morphs into it on navigation. */}
                    <ViewTransition name={`case-media-${card.slug}`} share="morph" default="none">
                      <div className={styles.browser}>
                        <div className={styles.chrome}>
                          <span className={styles.lights}>
                            <i />
                            <i />
                            <i />
                          </span>
                          <span className={styles.url}>{shots.url}</span>
                        </div>
                        <Image
                          src={`/images/cases/${shots.desktop}.jpg`}
                          alt=""
                          width={1800}
                          height={1125}
                          sizes="(min-width: 1024px) 46vw, 92vw"
                          className={styles.shot}
                        />
                      </div>
                    </ViewTransition>
                    <div className={styles.phone}>
                      <Image
                        src={`/images/cases/${shots.mobile}.jpg`}
                        alt=""
                        width={780}
                        height={1688}
                        sizes="(min-width: 1024px) 12vw, 28vw"
                        className={styles.shot}
                      />
                    </div>
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>

      {/* One filled ask on screen at a time: while this one is in view the header's is an
          outline (data-header-quiet) and the phone bar steps aside (data-bar-stand-down). */}
      <div className={styles.ask} data-header-quiet="" data-bar-stand-down="">
        <p className={styles.askTitle}>{WORK_SECTION.ask}</p>
        <div className={styles.askAction}>
          <Link href={PRIMARY_CTA.href} className={styles.askPrimary} data-cta-placement="home_work_ask">
            {PRIMARY_CTA.label}
            <span aria-hidden="true" className={styles.askArrow}>
              <Arrow />
            </span>
          </Link>
          <p className={styles.askNote}>{keepTogether(HERO_REASSURE)}</p>
        </div>
      </div>
    </section>
  );
}
