'use client';

import { useEffect, useState } from 'react';
import styles from './PriceList.module.scss';

interface Item {
  id: string;
  name: string;
  from: string;
}

/**
 * The sticky index beside the price list (wide screens). Each entry is a real
 * in-page link; the group nearest the middle of the viewport is marked with
 * `aria-current="location"`, so the list doubles as a reading position.
 */
export default function PriceIndex({ items }: { items: readonly Item[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const groups = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => !!el);
    if (!groups.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.01] },
    );
    groups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className={styles.index} aria-label="Price list sections">
      <ol role="list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={styles.indexLink} aria-current={active === item.id ? 'location' : undefined}>
              <span className={styles.indexName}>{item.name}</span>
              <span className={styles.indexFrom}>{item.from}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
