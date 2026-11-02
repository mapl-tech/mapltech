import Image from 'next/image';
import Link from 'next/link';
import { LiveClocks } from '@/components/ui/TimezoneOverlap';
import HomeFaq from '@/components/home/HomeFaq';
import type { FaqEntry } from '@/components/home/data';
import { FOUNDERS } from './content';
import styles from './Acts.module.scss';

/** The two founders and the hours the three offices share with you. */
export function Founders() {
  return (
    <section className={styles.founders} aria-labelledby="founders-title">
      <div className={styles.foundersInner}>
        <div className={styles.foundersText}>
          <p className={styles.label}>Who you work with</p>
          <h2 id="founders-title" className={styles.title}>
            {FOUNDERS.title}
          </h2>
          <p className={styles.lede}>{FOUNDERS.lede}</p>
          <div className={styles.clocks}>
            <LiveClocks />
          </div>
          <Link href="/about-us" className={styles.textLink}>
            About MAPL TECH<span aria-hidden="true"> →</span>
          </Link>
        </div>
        <ul className={styles.people} role="list">
          {FOUNDERS.people.map((person) => (
            <li key={person.name} className={styles.person}>
              <Image
                src={person.image}
                alt={`${person.name}, ${person.role} of MAPL TECH`}
                width={480}
                height={600}
                sizes="(min-width: 1024px) 22vw, 45vw"
                className={styles.portrait}
              />
              <p className={styles.personName}>{person.name}</p>
              <p className={styles.personRole}>{person.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Diligence answers, compressed; FAQPage JSON-LD comes from the same items. */
export function Faq({ items }: { items: readonly FaqEntry[] }) {
  return (
    <section className={styles.faq} aria-labelledby="faq-title">
      <div className={styles.faqInner}>
        <div className={styles.faqHead}>
          <p className={styles.label}>Before you sign</p>
          <h2 id="faq-title" className={styles.title}>
            Diligence answers.
          </h2>
          <p className={styles.lede}>The questions agency owners ask us before they sign, answered plainly.</p>
        </div>
        <HomeFaq items={items} />
      </div>
    </section>
  );
}
