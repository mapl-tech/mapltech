'use client';

import { OFFICES } from '@/components/company/team/offices';
import { DAY_MINUTES, YOUR_DAY, mergeSpans, officeAt, openSpans, planDay, spanWords } from '@/components/company/team/dayPlan';
import { timeWords } from '@/components/company/timeWords';
import { WORK_END, WORK_START, useMinute } from '@/components/ui/officeTime';
import styles from './Proof.module.scss';

const pct = (minutes: number) => `${(minutes / DAY_MINUTES) * 100}%`;

/**
 * The proof wall's hours: each office's local time and whether it is open,
 * over a 24-hour track of the visitor's own day, with the visitor's 9 to 6
 * shaded crimson, the office's working day as a bar (teal while it is open)
 * and a tick at the visitor's "now". Stacked, the three tracks show the
 * overlap at a glance, at any hour: at the weekend they show the visitor's
 * Monday. The arithmetic is the team page's day planner (company/team/
 * dayPlan.ts: each office's published 9 am to 6 pm, Monday to Friday, read
 * off its own clock in 15-minute steps, so daylight saving time comes out
 * right), and each office's time and hours are worded by the same helpers
 * as the team page's planner (officeAt, spanWords), so the two never differ.
 * The server has no clock and no visitor zone, so the first paint shows the
 * published working day and empty tracks of the same size; the live view
 * takes over after hydration. Screen readers get each office's hours in the
 * visitor's time as words, or "closed all day" (an office can have none in
 * a visitor's day: Toronto on a Monday in Sydney). Not a live region.
 */
export default function WallClocks({ cities }: { cities: readonly string[] }) {
  const minute = useMinute();
  const offices = cities.flatMap((city) => OFFICES.filter((office) => office.city === city));
  const now = minute !== 0 ? minute * 60_000 : null;
  const zone = now !== null ? Intl.DateTimeFormat().resolvedOptions().timeZone : null;
  const day = now !== null && zone ? planDay(now, zone) : null;
  const nowAt = day?.today && now !== null ? Math.floor((now - day.start) / 60_000) : null;

  return (
    <div className={styles.overlap}>
      <p className={styles.overlapLabel}>
        {day ? `${day.today ? 'Today' : 'Monday'}, in your time` : `${timeWords(WORK_START)} to ${timeWords(WORK_END)} local, Monday to Friday`}
      </p>
      <ul className={styles.clocks} role="list">
        {offices.map((office) => {
          const at = now !== null && zone ? officeAt(now, office.timeZone, zone) : null;
          const spans = day ? mergeSpans(openSpans(day.start, office.timeZone)) : [];
          return (
            <li key={office.city} className={styles.clock} data-open={at?.open ? 'true' : 'false'}>
              <span className={styles.city}>{office.city}</span>{' '}
              <span className={styles.time}>
                {at ? (
                  <>
                    <span className="visually-hidden">local time </span>
                    <time dateTime={at.hhmm}>{at.time}</time>
                    <span className="visually-hidden">
                      {at.otherDay ? `, ${at.otherDay}` : ''}
                      {at.open ? ', open' : ', closed'}
                    </span>
                  </>
                ) : null}
                <span className={styles.dot} aria-hidden="true" />
              </span>{' '}
              <span className={styles.track} aria-hidden="true">
                {day ? (
                  <>
                    <span className={styles.yours} style={{ left: pct(YOUR_DAY.from), width: pct(YOUR_DAY.to - YOUR_DAY.from) }} />
                    {spans.map((span) => (
                      <span key={span.from} className={styles.theirs} style={{ left: pct(span.from), width: pct(span.to - span.from) }} />
                    ))}
                    {nowAt !== null ? <span className={styles.now} style={{ left: pct(nowAt) }} /> : null}
                  </>
                ) : null}
              </span>
              {day ? (
                <span className="visually-hidden">
                  {spans.length ? `, works ${spanWords(spans)} your time` : ', closed all day your time'}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className={styles.axis} aria-hidden="true">
        <span style={{ left: pct(6 * 60) }}>{timeWords(6)}</span>
        <span style={{ left: pct(12 * 60) }}>{timeWords(12)}</span>
        <span style={{ left: pct(18 * 60) }}>{timeWords(18)}</span>
      </p>
      {/* The key, for the eye (each office's hours are already words for screen readers). */}
      <p className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span className={styles.key} data-key="yours" />
          Your 9 to 6
        </span>
        <span className={styles.legendItem}>
          <span className={styles.key} data-key="theirs" />
          Our office’s 9 to 6
        </span>
      </p>
    </div>
  );
}
