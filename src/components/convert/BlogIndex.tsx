'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { useUrlParams } from './useUrlState';
import styles from './BlogIndex.module.scss';

/**
 * Blog index (brief §2.10): topic chips with live counts, URL-synced (?topic=),
 * and editorial rows. Every row is in the SSR HTML; filtering toggles the
 * `hidden` attribute. Rows beyond the page size stay in the DOM too; "Show
 * more" is a real anchor (?page=n) handled shallowly when JS is available.
 */

export interface BlogRow {
  slug: string;
  title: string;
  /** First sentence of the excerpt (the BlogPosting description's opening). */
  answer: string;
  category: string;
  topic: string;
  dateISO: string;
  dateLabel: string;
  readTime: number;
  author: string;
}

export interface BlogTopic {
  slug: string;
  label: string;
  count: number;
}

export interface BlogIndexProps {
  rows: BlogRow[];
  topics: BlogTopic[];
  pageSize?: number;
}

const ALL = 'all';

export default function BlogIndex({ rows, topics, pageSize = 20 }: BlogIndexProps) {
  const [params, setParams] = useUrlParams();
  const topic = params.get('topic') ?? ALL;
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
  const limit = page * pageSize;

  const matching = topic === ALL ? rows : rows.filter((row) => row.topic === topic);
  const matchingSlugs = new Set(matching.slice(0, limit).map((row) => row.slug));
  const remaining = matching.length - Math.min(limit, matching.length);
  const activeLabel = topic === ALL ? 'All' : (topics.find((entry) => entry.slug === topic)?.label ?? 'All');

  const chipHref = (slug: string) => (slug === ALL ? '?' : `?topic=${slug}`);
  const onChip = (slug: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setParams((next) => {
      if (slug === ALL) next.delete('topic');
      else next.set('topic', slug);
      next.delete('page');
    });
  };
  const moreHref = `?${topic === ALL ? '' : `topic=${topic}&`}page=${page + 1}`;
  const onMore = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setParams((next) => next.set('page', String(page + 1)));
  };

  return (
    <div className={styles.index}>
      <nav className={styles.filters} aria-label="Filter articles by topic">
        <ul className={styles.chipRow}>
          {[{ slug: ALL, label: 'All', count: rows.length }, ...topics].map((entry) => {
            const active = topic === entry.slug;
            return (
              <li key={entry.slug}>
                <Link
                  href={chipHref(entry.slug)}
                  scroll={false}
                  className={styles.chip}
                  aria-current={active ? 'true' : undefined}
                  onClick={onChip(entry.slug)}
                >
                  {entry.label}
                  <span className={styles.count}>{entry.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className={styles.showing} aria-live="polite" aria-atomic="true">
          {activeLabel} · {matching.length} {matching.length === 1 ? 'post' : 'posts'}
        </p>
      </nav>

      <ul className={styles.rows}>
        {rows.map((row) => (
          <li key={row.slug} hidden={!matchingSlugs.has(row.slug)}>
            <Link href={`/blog/${row.slug}`} className={styles.row} data-cursor="view">
              <span className={styles.rowMain}>
                <span className={styles.rowTitle}>{row.title}</span>
                <span className={styles.rowAnswer}>{row.answer}</span>
              </span>
              <span className={styles.rowMeta}>
                <span className={styles.rowCategory}>{row.category}</span>
                <span className={styles.rowByline}>
                  {row.author} · <time dateTime={row.dateISO}>{row.dateLabel}</time> · {row.readTime} min
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className={styles.empty} hidden={matching.length > 0}>
        No posts in this category yet.
      </p>

      <p className={styles.more} hidden={remaining <= 0}>
        <a href={moreHref} className={styles.moreLink} onClick={onMore}>
          Show {Math.min(remaining, pageSize)} more
        </a>
        <span className={styles.showing}>
          {Math.min(limit, matching.length)} of {matching.length}
        </span>
      </p>
    </div>
  );
}
