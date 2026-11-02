'use client';

import { WORK_END, WORK_START, isOfficeOpen, useMinute, zoneTime } from '@/components/ui/TimezoneOverlap';
import styles from './PlaceReadout.module.scss';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The branch's local time and whether the office is open right now, from the
 * shared minute ticker. The server has no clock, so the first paint shows the
 * fixed UTC offset in the same box; the clock takes over after hydration with
 * no layout shift. Not a live region: a clock that announces itself every
 * minute is noise.
 */
export default function LocalTime({ timeZone, utcLabel }: { timeZone: string; utcLabel: string }) {
  const minute = useMinute();
  const t = minute !== 0 ? zoneTime(minute * 60_000, timeZone) : null;
  const open = t ? isOfficeOpen(t) : null;
  const weekend = t ? t.weekday === 0 || t.weekday === 6 : false;

  return (
    <>
      <p className={styles.clock}>
        {t ? <time dateTime={t.hhmm}>{t.hhmm}</time> : <span>{utcLabel}</span>}
      </p>
      <p className={styles.status} data-open={open ? 'true' : 'false'}>
        <span className={styles.dot} aria-hidden="true" />
        {open === null
          ? `Office hours ${pad(WORK_START)}:00–${pad(WORK_END)}:00, Monday to Friday`
          : open
            ? 'Open now'
            : weekend
              ? 'Closed for the weekend'
              : 'Closed now'}
      </p>
    </>
  );
}
