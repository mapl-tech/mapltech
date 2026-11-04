'use client';

import { WORK_END, WORK_START, isOfficeOpen, useMinute, zoneTime } from '@/components/ui/officeTime';
import OfficeStatus from './OfficeStatus';
import { timeWords } from './timeWords';
import styles from './PlaceReadout.module.scss';

/**
 * The branch's local time and, on one line under it, whether the office is
 * open and when that changes ("Closed · opens at 9 am": the published hours,
 * never a reply time), from the shared minute ticker. The card's city line
 * names the place and its zone line the zone, so the times need no zone
 * after them. The server has no clock, so the first paint (and a page
 * without JavaScript) shows the zone's abbreviation ("WAT") and the office
 * hours in the same two lines; the clock takes over after hydration. Times
 * read as people say them ("5:22 pm"); `dateTime` keeps the 24-hour value.
 * Not a live region: a clock that announces itself every minute is noise.
 */
export default function LocalTime({ timeZone, zoneAbbr }: { timeZone: string; zoneAbbr: string }) {
  const minute = useMinute();
  const t = minute !== 0 ? zoneTime(minute * 60_000, timeZone) : null;
  const open = t ? isOfficeOpen(t) : false;

  return (
    <>
      <p className={styles.clock}>
        {t ? <time dateTime={t.hhmm}>{timeWords(t.hour, t.minute)}</time> : <span>{zoneAbbr}</span>}
      </p>
      <p className={styles.status} data-open={open ? 'true' : 'false'}>
        <span className={styles.dot} aria-hidden="true" />
        <span>{t ? <OfficeStatus t={t} open={open} /> : `Office hours ${timeWords(WORK_START)} to ${timeWords(WORK_END)}`}</span>
      </p>
    </>
  );
}
