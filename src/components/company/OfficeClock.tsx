'use client';

import { WORK_END, WORK_START, isOfficeOpen, useMinute, zoneTime } from '@/components/ui/officeTime';
import { nextStateWords, timeWords } from './timeWords';
import styles from './OfficeClock.module.scss';

/**
 * "Toronto office · 5:22 pm · Open now" beside a country heading on paper: the
 * office's live local time, whether it is in office hours and, on a line of
 * its own, when that changes ("Back at 9 am"; `dateTime` keeps the 24-hour
 * value). The server has no clock, so it renders the city and, on that second
 * line, the office hours: the box is two lines either way, and hydration
 * causes no layout shift. Not a live region: a clock that announces itself
 * every minute is noise.
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
      <span className="visually-hidden">, </span>
      <span className={styles.next}>
        {t ? nextStateWords(t, open, WORK_START, WORK_END) : `${timeWords(WORK_START)} to ${timeWords(WORK_END)}, Monday to Friday`}
      </span>
    </p>
  );
}
