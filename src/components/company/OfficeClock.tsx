'use client';

import { WORK_END, WORK_START, isOfficeOpen, useMinute, zoneTime } from '@/components/ui/officeTime';
import OfficeStatus from './OfficeStatus';
import { timeWords } from './timeWords';
import styles from './OfficeClock.module.scss';

/**
 * "Toronto office · 5:22 pm" beside a country heading on paper, and on a line
 * of its own whether the office is open and when that changes ("Closed ·
 * opens tomorrow at 9 am"; `dateTime` keeps the 24-hour value). The server
 * has no clock, so it renders the city and, on that second line, the office
 * hours: the box is two lines either way, and hydration causes no layout
 * shift. Not a live region: a clock that announces itself every minute is
 * noise.
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
        </>
      ) : null}
      <span className="visually-hidden">, </span>
      <span className={styles.status}>
        <span className={styles.dot} aria-hidden="true" />
        <span>{t ? <OfficeStatus t={t} open={open} /> : `${timeWords(WORK_START)} to ${timeWords(WORK_END)}, Monday to Friday`}</span>
      </span>
    </p>
  );
}
