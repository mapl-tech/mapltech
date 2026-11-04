'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
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
 * - The 404 is one static page, so the path is only known in the browser: the
 *   server HTML (and the hydration pass) carry the report line, then the guess
 *   replaces it inside a box reserved for two lines (a one-line button fills
 *   it), so the actions under it never move.
 * - A blog search is offered only when it finds something, counted over the
 *   archive's own text. That text is fetched once (/blog/search-index.json,
 *   static) only when a guess needs it; until it arrives the line keeps the
 *   report, and if it cannot arrive no search is offered.
 * - Without a guess, the line holds the broken-link report, which otherwise
 *   closes the page (BrokenLinkReport), so no line repeats a destination
 *   listed below it.
 *
 * The root not-found is part of every page's payload, so this file stays
 * tiny: no data imports; the known pages arrive as props (slugs and names).
 */

// ---------------------------------------------------------------- the archive's text, once, on demand
const INDEX_URL = '/blog/search-index.json';
/** null until fetched; [] when it could not be (then no search is offered: nothing is promised unseen). */
let archive: readonly string[] | null = null;
let requested = false;
const listeners = new Set<() => void>();

function loadArchive() {
  if (requested) return;
  requested = true;
  fetch(INDEX_URL)
    .then((response) => (response.ok ? response.json() : []))
    .then((texts: unknown) => {
      archive = Array.isArray(texts) ? texts.filter((text): text is string => typeof text === 'string') : [];
    })
    .catch(() => {
      archive = [];
    })
    .finally(() => listeners.forEach((listener) => listener()));
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

  return (
    <p className={styles.hint}>
      {!hint ? (
        <ReportLine email={email} />
      ) : hint.specific ? (
        <Link href={hint.href} className={styles.hintButton} data-cta-placement="not_found_hint">
          {hint.label}
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
