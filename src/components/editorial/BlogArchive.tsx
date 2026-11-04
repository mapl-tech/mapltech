'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { useUrlParams } from '@/components/convert/useUrlState';
import { ESTIMATE_HREF } from '@/components/layout/chrome';
import { useIsClient } from '@/components/ui/useMediaQuery';
import { archiveText, matchesWords, wordsOf } from './archiveSearch';
import ArticleRow from './ArticleRow';
import type { ServiceLink } from './services';
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
 * - The payload carries only what a row shows: topic labels, short dates and
 *   month headings are derived here, and the search text is built in the
 *   browser from the rows.
 * - The post shown large above the archive (`featured`) is left out of the
 *   default list; a topic or a search covers every post. It still counts as
 *   shown, so the totals ("25 of 101") match the "All" chip.
 * - A service topic adds one line linking to that service, with its public
 *   starting price; the views without a service (All, Industry) name all four
 *   (`services`), so a service is one tap away from the first rows.
 * - Progressive reveal: 24 rows, then "Show 24 more", a button that moves focus
 *   to the first new row. Before hydration the same control is a link to
 *   #archive-all, and :target reveals every row. Without JavaScript at all a
 *   <noscript> style shows every row and drops the controls that need script
 *   (search, topics, paging).
 * - A search term matches where a word starts ("ai" finds "AI agents", not
 *   "maintain"; "access" still finds "accessibility" as you type). The
 *   matcher lives in archiveSearch.ts, which the 404 counts with too.
 * - Topic counts are facets: they follow the current search.
 * - One polite live region reports the result count, inside the visible
 *   result line. Enter (a phone keyboard's Search key) applies the search at
 *   once and moves focus to that line, so the keyboard closes over the
 *   results, not on them. The line shows a focus ring unless the search was
 *   started by touch, where the closing keyboard is the cue.
 * - The empty state says what is true and what to try next: a shorter or
 *   different word when nothing matches anywhere; when only other topics have
 *   matches, which ones and how many, with a button that switches to them
 *   (focus moves on to the first match, as "Show more" does).
 * - Any link to #archive-q ("Search all articles" in the page hero) lands in
 *   the search field, and so do both clear controls.
 */

export interface ArchiveRow {
  slug: string;
  title: string;
  /** The excerpt's first sentence. */
  answer: string;
  /** Topic slug (an ArchiveTopic's `slug`). */
  topic: string;
  /** ISO date, "2026-09-07". */
  date: string;
  readTime: number;
}

export interface ArchiveTopic {
  slug: string;
  /** The topic as shown (canonical service name or "Industry"). */
  label: string;
  /**
   * The service page behind a service topic, its public "from" price
   * ("$5,000") and the estimator with that service chosen.
   */
  service?: { href: string; from: string; estimate: string };
}

interface BlogArchiveProps {
  rows: readonly ArchiveRow[];
  topics: readonly ArchiveTopic[];
  /** The four service lines in site order, with their pages and public prices (services.ts serviceLinks()). */
  services?: readonly ServiceLink[];
  /** Slug of the post presented above the archive: not repeated in the default list. */
  featured?: string;
  pageSize?: number;
}

const ALL = 'all';
const URL_DELAY = 400;
/** The estimator, under the label the site gives it everywhere. */
const ESTIMATE = { label: 'Price your project', href: ESTIMATE_HREF };
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * The no-script view: every row and month shows (the post presented above
 * stays out), and the search, topic chips, result line, paging and the month
 * counts (rendered for the first page) are dropped, since none of them holds
 * without script. The hero's "Search all articles" link points at the search
 * field, so it goes too.
 */
const noscriptCss = [
  `.${styles.group}[hidden]:not([data-featured]),.${styles.item}[hidden]:not([data-featured]){display:block}`,
  `.${styles.controls},.${styles.status},.${styles.more},.${styles.monthCount},a[href="#archive-q"]{display:none!important}`,
].join('');

/** "September 2026" from "2026-09-07". */
const monthOf = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
/** "Sep 7" from "2026-09-07". */
const dayOf = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1].slice(0, 3)} ${Number(iso.slice(8, 10))}`;

/** "A, B and C" (no serial comma). */
const joinList = (items: readonly string[]) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export default function BlogArchive({ rows, topics, services = [], featured, pageSize = 24 }: BlogArchiveProps) {
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
  // Whether the last search was sent by touch (a phone's on-screen Search key):
  // the result line it focuses then shows no ring (see onSubmit).
  const byTouch = useRef(false);
  const [touchSubmit, setTouchSubmit] = useState(false);

  const labels = useMemo(() => new Map(topics.map((entry) => [entry.slug, entry.label])), [topics]);

  // The search text is derived here, not shipped: ~100 short strings normalise in
  // well under a millisecond.
  const index = useMemo(
    () => new Map(rows.map((row) => [row, archiveText(row.title, row.answer, labels.get(row.topic) ?? '')])),
    [rows, labels],
  );
  const terms = useMemo(() => wordsOf(query), [query]);
  /** The rows holding every word, each where a word starts. */
  const find = useCallback(
    (words: readonly string[]) => (words.length ? rows.filter((row) => matchesWords(index.get(row) ?? '', words)) : rows),
    [rows, index],
  );
  const searched = useMemo(() => find(terms), [find, terms]);
  // Browsing (no topic, no search): the featured post already sits above the archive.
  const browsing = topic === ALL && terms.length === 0;
  const browseRows = useMemo(() => (featured ? rows.filter((row) => row.slug !== featured) : rows), [featured, rows]);
  // The post above counts as shown while browsing, so every total matches "All".
  const above = rows.length - browseRows.length;
  const matches = useMemo(() => {
    if (browsing) return browseRows;
    return topic === ALL ? searched : searched.filter((row) => row.topic === topic);
  }, [browsing, browseRows, searched, topic]);

  // Paging resets whenever the filter changes (derived, no effect).
  const filterKey = `${topic}|${terms.join(' ')}`;
  const [paging, setPaging] = useState({ key: filterKey, pages: 1 });
  const pages = paging.key === filterKey ? paging.pages : 1;
  const limit = pages * pageSize;
  const shown = Math.min(limit, matches.length);
  const remaining = matches.length - shown;
  const lead = browsing ? above : 0;

  const visible = useMemo(() => new Set(matches.slice(0, limit).map((row) => row.slug)), [matches, limit]);

  const groups = useMemo(() => {
    const out: { key: string; label: string; rows: ArchiveRow[] }[] = [];
    for (const row of rows) {
      const key = row.date.slice(0, 7);
      const last = out[out.length - 1];
      if (last && last.key === key) last.rows.push(row);
      else out.push({ key, label: monthOf(row.date), rows: [row] });
    }
    return out;
  }, [rows]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of searched) map.set(row.topic, (map.get(row.topic) ?? 0) + 1);
    return map;
  }, [searched]);

  const current = topics.find((entry) => entry.slug === topic);
  const topicLabel = current?.label;

  // A search that finds nothing in this topic but something in others: those
  // topics, in chip order, with their counts (the empty state names them).
  const elsewhere =
    terms.length && topic !== ALL
      ? topics.flatMap((entry) => {
          const count = counts.get(entry.slug) ?? 0;
          return entry.slug !== topic && count > 0 ? [{ slug: entry.slug, label: entry.label, count }] : [];
        })
      : [];

  /** What the empty state says is true: where the search finds articles, or what to try. */
  const emptyTitle = (): string => {
    if (!terms.length) return 'Try another topic.';
    if (!elsewhere.length) return terms.length > 1 ? 'Try fewer words, or different ones.' : 'Try a shorter word, or a different one.';
    const [first, ...others] = elsewhere;
    const total = elsewhere.reduce((sum, entry) => sum + entry.count, 0);
    const places = [
      `${first.count} ${first.count === 1 ? 'article' : 'articles'} in ${first.label}`,
      ...others.map((entry) => `${entry.count} in ${entry.label}`),
    ];
    return `${joinList(places)} ${total === 1 ? 'matches' : 'match'} “${query.trim()}”.`;
  };

  /** The result line: shown as you type, announced once typing pauses. */
  const describe = (text: string): string => {
    const words = wordsOf(text);
    if (topic === ALL && !words.length) {
      return `Showing ${Math.min(limit, browseRows.length) + above} of ${rows.length} articles, newest first`;
    }
    const pool = find(words);
    const found = topic === ALL ? pool : pool.filter((row) => row.topic === topic);
    if (!found.length) return `No articles match${words.length ? ` “${text.trim()}”` : ''}${topicLabel ? ` in ${topicLabel}` : ''}`;
    const noun = found.length === 1 ? 'article' : 'articles';
    const where = topicLabel ? ` in ${topicLabel}` : '';
    const what = words.length ? ` matching “${text.trim()}”` : '';
    const more = found.length > limit ? `, showing ${limit}` : '';
    return `${found.length} ${noun}${where}${what}${more}`;
  };

  // Links to the field land in it. The desktop smooth-scroll handler focuses its
  // target itself; a native jump (touch, reduced motion) only scrolls, so focus
  // follows here, inside the same tap (phones open the keyboard for it).
  useEffect(() => {
    const onClick = (event: globalThis.MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target as Element | null)?.closest('a[href="#archive-q"]')) return;
      document.getElementById('archive-q')?.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // How the page was last used: a tap or a pen (a phone's keyboard opens for
  // the field) or not (a mouse, a trackpad); Tab hands it back to the keyboard.
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      byTouch.current = event.pointerType === 'touch' || event.pointerType === 'pen';
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') byTouch.current = false;
    };
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, []);

  const writeQuery = (value: string) => {
    setParams((next) => {
      if (value.trim()) next.set('q', value.trim());
      else next.delete('q');
    });
  };

  const syncQuery = (value: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => writeQuery(value), URL_DELAY);
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

  // This button sits in the empty state too, which hides once the matches show:
  // they render now, then focus moves on to the first one's link (as "Show
  // more" does), and the result line reports the new count politely.
  const switchTopic = (slug: string) => {
    const first = slug === ALL ? searched[0] : searched.find((row) => row.topic === slug);
    flushSync(() => chooseTopic(slug));
    if (first) document.getElementById(`post-${first.slug}`)?.querySelector('a')?.focus();
  };

  // The button sits in the empty state, which hides once the list is back, so
  // focus moves to the field first (as "Clear the search" does).
  const clearAll = () => {
    clearTimeout(timer.current);
    setDraft('');
    setParams((next) => {
      next.delete('topic');
      next.delete('q');
    });
    document.getElementById('archive-q')?.focus();
  };

  // The next page renders synchronously, then focus moves to its first row's
  // link, so keyboard and screen reader users continue from the new rows.
  const showMore = () => {
    const next = matches[limit];
    flushSync(() => setPaging({ key: filterKey, pages: pages + 1 }));
    if (next) document.getElementById(`post-${next.slug}`)?.querySelector('a')?.focus();
  };

  // Enter, or a phone keyboard's Search key: the search applies now (the line
  // is current before focus reaches it), the field lets go, so the keyboard
  // closes, and focus lands on the result line without scrolling the page.
  // Sent by touch, the closing keyboard is the cue and the line shows no
  // ring; from a mouse or any hardware keyboard (a tablet's too) it does.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearTimeout(timer.current);
    flushSync(() => {
      writeQuery(query);
      setTouchSubmit(byTouch.current);
    });
    document.getElementById('archive-q')?.blur();
    document.getElementById('archive-status')?.focus({ preventScroll: true });
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
          {/* Phones: one row that scrolls sideways; every chip is a button, so Tab reaches each. */}
          <div className={styles.chips} role="group" aria-labelledby="archive-topics">
            {[{ slug: ALL, label: 'All' }, ...topics].map((entry) => {
              const count = entry.slug === ALL ? searched.length : (counts.get(entry.slug) ?? 0);
              return (
                <button
                  key={entry.slug}
                  type="button"
                  className={styles.chip}
                  // Named "All, 101 articles", not "All101".
                  aria-label={`${entry.label}, ${count} ${count === 1 ? 'article' : 'articles'}`}
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

      {/* Seen as you type; read out (the live part) once typing pauses. Focus lands
          here after a search is submitted, and reads the live part once. */}
      <p id="archive-status" className={styles.status} tabIndex={-1} data-touch={touchSubmit ? '' : undefined}>
        <span aria-hidden="true">{describe(query)}</span>
        <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {describe(urlQuery)}
        </span>
      </p>

      {current?.service ? (
        <p className={styles.service}>
          Our{' '}
          <Link href={current.service.href} className={styles.serviceLink} data-cta-placement="blog_topic_service">
            {current.label}
          </Link>{' '}
          service is delivered under your brand, from&nbsp;{current.service.from}.
        </p>
      ) : services.length ? (
        // All and Industry: the four services, each one tap away, with its public price
        // (the hero's note has already said they are delivered under your brand).
        <p className={styles.service}>
          Each service has a public price:{' '}
          {services.map((entry, i) => (
            <Fragment key={entry.href}>
              {i === 0 ? null : i === services.length - 1 ? ' and ' : ', '}
              <Link href={entry.href} className={styles.serviceLink} data-cta-placement="blog_archive_service">
                {entry.name}
              </Link>{' '}
              from&nbsp;{entry.from}
            </Fragment>
          ))}
          .
        </p>
      ) : null}

      <div id="archive-all" className={styles.groups}>
        {groups.map((group) => {
          const inView = group.rows.filter((row) => visible.has(row.slug)).length;
          // A month holding only the post shown above stays hidden without JavaScript too.
          const onlyFeatured = group.rows.every((row) => row.slug === featured);
          return (
            <div
              key={group.key}
              className={styles.group}
              hidden={inView === 0}
              data-featured={onlyFeatured ? '' : undefined}
            >
              {/* The heading is the month alone; the count beside it is its own line of text. */}
              <div className={styles.monthHead}>
                <h3 className={styles.month}>{group.label}</h3>
                <p className={styles.monthCount}>
                  {inView} {inView === 1 ? 'article' : 'articles'}
                </p>
              </div>
              <ol className={styles.list} role="list">
                {group.rows.map((row) => (
                  <li
                    key={row.slug}
                    className={styles.item}
                    hidden={!visible.has(row.slug)}
                    data-featured={row.slug === featured ? '' : undefined}
                  >
                    <ArticleRow
                      href={`/blog/${row.slug}`}
                      title={row.title}
                      excerpt={row.answer}
                      category={labels.get(row.topic) ?? ''}
                      dateISO={row.date}
                      dateLabel={dayOf(row.date)}
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

      {/* The result line above already says nothing matched here: this says what is
          true (other topics' matches, or none anywhere) and what to do next. */}
      <div className={styles.empty} hidden={matches.length > 0}>
        <p className={styles.emptyTitle}>{emptyTitle()}</p>
        <div className={styles.emptyActions}>
          {elsewhere.length ? (
            <button
              type="button"
              className={styles.emptyButton}
              onClick={() => switchTopic(elsewhere.length === 1 ? elsewhere[0].slug : ALL)}
            >
              {elsewhere.length === 1 ? `Switch to ${elsewhere[0].label}` : 'Switch to all topics'}
            </button>
          ) : null}
          <button type="button" className={styles.emptyButton} onClick={clearAll}>
            Clear search and topic
          </button>
        </div>
        <p className={styles.emptyText}>
          Want a price instead? The estimator shows your price before we ask for anything:{' '}
          <Link href={current?.service?.estimate ?? ESTIMATE.href} data-cta-placement="blog_archive_empty_estimate">
            {ESTIMATE.label}
          </Link>
          .
        </p>
      </div>

      <div className={styles.more} hidden={remaining <= 0}>
        {hydrated ? (
          <button type="button" className={styles.moreButton} onClick={showMore}>
            Show {Math.min(remaining, pageSize)} more
          </button>
        ) : (
          // Before hydration: a link that reveals every row (:target).
          <a href="#archive-all" className={styles.moreButton}>
            Show {Math.min(remaining, pageSize)} more
          </a>
        )}
        <span className={styles.moreCount}>
          {shown + lead} of {matches.length + lead}
        </span>
      </div>

      {/* No JavaScript: every row (the post above excepted), and none of the controls that need script. */}
      <noscript>
        <style>{noscriptCss}</style>
      </noscript>
    </div>
  );
}
