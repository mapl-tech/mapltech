import ed from '../Company.module.scss';
import type { RegionReason } from '../regions';
import { display } from './display';
import styles from './Reasons.module.scss';

/**
 * The funnel's second step, right after the hero: four local reasons, each a
 * short title and one or two plain sentences, on paper so the change of
 * surface marks "why us" off from "what this is". The index numbers are
 * decoration (the reasons are not steps), so the list is unordered.
 * Server Component, no client JS.
 */
export default function Reasons({
  id,
  label,
  title,
  lede,
  items,
}: {
  id: string;
  label: string;
  title: string;
  lede: string;
  items: readonly RegionReason[];
}) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className={ed.paper} aria-labelledby={titleId}>
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{label}</p>
          <h2 id={titleId} className={ed.title}>
            {title}
          </h2>
          <p className={ed.lede}>{lede}</p>
        </header>

        <ul className={styles.list} role="list">
          {items.map((item, i) => (
            <li key={item.title} className={styles.item}>
              <span className={styles.index} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{display(item.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
