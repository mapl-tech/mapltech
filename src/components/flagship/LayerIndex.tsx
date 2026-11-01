'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Layers.module.scss';

interface Item {
  id: string;
  name: string;
  fromPrice: string;
}

/**
 * The sticky index beside the four layers. It marks the panel nearest the
 * middle of the viewport with `aria-current="step"`; each entry is a real link
 * to its panel, so the list doubles as in-page navigation.
 */
export default function LayerIndex({ items }: { items: readonly Item[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const panels = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => !!el);
    if (!panels.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.01] },
    );
    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, [items]);

  return (
    <ol className={styles.index} role="list">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={`#${item.id}`} className={styles.indexLink} aria-current={active === item.id ? 'step' : undefined}>
            <span className={styles.indexName}>{item.name}</span>
            <span className={styles.indexPrice}>{item.fromPrice}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
