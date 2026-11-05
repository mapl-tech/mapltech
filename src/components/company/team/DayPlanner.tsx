'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from 'react';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import Arrow from '@/components/ui/Arrow';
import { useMinute } from '@/components/ui/officeTime';
import {
  DAY_MINUTES,
  STEP_MINUTES,
  YOUR_DAY,
  cityOf,
  dayWords,
  hoursFigure,
  localMidnight,
  mergeSpans,
  minuteWords,
  officeAt,
  openSpans,
  overlapMinutes,
  planDay,
  spanWords,
} from './dayPlan';
import { OFFICES } from './offices';
import styles from './WorkingHours.module.scss';

/**
 * "Our hours, in your day": the three offices' published working day (9 am
 * to 6 pm local, Monday to Friday) drawn on one real day of the visitor's own
 * clock, read from the browser's time zone, so every bar is a fact worked out
 * on the spot, not a claim. A line marks now; drag it (or use the arrow keys
 * on the slider it stands for) and each office's local time and whether it is
 * open follow it. Above the plot, how many hours of the visitor's 9 to 6 have
 * an office open, and the span the three offices cover between them. The
 * select shows the same day for another city (a client's, say).
 *
 * The server knows neither the visitor's zone nor the time, so it renders the
 * frame (rows, axis, the offices' local hours) and the bars at zero width;
 * the client fills them in after hydration. Bars move by transform only, and
 * only when motion is allowed. Nothing ticks faster than once a minute (the
 * shared ticker in ui/officeTime), and nothing is a live region: the slider's
 * value text says it all when the visitor asks.
 */

const ZONES: readonly { zone: string; label: string }[] = [
  { zone: 'America/Vancouver', label: 'Vancouver' },
  { zone: 'America/Los_Angeles', label: 'Los Angeles' },
  { zone: 'America/Chicago', label: 'Chicago' },
  { zone: 'America/New_York', label: 'New York' },
  { zone: 'America/Toronto', label: 'Toronto' },
  { zone: 'America/Jamaica', label: 'Kingston' },
  { zone: 'Europe/London', label: 'London' },
  { zone: 'Africa/Lagos', label: 'Lagos' },
  { zone: 'Europe/Berlin', label: 'Berlin' },
  { zone: 'Africa/Johannesburg', label: 'Johannesburg' },
  { zone: 'Asia/Dubai', label: 'Dubai' },
  { zone: 'Asia/Kolkata', label: 'Mumbai' },
  { zone: 'Asia/Singapore', label: 'Singapore' },
  { zone: 'Australia/Sydney', label: 'Sydney' },
];

/** Hour marks on the axis; phones keep every other one (the 6-hour marks). */
const TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

const noSubscribe = () => () => {};
const deviceZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Toronto';
  } catch {
    return 'America/Toronto';
  }
};
const serverZone = () => null;

/** "9 am to 6 pm", its times unbroken. */
const YOUR_DAY_WORDS = `${minuteWords(YOUR_DAY.from)} to ${minuteWords(YOUR_DAY.to)}`;

const snap = (m: number) => Math.min(DAY_MINUTES, Math.max(0, Math.round(m / STEP_MINUTES) * STEP_MINUTES));
const pct = (m: number) => (m / DAY_MINUTES) * 100;

export default function DayPlanner() {
  const minute = useMinute();
  const device = useSyncExternalStore(noSubscribe, deviceZone, serverZone);
  const [choice, setChoice] = useState('');
  const [scrub, setScrub] = useState<number | null>(null);
  // A mouse over the lane previews the time under it; a press pins it (scrub).
  const [hover, setHover] = useState<number | null>(null);
  const laneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const press = useRef<{ id: number; x: number; y: number; dragging: boolean } | null>(null);

  const ready = minute !== 0 && device !== null;
  const zone = choice || device || 'America/Toronto';
  const chosen = ZONES.find((z) => z.zone === choice);
  const yours = !chosen;
  const whose = yours ? 'your time' : `${chosen.label} time`;
  const nowMs = minute * 60_000;

  const day = useMemo(() => (ready ? planDay(nowMs, zone) : null), [ready, nowMs, zone]);
  const dayStart = day?.start ?? 0;
  const rows = useMemo(
    () => OFFICES.map((office) => ({ office, spans: ready ? openSpans(dayStart, office.timeZone) : [] })),
    [ready, dayStart],
  );
  const union = mergeSpans(rows.flatMap((row) => row.spans));
  const covered = overlapMinutes(union, YOUR_DAY.from, YOUR_DAY.to);

  // Where the line stands: now (today), the same time of day on the Monday shown at the
  // weekend, or wherever the visitor put it.
  const nowOnDay = day ? (day.today ? (nowMs - day.start) / 60_000 : (nowMs - localMidnight(nowMs, zone)) / 60_000) : YOUR_DAY.from;
  const atNow = scrub === null;
  // `value` is the slider's (now, or where the visitor pinned the line); `shown` is what the
  // plot and the readouts show, which a mouse over the lane previews.
  const value = Math.min(DAY_MINUTES, Math.max(0, atNow ? Math.floor(nowOnDay) : scrub));
  const shown = hover ?? value;
  const momentsAt = (minutes: number) =>
    rows.map(({ office }) => (ready ? officeAt(dayStart + minutes * 60_000, office.timeZone, zone) : null));
  const moments = momentsAt(shown);

  const valueText = ready
    ? `${minuteWords(value)} ${whose}: ${momentsAt(value)
        .map((m, i) => `${rows[i].office.city} ${m!.time}${m!.otherDay ? ` ${m!.otherDay}` : ''}, ${m!.open ? 'open' : 'closed'}`)
        .join('; ')}`
    : undefined;

  const fromX = (clientX: number) => {
    const rect = laneRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return value;
    return snap(((clientX - rect.left) / rect.width) * DAY_MINUTES);
  };

  // Mouse and pen place the line on press and drag it; touch waits for a sideways drag or a
  // tap, so a vertical swipe that starts on the plot still scrolls the page (touch-action: pan-y).
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!ready || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const touch = e.pointerType === 'touch';
    press.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dragging: !touch };
    if (!touch) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setHover(null);
      setScrub(fromX(e.clientX));
      inputRef.current?.focus({ preventScroll: true });
      e.preventDefault();
    }
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (!p && e.pointerType === 'mouse' && ready) {
      setHover(fromX(e.clientX));
      return;
    }
    if (!p || p.id !== e.pointerId) return;
    if (!p.dragging) {
      const dx = Math.abs(e.clientX - p.x);
      if (dx < 8 || dx < Math.abs(e.clientY - p.y)) return;
      p.dragging = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setScrub(fromX(e.clientX));
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    if (!p.dragging) setScrub(fromX(e.clientX)); // a tap
    press.current = null;
  };
  const onPointerCancel = () => {
    press.current = null;
  };
  const onPointerLeave = () => setHover(null);

  const backToNow = () => {
    setScrub(null);
    inputRef.current?.focus({ preventScroll: true });
  };

  const showNow = Boolean(day?.today);
  const dayLine = day ? `${day.today ? 'Today' : 'Next working day'} · ${dayWords(day.start, zone)}` : 'Office hours';

  return (
    <div className={styles.planner} data-ready={ready ? '' : undefined}>
      <div className={styles.top}>
        <div className={styles.summary}>
          <p className={styles.day}>{dayLine}</p>
          {ready ? (
            <>
              {/* The figure is for the eye; the note under it says the whole sentence to a screen reader. */}
              <p className={styles.stat} aria-hidden="true">
                <span className={styles.figure}>{`${hoursFigure(covered)} of 9`}</span>{' '}
                <span className={styles.unit}>hours</span>
              </p>
              <p className={styles.statNote}>
                <span className="visually-hidden">{`${hoursFigure(covered)} of the 9 hours `}</span>
                {`of ${yours ? 'your' : `a ${chosen.label}`} working day, ${YOUR_DAY_WORDS}, ${covered === 60 ? 'falls' : 'fall'} inside our office hours. `}
                {union.length
                  ? `Between them, our offices are open ${spanWords(union)} ${whose}.`
                  : `None of our offices is open on this day.`}
                {/* Under four hours of overlap, the published way the work keeps moving (the home steps). */}
                {covered < 240 ? ' We join your Slack and your weekly check-ins.' : null}
              </p>
            </>
          ) : (
            <>
              <p className={styles.stat}>
                <span className={styles.figure}>9 to 6</span>{' '}
                <span className={styles.unit}>local</span>
              </p>
              <p className={styles.statNote}>Local time in Toronto, Lagos and Kingston, Monday to Friday.</p>
            </>
          )}
        </div>

        <div className={styles.controls}>
          <label htmlFor="hours-zone" className={styles.controlLabel}>
            Show times for
          </label>
          <span className={styles.selectWrap}>
            <select
              id="hours-zone"
              className={styles.select}
              value={choice}
              onChange={(e) => {
                setChoice(e.target.value);
                setScrub(null);
              }}
            >
              <option value="">{device ? `Your time (${cityOf(device)})` : 'Your time'}</option>
              {ZONES.map((z) => (
                <option key={z.zone} value={z.zone}>
                  {z.label}
                </option>
              ))}
            </select>
            <svg className={styles.chevron} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
              <path d="M4 6.25 8 10.25l4-4" />
            </svg>
          </span>
        </div>
      </div>

      <div className={styles.plot} style={{ '--v': shown / DAY_MINUTES } as CSSProperties}>
        <div className={styles.columns} aria-hidden="true">
          <span>{ready ? `Open, ${whose}` : 'Office hours'}</span>
          <span className={styles.columnsTail}>Local time</span>
        </div>

        <ol className={styles.rows} role="list">
          {rows.map(({ office, spans }, i) => {
            const m = moments[i];
            return (
              <li key={office.city} className={styles.row}>
                <div className={styles.head}>
                  <p className={styles.city}>
                    {office.city}
                    {office.hq ? (
                      <span className={styles.tag}>
                        <span aria-hidden="true">HQ</span>
                        <span className="visually-hidden">, headquarters</span>
                      </span>
                    ) : null}
                  </p>
                  <p className={styles.hours}>
                    {ready ? (spans.length ? `Open ${spanWords(spans)}` : 'Closed all day') : '9 am to 6 pm local time'}
                    {ready ? <span className="visually-hidden">{`, ${whose}`}</span> : null}
                  </p>
                </div>
                <div className={styles.track} aria-hidden="true">
                  {/* Phones: the 9 to 6 and the line drawn in each track (no line across the words). */}
                  <span className={styles.trackDay} />
                  {[0, 1].map((n) => {
                    const span = spans[n];
                    const style = { '--s': span ? pct(span.from) : 0, '--w': span ? pct(span.to - span.from) : 0 } as CSSProperties;
                    return <span key={n} className={styles.bar} style={style} />;
                  })}
                  {ready ? <span className={styles.trackLine} /> : null}
                </div>
                <p className={styles.at}>
                  {m ? (
                    <span>
                      <span className="visually-hidden">Local time at the line: </span>
                      <time dateTime={m.hhmm} className={styles.atTime}>
                        {m.time}
                      </time>
                      {m.otherDay ? <span className={styles.atDay}>{` ${m.otherDay}`}</span> : null}
                      <span className={styles.state} data-open={m.open ? 'true' : 'false'}>
                        <span className={styles.dot} aria-hidden="true" />
                        <span className="visually-hidden">, </span>
                        {m.open ? 'Open' : 'Closed'}
                      </span>
                    </span>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ol>

        <div className={styles.window} aria-hidden="true">
          <span className={styles.bracket} />
          <span className={styles.windowLabel}>{yours ? 'Your 9 to 6' : `${chosen.label} 9 to 6`}</span>
        </div>

        <div className={styles.axis} aria-hidden="true">
          {TICKS.map((h) => (
            <span key={h} className={styles.tick} data-major={h % 6 === 0 ? '' : undefined} style={{ '--at': pct(h * 60) } as CSSProperties}>
              {minuteWords(h * 60)}
            </span>
          ))}
        </div>

        {/* The lane: the timeline's own column, over the rows. Hairlines every three hours and the
            visitor's 9 to 6 behind the bars; the line, its time and the slider in front. */}
        <div className={styles.laneBack} aria-hidden="true">
          {TICKS.slice(1, -1).map((h) => (
            <span key={h} className={styles.grid} style={{ '--at': pct(h * 60) } as CSSProperties} />
          ))}
          <span className={styles.yourDay} style={{ '--s': pct(YOUR_DAY.from), '--w': pct(YOUR_DAY.to - YOUR_DAY.from) } as CSSProperties} />
        </div>

        <div
          ref={laneRef}
          className={styles.lane}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={onPointerLeave}
        >
          <input
            ref={inputRef}
            type="range"
            className={styles.range}
            min={0}
            max={DAY_MINUTES}
            step={STEP_MINUTES}
            value={snap(value)}
            disabled={!ready}
            aria-label={`Time of day, ${whose}`}
            aria-valuetext={valueText}
            onChange={(e) => setScrub(Number(e.target.value))}
          />
          {ready ? (
            <>
              {showNow && (!atNow || hover !== null) ? (
                <span className={styles.nowTick} style={{ '--v': Math.floor(nowOnDay) / DAY_MINUTES } as CSSProperties} />
              ) : null}
              <span className={styles.line} />
              <span className={styles.chipRail}>
                <span className={styles.chip}>
                  {minuteWords(shown)}
                  {showNow && atNow && hover === null ? <span className={styles.chipNow}>{'\u00a0· now'}</span> : null}
                </span>
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className={styles.foot}>
        <p className={styles.hint}>
          <span className={styles.hintFine}>Point along the day to see each office’s time there. Click to keep the line in place, or use the arrow keys.</span>
          <span className={styles.hintTouch}>Tap or drag along the day to see each office’s time there.</span>
        </p>
        <div className={styles.footActions}>
          <button type="button" className={styles.reset} onClick={backToNow} hidden={!showNow || atNow}>
            Back to now
          </button>
          {/* The answer's next step, in words: the filled ask is the directory's, a screen on. */}
          <Link href={PROJECT_HREF} className={styles.next} data-cta-placement="team_hours_project">
            {PROJECT_LABEL}
            <span aria-hidden="true" className={styles.nextArrow}>
              <Arrow />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
