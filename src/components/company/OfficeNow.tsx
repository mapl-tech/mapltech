'use client';

import { WORK_END, WORK_START, isOfficeOpen, useMinute, zoneTime } from '@/components/ui/officeTime';
import styles from './OfficeList.module.scss';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * One office's local time and whether it is open right now, from the shared
 * minute ticker. The server has no clock, so the first paint shows the
 * office hours in the same box; the clock takes over after hydration with no
 * layout shift. Not a live region: a clock that announces itself every
 * minute is noise.
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
            <time dateTime={t.hhmm}>{t.hhmm}</time>
          </>
        ) : (
          <span>{`${pad(WORK_START)}:00–${pad(WORK_END)}:00`}</span>
        )}
      </p>
      <p className={styles.status}>
        <span className={styles.dot} aria-hidden="true" />
        {open === null ? 'Monday to Friday' : open ? 'Open now' : weekend ? 'Closed for the weekend' : 'Closed now'}
      </p>
    </div>
  );
}
