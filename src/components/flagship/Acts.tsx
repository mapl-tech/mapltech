import HomeFaq from '@/components/home/HomeFaq';
import type { FaqEntry } from '@/components/home/data';
import styles from './Acts.module.scss';

/** The questions agencies ask before they sign; FAQPage JSON-LD comes from the same items. */
export function Faq({ items }: { items: readonly FaqEntry[] }) {
  return (
    <section className={styles.faq} aria-labelledby="faq-title">
      <div className={styles.faqInner}>
        <div className={styles.faqHead}>
          <p className={styles.label}>Before you sign</p>
          <h2 id="faq-title" className={styles.title}>
            Questions agencies ask.
          </h2>
          <p className={styles.lede}>What agency owners ask us before they sign, with short answers.</p>
        </div>
        <HomeFaq items={items} />
      </div>
    </section>
  );
}
