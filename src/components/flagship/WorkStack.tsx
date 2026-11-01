import Image from 'next/image';
import Link from 'next/link';
import { WORK, WORK_INTRO } from './content';
import styles from './WorkStack.module.scss';

/**
 * Act 7, Trust. Case cards that pile up as you scroll (sticky stack on wide
 * screens, a plain list on phones). Each whole card is the link (Fitts's law);
 * every number on a card is sourced in content.ts.
 */
export default function WorkStack() {
  return (
    <section className={styles.work} aria-labelledby="work-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 id="work-title" className={styles.title}>
            {WORK_INTRO.title}
          </h2>
          <p className={styles.lede}>{WORK_INTRO.lede}</p>
        </header>

        <ol className={styles.stack} role="list">
          {WORK.map((card, i) => (
            <li key={card.slug} className={styles.item} style={{ '--i': i } as React.CSSProperties}>
              <Link href={card.href} className={styles.card} aria-labelledby={`work-${card.slug}`}>
                <div className={styles.text}>
                  <p className={styles.kind}>{card.kind}</p>
                  <h3 id={`work-${card.slug}`} className={styles.client}>
                    {card.client}
                  </h3>
                  <p className={styles.outcome}>{card.outcome}</p>
                  <dl className={styles.metrics}>
                    {card.metrics.map((metric) => (
                      <div key={metric.label} className={styles.metric}>
                        <dt className={styles.metricLabel}>{metric.label}</dt>
                        <dd className={styles.metricValue}>{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <span className={styles.read}>
                    Read the case study<span aria-hidden="true"> →</span>
                  </span>
                </div>
                <div className={styles.media}>
                  <Image
                    src={card.image.src}
                    alt={card.image.alt}
                    width={1200}
                    height={800}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className={styles.shot}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <p className={styles.all}>
          <Link href="/our-work" className={styles.allLink}>
            See the work<span aria-hidden="true"> →</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
