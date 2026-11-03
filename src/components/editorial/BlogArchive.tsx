'use client';

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import { useUrlParams } from '@/components/convert/useUrlState';
import { useIsClient } from '@/components/ui/useMediaQuery';
import { searchable } from '@/components/convert/blog-utils';
import ArticleRow from './ArticleRow';
import styles from './BlogArchive.module.scss';

/**
 * The blog archive, on paper: every post, newest first, grouped by month as
 * editorial rows, with a topic filter and an instant search over titles,
 * one-line answers and topics.
 *
 * - All rows are in the server HTML, so every post link is crawlable; filtered
 *   or not-yet-revealed rows carry the `hidden` attribute.
 * - Topic and search mirror to the URL (?topic=, ?q=) through a shallow
 *   replaceState store (no useSearchParams, so the SSR HTML is kept); post
 *   breadcrumbs link here as /blog?topic=...#archive.
 * - The search text is derived in the browser from the rows already on the
 *   page, so nothing extra ships in the payload.
 * - Progressive reveal: 24 rows, then "Show 24 more". Without JavaScript the
 *   same control is a link to #archive-all, and :target reveals every row.
 * - Topic counts are facets: they follow the current search.
 * - One polite live region reports the result count; the empty state says what
 *   to try next.
 */

export interface ArchiveRow {
  slug: string;
  title: string;
  /** The excerpt's first sentence. */
  answer: string;
  /** The topic as shown (canonical service name or "Industry"). */
  category: string;
  topic: string;
  dateISO: string;
  /** "Sep 7" */
  dateLabel: string;
  /** "2026-09" */
  monthKey: string;
  /** "September 2026" */
  monthLabel: string;
  readTime: number;
}

export interface ArchiveTopic {
  slug: string;
  label: string;
}

interface BlogArchiveProps {
  rows: readonly ArchiveRow[];
  topics: readonly ArchiveTopic[];
  pageSize?: number;
}

const ALL = 'all';
const URL_DELAY = 400;

export default function BlogArchive({ rows, topics, pageSize = 24 }: BlogArchiveProps) {
  const [params, setParams] = useUrlParams();
  // Until hydration the no-script reveal (#archive-all:target) is live; after it, state owns the list.
  const hydrated = useIsClient();
  const urlTopic = params.get('topic');
  const topic = urlTopic && topics.some((entry) => entry.slug === urlTopic) ? urlTopic : ALL;
  const urlQuery = params.get('q') ?? '';

  // The field is typed into locally and mirrored to the URL after a pause.
  const [draft, setDraft] = useState<string | null>(null);
  const query = draft ?? urlQuery;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // The search text is derived here, not shipped: ~100 short strings normalise in
  // well under a millisecond, and the page payload stays a third lighter.
  const index = useMemo(() => new Map(rows.map((row) => [row, searchable(`${row.title} ${row.answer} ${row.category}`)])), [rows]);
  const terms = useMemo(() => searchable(query).split(/\s+/).filter(Boolean), [query]);
  const searched = useMemo(
    () => (terms.length ? rows.filter((row) => terms.every((term) => index.get(row)?.includes(term))) : rows),
    [rows, terms, index],
  );
  const matches = useMemo(
    () => (topic === ALL ? searched : searched.filter((row) => row.topic === topic)),
    [searched, topic],
  );

  // Paging resets whenever the filter changes (derived, no effect).
  const filterKey = `${topic}|${terms.join(' ')}`;
  const [paging, setPaging] = useState({ key: filterKey, pages: 1 });
  const pages = paging.key === filterKey ? paging.pages : 1;
  const limit = pages * pageSize;
  const shown = Math.min(limit, matches.length);
  const remaining = matches.length - shown;

  const visible = useMemo(() => new Set(matches.slice(0, limit).map((row) => row.slug)), [matches, limit]);

  const groups = useMemo(() => {
    const out: { key: string; label: string; rows: ArchiveRow[] }[] = [];
    for (const row of rows) {
      const last = out[out.length - 1];
      if (last && last.key === row.monthKey) last.rows.push(row);
      else out.push({ key: row.monthKey, label: row.monthLabel, rows: [row] });
    }
    return out;
  }, [rows]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of searched) map.set(row.topic, (map.get(row.topic) ?? 0) + 1);
    return map;
  }, [searched]);

  const topicLabel = topics.find((entry) => entry.slug === topic)?.label;

  /** The result line: shown as you type, announced once typing pauses. */
  const describe = (text: string): string => {
    const words = searchable(text).split(/\s+/).filter(Boolean);
    const pool = words.length ? rows.filter((row) => words.every((word) => index.get(row)?.includes(word))) : rows;
    const found = topic === ALL ? pool : pool.filter((row) => row.topic === topic);
    if (topic === ALL && !words.length) return `Showing ${Math.min(limit, found.length)} of ${rows.length} articles, newest first`;
    if (!found.length) return `No articles match${words.length ? ` “${text.trim()}”` : ''}${topicLabel ? ` in ${topicLabel}` : ''}`;
    const noun = found.length === 1 ? 'article' : 'articles';
    const where = topicLabel ? ` in ${topicLabel}` : '';
    const what = words.length ? ` matching “${text.trim()}”` : '';
    const more = found.length > limit ? `, showing ${limit}` : '';
    return `${found.length} ${noun}${where}${what}${more}`;
  };

  const syncQuery = (value: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setParams((next) => {
        if (value.trim()) next.set('q', value.trim());
        else next.delete('q');
      });
    }, URL_DELAY);
  };

  const onQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value);
    syncQuery(event.target.value);
  };

  const clearQuery = () => {
    setDraft('');
    syncQuery('');
    document.getElementById('archive-q')?.focus();
  };

  const chooseTopic = (slug: string) => {
    setParams((next) => {
      if (slug === ALL) next.delete('topic');
      else next.set('topic', slug);
    });
  };

  const clearAll = () => {
    clearTimeout(timer.current);
    setDraft('');
    setParams((next) => {
      next.delete('topic');
      next.delete('q');
    });
  };

  const showMore = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setPaging({ key: filterKey, pages: pages + 1 });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className={styles.archive} data-hydrated={hydrated ? '' : undefined}>
      <div className={styles.controls}>
        <form role="search" className={styles.search} onSubmit={onSubmit} aria-label="Search the blog">
          <label htmlFor="archive-q" className={styles.label}>
            Search the archive
          </label>
          <div className={styles.field}>
            <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 20 20" />
            </svg>
            <input
              id="archive-q"
              name="q"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              className={styles.input}
              placeholder="Try “WCAG” or “AI agents”"
              value={query}
              onChange={onQuery}
              aria-controls="archive-all"
            />
            {query ? (
              <button type="button" className={styles.clear} onClick={clearQuery}>
                <span className="visually-hidden">Clear the search</span>
                <span aria-hidden="true" className={styles.clearIcon} />
              </button>
            ) : null}
          </div>
        </form>

        <div className={styles.topics}>
          <p id="archive-topics" className={styles.label}>
            Topic
          </p>
          <div className={styles.chips} role="group" aria-labelledby="archive-topics">
            {[{ slug: ALL, label: 'All' }, ...topics].map((entry) => {
              const count = entry.slug === ALL ? searched.length : (counts.get(entry.slug) ?? 0);
              return (
                <button
                  key={entry.slug}
                  type="button"
                  className={styles.chip}
                  aria-pressed={topic === entry.slug}
                  aria-controls="archive-all"
                  onClick={() => chooseTopic(entry.slug)}
                >
                  {entry.label}
                  <span className={styles.count}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className={styles.status} aria-hidden="true">
        {describe(query)}
      </p>
      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {describe(urlQuery)}
      </p>

      <div id="archive-all" className={styles.groups}>
        {groups.map((group) => {
          const inView = group.rows.filter((row) => visible.has(row.slug)).length;
          return (
            <div key={group.key} className={styles.group} hidden={inView === 0}>
              <h3 className={styles.month}>
                {group.label}
                <span className={styles.monthCount}>
                  {inView} {inView === 1 ? 'article' : 'articles'}
                </span>
              </h3>
              <ol className={styles.list} role="list">
                {group.rows.map((row) => (
                  <li key={row.slug} className={styles.item} hidden={!visible.has(row.slug)}>
                    <ArticleRow
                      href={`/blog/${row.slug}`}
                      title={row.title}
                      excerpt={row.answer}
                      category={row.category}
                      dateISO={row.dateISO}
                      dateLabel={row.dateLabel}
                      readTime={row.readTime}
                      headingId={`post-${row.slug}`}
                      as="h4"
                    />
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>

      <div className={styles.empty} hidden={matches.length > 0}>
        <p className={styles.emptyTitle}>
          {terms.length ? `Nothing matches “${query.trim()}”` : 'No articles here yet'}
          {topicLabel ? ` in ${topicLabel}` : ''}.
        </p>
        <p className={styles.emptyText}>
          Try a shorter word or another topic. Want a price instead? The estimator is faster:{' '}
          <Link href="/pricing#estimator">open the estimator</Link>.
        </p>
        <button type="button" className={styles.emptyButton} onClick={clearAll}>
          Clear search and topic
        </button>
      </div>

      <div className={styles.more} hidden={remaining <= 0}>
        <a href="#archive-all" className={styles.moreButton} onClick={showMore}>
          Show {Math.min(remaining, pageSize)} more
        </a>
        <span className={styles.moreCount}>
          {shown} of {matches.length}
        </span>
      </div>
    </div>
  );
}
