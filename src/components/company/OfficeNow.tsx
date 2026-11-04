'use client';

import { WORK_END, WORK_START, isOfficeOpen, useMinute, zoneTime } from '@/components/ui/officeTime';
import OfficeStatus from './OfficeStatus';
import { timeWords } from './timeWords';
import styles from './OfficeList.module.scss';

/**
 * One office's local time and, on the line under it, whether it is open and
 * when that changes ("Open until 6 pm", "Closed · opens at 9 am"), from the
 * shared minute ticker. The server has no clock, so the first paint shows
 * the office hours in the same two lines; the clock takes over after
 * hydration. Times read as people say them ("9 am to 6 pm", "5:22 pm");
 * `dateTime` keeps the 24-hour value. Not a live region: a clock that
 * announces itself every minute is noise.
 */
export default function OfficeNow({ timeZone }: { timeZone: string }) {
  const minute = useMinute();
  const t = minute !== 0 ? zoneTime(minute * 60_000, timeZone) : null;
  const open = t ? isOfficeOpen(t) : false;

  return (
    <div className={styles.now} data-open={open ? 'true' : 'false'}>
      <p className={styles.time}>
        {t ? (
          <>
            <span className="visually-hidden">Local time </span>
            <time dateTime={t.hhmm}>{timeWords(t.hour, t.minute)}</time>
          </>
        ) : (
          <span>{`${timeWords(WORK_START)} to ${timeWords(WORK_END)}`}</span>
        )}
      </p>
      <p className={styles.status}>
        <span className={styles.dot} aria-hidden="true" />
        <span>{t ? <OfficeStatus t={t} open={open} /> : 'Monday to Friday'}</span>
      </p>
    </div>
  );
}
