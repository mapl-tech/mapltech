import Image from 'next/image';
import Link from 'next/link';
import SnapRow from '@/components/ui/SnapRow';
import type { ProofItem } from './data';
import styles from './TestimonialRow.module.scss';

/**
 * 06 Proof: testimonials as a snap/drag row (interaction #8), each quote
 * paired with the claim it proves. With a single approved quote the card is
 * rendered on its own; SnapRow takes over as soon as a second one ships.
 */

function Card({ item }: { item: ProofItem }) {
  return (
    <figure className={styles.card}>
      <p className={styles.pair}>
        <span className={styles.pairKey}>Pairs with</span>
        {item.pairsWith}
      </p>
      <blockquote className={styles.quote}>
        <p>{item.quote}</p>
      </blockquote>
      <figcaption className={styles.who}>
        <Image src={item.image} alt="" width={48} height={48} className={styles.avatar} />
        <span className={styles.person}>
          <span className={styles.name}>{item.name}</span>
          <span className={styles.role}>
            {item.role}, {item.company}
          </span>
        </span>
        {item.caseHref && item.caseLabel ? (
          <Link href={item.caseHref} className={styles.caseLink} data-cursor="view">
            {item.caseLabel}
          </Link>
        ) : null}
      </figcaption>
    </figure>
  );
}

export default function TestimonialRow({ items }: { items: readonly ProofItem[] }) {
  if (items.length === 0) return null;
  if (items.length === 1) {
    return (
      <div className={styles.single}>
        <Card item={items[0]} />
      </div>
    );
  }
  return (
    <SnapRow label="Client testimonials">
      {items.map((item) => (
        <Card key={`${item.name}-${item.company}`} item={item} />
      ))}
    </SnapRow>
  );
}
