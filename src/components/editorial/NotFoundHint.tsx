'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsClient } from '@/components/ui/useMediaQuery';
import { counter, hintFor, type Hint, type HintPages } from './notFoundGuess';
import MailHint from './MailHint';
import styles from './NotFound.module.scss';
import Arrow from '@/components/ui/Arrow';

export type { HintPage } from './notFoundGuess';

/**
 * Path-aware recovery for the 404: the guess (notFoundGuess.ts) as the page's
 * filled button or a short line, else the broken-link report.
 *
 * - A page-level guess is the page's filled button; "Start a project" then
 *   steps back to an outline (NotFound.module.scss, via :has).
 * - The 404 is one static page, so the path is only known in the browser. The
 *   line's box is reserved for two lines (a one-line button fills it), so the
 *   actions under it never move. Until the guess is known it holds the report
 *   unseen (visibility: hidden; without JavaScript a <noscript> style shows
 *   it), so the report never flashes before a guess replaces it.
 * - A blog search is offered only when it finds something, counted over the
 *   archive's own text, and says how many ("· 2 articles", when that still
 *   fits the two lines). The text is fetched once (/blog/search-index.json,
 *   static) only when a guess needs it; after WAIT_MS without it (or if it
 *   cannot arrive) no search is offered and the line settles on what the path
 *   gives without one.
 * - Without a guess, the line holds the broken-link report, which otherwise
 *   closes the page (BrokenLinkReport), so no line repeats a destination
 *   listed below it.
 *
 * The root not-found is part of every page's payload, so this file stays
 * tiny: no data imports; the known pages arrive as props (slugs and names).
 */

// ---------------------------------------------------------------- the archive's text, once, on demand
const INDEX_URL = '/blog/search-index.json';
/** How long the line waits for the archive before it settles without a search. */
const WAIT_MS = 1500;
/** null until settled; [] when the text could not arrive in time (then no search is offered: nothing is promised unseen). */
let archive: readonly string[] | null = null;
let requested = false;
const listeners = new Set<() => void>();

function loadArchive() {
  if (requested) return;
  requested = true;
  // The first answer settles the line: the text, or nothing once the wait is
  // over (a late answer then changes nothing, so the line never swaps twice).
  const settle = (texts: readonly string[]) => {
    if (archive !== null) return;
    archive = texts;
    listeners.forEach((listener) => listener());
  };
  const timer = setTimeout(() => settle([]), WAIT_MS);
  fetch(INDEX_URL)
    .then((response) => (response.ok ? response.json() : []))
    .then((texts: unknown) =>
      settle(Array.isArray(texts) ? texts.filter((text): text is string => typeof text === 'string') : []),
    )
    .catch(() => settle([]))
    .finally(() => clearTimeout(timer));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const archiveSnapshot = () => archive;
const serverSnapshot = () => null;

/**
 * The path's guess once the browser knows the path (and, for a blog search,
 * the archive's counts): undefined before then, null when there is none.
 */
function usePathHint(pages: HintPages): Hint | null | undefined {
  const pathname = usePathname() ?? '';
  const known = useIsClient();
  const texts = useSyncExternalStore(subscribe, archiveSnapshot, serverSnapshot);
  const count = useMemo(() => (texts ? counter(texts) : null), [texts]);
  const hint = known ? hintFor(pathname, pages, { search: window.location.search, count }) : undefined;
  const waiting = known && hint === undefined;
  useEffect(() => {
    if (waiting) loadArchive();
  }, [waiting]);
  return hint;
}

/**
 * "Tell us about this broken link": an email to the site address. Once the
 * browser knows them, the subject names the path and the body carries the
 * full address and the page the link was on, so it can be fixed at the source.
 */
function ReportLine({ email }: { email: string }) {
  const pathname = usePathname() ?? '';
  const known = useIsClient();
  let query = `subject=${encodeURIComponent('Broken link on mapltech.com')}`;
  if (known && pathname) {
    const from = document.referrer ? `\nLinked from: ${document.referrer}` : '';
    query = `subject=${encodeURIComponent(`Broken link: ${pathname}`)}&body=${encodeURIComponent(
      `Page not found: ${window.location.href}${from}\n`,
    )}`;
  }

  return (
    <>
      Followed a link that should work?{' '}
      <a href={`mailto:${email}?${query}`} className={styles.reportLink}>
        Tell us about this broken link
        <MailHint />
      </a>
    </>
  );
}

export default function NotFoundHint({ services = [], cases = [], email }: Partial<HintPages> & { email: string }) {
  const hint = usePathHint({ services, cases });
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const detailRef = useRef<HTMLSpanElement>(null);

  // The count rides on the button only while the button still fits the two
  // lines the box keeps for it (a long word on a narrow phone drops it), so
  // nothing below ever moves. Measured before paint, on every render.
  useLayoutEffect(() => {
    const button = buttonRef.current;
    const detail = detailRef.current;
    if (!button || !detail) return;
    detail.hidden = false;
    const box = button.parentElement;
    if (box && button.offsetHeight > parseFloat(getComputedStyle(box).minHeight)) detail.hidden = true;
  });

  if (hint === undefined) {
    // Not known yet: the server HTML, hydration, or a blog search waiting on the archive.
    return (
      <p className={`${styles.hint} ${styles.hintWaiting}`}>
        <ReportLine email={email} />
        <noscript>
          <style>{`.${styles.hintWaiting}{visibility:visible}`}</style>
        </noscript>
      </p>
    );
  }

  return (
    <p className={styles.hint}>
      {!hint ? (
        <ReportLine email={email} />
      ) : hint.specific ? (
        <Link ref={buttonRef} href={hint.href} className={styles.hintButton} data-cta-placement="not_found_hint">
          <span>
            {hint.label}
            {hint.detail ? (
              <span ref={detailRef}>
                <span aria-hidden="true"> · </span>
                <span className="visually-hidden">, </span>
                {hint.detail}
              </span>
            ) : null}
          </span>
          <span aria-hidden="true" className={styles.arrow}>
            <Arrow />
          </span>
        </Link>
      ) : (
        <>
          {hint.lead}{' '}
          <Link href={hint.href} className={styles.hintLink} data-cta-placement="not_found_hint">
            {hint.label}
          </Link>
        </>
      )}
    </p>
  );
}

/** The report at the end of the page, when a guess holds the line it would otherwise take. */
export function BrokenLinkReport({ services = [], cases = [], email }: Partial<HintPages> & { email: string }) {
  const hint = usePathHint({ services, cases });
  if (!hint) return null;
  return (
    <p className={styles.report}>
      <ReportLine email={email} />
    </p>
  );
}
