import Image from 'next/image';
import { HERO_PROOF } from './content';
import styles from './QuoteLine.module.scss';

/**
 * The one approved client quote as a single attributable line (avatar, the
 * quote's first sentence, who said it), for beside an ask: page heroes, the
 * close band, the forms. Proof sits next to the decision it supports, never a
 * section away. `tone="band"` sets it in solid white for the crimson close,
 * `tone="paper"` in ink for the light sheets (the brief). `size="large"`
 * is for a column of its own (the close band's, from 1024px): the quote is
 * set as the column's statement, who said it under it.
 */
export default function QuoteLine({
  tone = 'ground',
  size = 'base',
  className,
}: {
  tone?: 'ground' | 'band' | 'paper';
  size?: 'base' | 'large';
  className?: string;
}) {
  if (!HERO_PROOF) return null;
  return (
    <figure
      className={[styles.quote, className].filter(Boolean).join(' ')}
      data-tone={tone}
      data-size={size === 'large' ? size : undefined}
    >
      {HERO_PROOF.image ? (
        <Image src={HERO_PROOF.image} alt="" width={40} height={40} className={styles.avatar} />
      ) : null}
      <blockquote className={styles.text}>
        <p>“{HERO_PROOF.quote}”</p>
      </blockquote>
      <figcaption className={styles.by}>
        {HERO_PROOF.name}, <span className={styles.role}>{HERO_PROOF.role}</span>
      </figcaption>
    </figure>
  );
}
