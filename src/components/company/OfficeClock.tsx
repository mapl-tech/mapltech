'use client';

import { isOfficeOpen, useMinute, zoneTime } from '@/components/ui/officeTime';
import { timeWords } from './timeWords';
import styles from './OfficeClock.module.scss';

/**
 * "Toronto office · 5:22 pm · Open now" beside a country heading on paper: the
 * office's live local time and whether it is in office hours (`dateTime`
 * keeps the 24-hour value). The server renders the city alone in the same box
 * (no clock on the server), so hydration causes no layout shift. Not a live
 * region: a clock that announces itself every minute is noise.
 */
export default function OfficeClock({ city, timeZone }: { city: string; timeZone: string }) {
  const minute = useMinute();
  const t = minute !== 0 ? zoneTime(minute * 60_000, timeZone) : null;
  const open = t ? isOfficeOpen(t) : false;
  return (
    <p className={styles.clock} data-open={open ? 'true' : 'false'}>
      <span>{city} office</span>
      {t ? (
        <>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <time dateTime={t.hhmm} className={styles.time}>
            {timeWords(t.hour, t.minute)}
          </time>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <span className={styles.status}>
            <span className={styles.dot} aria-hidden="true" />
            {open ? 'Open now' : 'Closed now'}
          </span>
        </>
      ) : null}
    </p>
  );
}
