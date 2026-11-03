'use client';

import { WORK_END, WORK_START, isOfficeOpen, useMinute, zoneTime } from '@/components/ui/officeTime';
import { nextStateWords, timeWords } from './timeWords';
import styles from './OfficeList.module.scss';

/**
 * One office's local time, whether it is open right now and when that
 * changes ("Until 6 pm", "Back at 9 am"), from the shared minute ticker. The
 * server has no clock, so the first paint shows the office hours in the same
 * three lines; the clock takes over after hydration with no layout shift.
 * Times read as people say them ("9 am to 6 pm", "5:22 pm"); `dateTime`
 * keeps the 24-hour value. Not a live region: a clock that announces itself
 * every minute is noise.
 */
export default function OfficeNow({ timeZone }: { timeZone: string }) {
  const minute = useMinute();
  const t = minute !== 0 ? zoneTime(minute * 60_000, timeZone) : null;
  const open = t ? isOfficeOpen(t) : null;
  const weekend = t ? t.weekday === 0 || t.weekday === 6 : false;

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
        {open === null ? 'Monday to Friday' : open ? 'Open now' : weekend ? 'Closed for the weekend' : 'Closed now'}
      </p>
      <p className={styles.next}>{t ? nextStateWords(t, Boolean(open), WORK_START, WORK_END) : 'Local time'}</p>
    </div>
  );
}
