'use client';

import { isOfficeOpen, useMinute, zoneTime } from '@/components/ui/TimezoneOverlap';
import styles from './TeamDirectory.module.scss';

/**
 * "Toronto office, 17:22" beside a country heading: the office's live local
 * time, with an open/closed dot. The server renders the city alone in the same
 * box (no clock on the server), so hydration causes no layout shift.
 */
export default function OfficeClock({ city, timeZone }: { city: string; timeZone: string }) {
  const minute = useMinute();
  const t = minute !== 0 ? zoneTime(minute * 60_000, timeZone) : null;
  const open = t ? isOfficeOpen(t) : false;
  return (
    <span className={styles.clock} data-open={open ? 'true' : 'false'}>
      {city} office
      {t ? (
        <>
          {', '}
          <time dateTime={t.hhmm} className={styles.clockTime}>
            {t.hhmm}
          </time>
          <span className="visually-hidden">{open ? ', open now' : ', closed now'}</span>
          <span className={styles.clockDot} aria-hidden="true" />
        </>
      ) : null}
    </span>
  );
}
