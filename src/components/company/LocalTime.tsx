'use client';

import { WORK_END, WORK_START, isOfficeOpen, useMinute, zoneTime } from '@/components/ui/officeTime';
import { nextStateWords, timeWords } from './timeWords';
import styles from './PlaceReadout.module.scss';

/**
 * The branch's local time, whether the office is open right now and when
 * that changes ("Back at 9 am WAT": the published hours, never a reply time),
 * from the shared minute ticker. The server has no clock, so the first paint
 * (and a page without JavaScript) shows the zone's abbreviation ("WAT") and
 * the office hours in the same three lines; the card's zone line under them
 * spells the zone and its UTC offset out once. The clock takes over after
 * hydration with no layout shift. Times read as people say them ("5:22 pm");
 * `dateTime` keeps the 24-hour value. Not a live region: a clock that
 * announces itself every minute is noise.
 */
export default function LocalTime({ timeZone, zoneAbbr }: { timeZone: string; zoneAbbr: string }) {
  const minute = useMinute();
  const t = minute !== 0 ? zoneTime(minute * 60_000, timeZone) : null;
  const open = t ? isOfficeOpen(t) : null;
  const weekend = t ? t.weekday === 0 || t.weekday === 6 : false;

  return (
    <>
      <p className={styles.clock}>
        {t ? <time dateTime={t.hhmm}>{timeWords(t.hour, t.minute)}</time> : <span>{zoneAbbr}</span>}
      </p>
      <p className={styles.status} data-open={open ? 'true' : 'false'}>
        <span className={styles.dot} aria-hidden="true" />
        {open === null
          ? `Office hours ${timeWords(WORK_START)} to ${timeWords(WORK_END)}`
          : open
            ? 'Open now'
            : weekend
              ? 'Closed for the weekend'
              : 'Closed now'}
      </p>
      <p className={styles.next}>{t ? nextStateWords(t, Boolean(open), WORK_START, WORK_END, zoneAbbr) : 'Monday to Friday'}</p>
    </>
  );
}
