import Link from 'next/link';
import styles from './Rows.module.scss';

export interface ArticleRowProps {
  href: string;
  title: string;
  /** One line under the title: the excerpt's first sentence. */
  excerpt: string;
  /** The topic as shown (canonical service name or "Industry"). */
  category: string;
  dateISO: string;
  /** "Sep 7" inside a month group, "Sep 7, 2026" on its own. */
  dateLabel: string;
  readTime: number;
  headingId: string;
  as?: 'h3' | 'h4';
}

/**
 * One article as an editorial row on paper: the date, a large title, the
 * one-line answer, then topic and reading time. The title link is stretched
 * over the row, so the whole row is the target while the link's name stays
 * the title. No hooks, so the archive island and the server-rendered post
 * template share it.
 */
export default function ArticleRow({
  href,
  title,
  excerpt,
  category,
  dateISO,
  dateLabel,
  readTime,
  headingId,
  as: Heading = 'h3',
}: ArticleRowProps) {
  return (
    <article className={styles.row} aria-labelledby={headingId}>
      <time className={styles.date} dateTime={dateISO}>
        {dateLabel}
      </time>
      <div className={styles.main}>
        <Heading id={headingId} className={styles.title}>
          <Link href={href} className={styles.link}>
            {title}
          </Link>
        </Heading>
        <p className={styles.excerpt}>{excerpt}</p>
      </div>
      <p className={styles.meta}>
        <span>{category}</span>
        <span>{readTime} min read</span>
      </p>
      <span className={styles.go} aria-hidden="true">
        →
      </span>
    </article>
  );
}
