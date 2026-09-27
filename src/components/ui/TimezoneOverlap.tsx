'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { usePrefersReducedMotion } from './useMediaQuery';
import styles from './TimezoneOverlap.module.scss';

/**
 * Interaction #10: live clocks and the working-hours overlap strip.
 *
 * - `TimezoneOverlap`: three office clocks + a 24h strip (in the visitor's local
 *   day) with each office's 09:00-18:00 window, the visitor's window and the
 *   teal overlap band. Mobile: stacked pills + the overlap as text.
 * - `LiveClocks`: compact "CITY HH:MM" pills for heroes and footers.
 *
 * One shared minute ticker (aligned to the minute, paused while the tab is
 * hidden) drives every instance. SSR renders placeholder text in the same
 * boxes, so hydration causes no layout shift.
 */

export interface Office {
  city: string;
  country: string;
  timeZone: string;
}

export const OFFICES: readonly Office[] = [
  { city: 'Toronto', country: 'Canada', timeZone: 'America/Toronto' },
  { city: 'Lagos', country: 'Nigeria', timeZone: 'Africa/Lagos' },
  { city: 'Kingston', country: 'Jamaica', timeZone: 'America/Jamaica' },
];

export const WORK_START = 9;
export const WORK_END = 18;
export const PLACEHOLDER = 'Toronto · Lagos · Kingston';

// ---------------------------------------------------------------------------
// Minute ticker (module singleton)
// ---------------------------------------------------------------------------

const MINUTE = 60_000;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function scheduleNextMinute() {
  clearTimer();
  const delay = MINUTE - (Date.now() % MINUTE) + 20;
  timer = setTimeout(() => {
    notify();
    scheduleNextMinute();
  }, delay);
}

function onVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    clearTimer();
  } else {
    notify();
    scheduleNextMinute();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    scheduleNextMinute();
    document.addEventListener('visibilitychange', onVisibilityChange);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  };
}

const getMinute = () => Math.floor(Date.now() / MINUTE);
const getServerMinute = () => 0;

/** Current minute index, or 0 on the server and during hydration. */
export function useMinute(): number {
  return useSyncExternalStore(subscribe, getMinute, getServerMinute);
}

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let dtf = formatters.get(timeZone);
  if (!dtf) {
    dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(timeZone, dtf);
  }
  return dtf;
}

export function safeTimeZone(timeZone: string | undefined, fallback = 'UTC'): string {
  if (!timeZone) return fallback;
  try {
    formatterFor(timeZone);
    return timeZone;
  } catch {
    return fallback;
  }
}

export interface ZoneTime {
  hour: number;
  minute: number;
  /** 0 = Sunday ... 6 = Saturday */
  weekday: number;
  /** Zone offset from UTC in minutes at this instant (Toronto in summer: -240). */
  offsetMinutes: number;
  hhmm: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function zoneTime(ms: number, timeZone: string): ZoneTime {
  const parts = formatterFor(timeZone).formatToParts(new Date(ms));
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  const year = Number(read('year'));
  const month = Number(read('month'));
  const day = Number(read('day'));
  const hour = Number(read('hour')) % 24;
  const minute = Number(read('minute'));
  const second = Number(read('second'));
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const offsetMinutes = Math.round((wallClockAsUtc - Math.floor(ms / 1000) * 1000) / MINUTE);
  return {
    hour,
    minute,
    weekday: WEEKDAYS.indexOf(read('weekday').slice(0, 3)),
    offsetMinutes,
    hhmm: `${pad(hour)}:${pad(minute)}`,
  };
}

export function isOfficeOpen(t: ZoneTime): boolean {
  return t.weekday >= 1 && t.weekday <= 5 && t.hour >= WORK_START && t.hour < WORK_END;
}

/** Hours on a 0-24 scale of the visitor's local day. */
export interface Segment {
  start: number;
  end: number;
}

const VISITOR_WINDOW: Segment = { start: WORK_START, end: WORK_END };

/** An office's 09:00-18:00 window expressed in the visitor's local hours. */
export function shiftedWindow(officeOffsetMinutes: number, visitorOffsetMinutes: number): Segment[] {
  const shift = (visitorOffsetMinutes - officeOffsetMinutes) / 60;
  const start = (((WORK_START + shift) % 24) + 24) % 24;
  const end = start + (WORK_END - WORK_START);
  return end <= 24 ? [{ start, end }] : [{ start, end: 24 }, { start: 0, end: end - 24 }];
}

function intersect(segments: Segment[], window: Segment): Segment[] {
  const out: Segment[] = [];
  for (const s of segments) {
    const start = Math.max(s.start, window.start);
    const end = Math.min(s.end, window.end);
    if (end > start) out.push({ start, end });
  }
  return out;
}

function merge(segments: Segment[]): Segment[] {
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start <= last.end) last.end = Math.max(last.end, s.end);
    else out.push({ ...s });
  }
  return out;
}

function hourLabel(h: number): string {
  const whole = Math.floor(h);
  const minutes = Math.round((h - whole) * 60);
  return `${pad(whole % 24)}:${pad(minutes)}`;
}

function zoneLabel(timeZone: string): string {
  const city = timeZone.split('/').pop() ?? timeZone;
  return city.replace(/_/g, ' ');
}

interface OfficeModel {
  office: Office;
  time: ZoneTime;
  open: boolean;
  segments: Segment[];
}

interface OverlapModel {
  offices: OfficeModel[];
  visitor: { zone: string; label: string; time: ZoneTime; nowHour: number };
  overlap: Segment[];
  coveredHours: number;
}

function buildModel(ms: number, visitorZone: string): OverlapModel {
  const visitorTime = zoneTime(ms, visitorZone);
  const offices = OFFICES.map((office) => {
    const time = zoneTime(ms, office.timeZone);
    return {
      office,
      time,
      open: isOfficeOpen(time),
      segments: shiftedWindow(time.offsetMinutes, visitorTime.offsetMinutes),
    };
  });
  const overlap = merge(offices.flatMap((o) => intersect(o.segments, VISITOR_WINDOW)));
  const coveredHours = overlap.reduce((sum, s) => sum + (s.end - s.start), 0);
  return {
    offices,
    visitor: {
      zone: visitorZone,
      label: zoneLabel(visitorZone),
      time: visitorTime,
      nowHour: visitorTime.hour + visitorTime.minute / 60,
    },
    overlap,
    coveredHours,
  };
}

// ---------------------------------------------------------------------------
// Presentational pieces
// ---------------------------------------------------------------------------

function Digits({ text, flip }: { text: string; flip: boolean }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span key={flip ? `${i}-${ch}` : i} className={flip ? 'clock-digit' : undefined}>
          {ch}
        </span>
      ))}
    </>
  );
}

function Clock({ hhmm, flip, className }: { hhmm: string; flip: boolean; className?: string }) {
  return (
    <time className={className} dateTime={hhmm} aria-label={hhmm}>
      <span aria-hidden="true">
        <Digits text={hhmm} flip={flip} />
      </span>
    </time>
  );
}

const pct = (h: number) => `${(h / 24) * 100}%`;

function Bar({ segments, kind, overlap, nowHour }: { segments: Segment[]; kind: 'office' | 'visitor'; overlap?: Segment[]; nowHour?: number }) {
  return (
    <div className={styles.bar} data-kind={kind}>
      {segments.map((s, i) => (
        <span key={i} className={styles.seg} style={{ left: pct(s.start), width: pct(s.end - s.start) }} />
      ))}
      {overlap?.map((s, i) => (
        <span key={`o-${i}`} className={styles.overlap} style={{ left: pct(s.start), width: pct(s.end - s.start) }} />
      ))}
      {nowHour !== undefined ? <span className={styles.now} style={{ left: pct(nowHour) }} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export interface TimezoneOverlapProps {
  /** IANA zone to compare against; defaults to the visitor's browser zone. */
  visitorZone?: string;
  className?: string;
}

export default function TimezoneOverlap({ visitorZone, className = '' }: TimezoneOverlapProps) {
  const minute = useMinute();
  const reduceMotion = usePrefersReducedMotion();
  const live = minute !== 0;
  const flip = live && !reduceMotion;

  const zone = live ? safeTimeZone(visitorZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone) : 'UTC';
  const model = useMemo(() => (live ? buildModel(minute * MINUTE, zone) : null), [live, minute, zone]);

  const overlapText = model
    ? model.overlap.length
      ? model.overlap.map((s) => `${hourLabel(s.start)}–${hourLabel(s.end)}`).join(', ')
      : 'none'
    : null;

  return (
    <section className={`${styles.root} ${className}`.trim()} aria-label="Working hours overlap" data-live={live ? 'true' : 'false'}>
      <div className={styles.clocks}>
        {model ? (
          model.offices.map(({ office, time, open }) => (
            <div key={office.timeZone} className={styles.pill} data-open={open ? 'true' : 'false'}>
              <span className={styles.city}>{office.city}</span>
              <Clock hhmm={time.hhmm} flip={flip} className={styles.time} />
              <span className={styles.status}>
                <span className={styles.dot} aria-hidden="true" />
                {open ? 'Open' : 'Closed'}
              </span>
            </div>
          ))
        ) : (
          <p className={styles.placeholder}>{PLACEHOLDER}</p>
        )}
      </div>

      <div className={styles.strip} aria-hidden="true">
        {model ? (
          <>
            {model.offices.map(({ office, segments }) => (
              <div key={office.timeZone} className={styles.row} data-kind="office">
                <span className={styles.rowLabel}>{office.city}</span>
                <Bar segments={segments} kind="office" />
              </div>
            ))}
            <div className={styles.row} data-kind="visitor">
              <span className={styles.rowLabel}>You · {model.visitor.label}</span>
              <Bar segments={[VISITOR_WINDOW]} kind="visitor" overlap={model.overlap} nowHour={model.visitor.nowHour} />
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel} />
              <ol className={styles.axis}>
                {[0, 6, 12, 18, 24].map((h) => (
                  <li key={h} style={{ left: pct(h) }}>
                    {pad(h % 24)}
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : null}
      </div>

      {model ? (
        <p className={styles.overlapText}>
          {model.coveredHours > 0
            ? `${model.coveredHours % 1 === 0 ? model.coveredHours : model.coveredHours.toFixed(1)}h of your 09:00–18:00 day has an office open: ${overlapText} (${model.visitor.label} time).`
            : 'No office is open during your 09:00–18:00 day; we hand off asynchronously.'}
        </p>
      ) : null}

      <p className={styles.caption}>
        Office hours 09:00–18:00 local, Monday to Friday. Teal marks the hours of your working day with at least one
        MAPL TECH office open.
      </p>
    </section>
  );
}

export interface LiveClocksProps {
  className?: string;
}

/** Compact "CITY HH:MM" pills for heroes and footers. Teal dot = open now. */
export function LiveClocks({ className = '' }: LiveClocksProps) {
  const minute = useMinute();
  const reduceMotion = usePrefersReducedMotion();
  const live = minute !== 0;
  const flip = live && !reduceMotion;

  return (
    <ul className={`${styles.compact} ${className}`.trim()} aria-label="Office local times">
      {OFFICES.map((office) => {
        const time = live ? zoneTime(minute * MINUTE, office.timeZone) : null;
        const open = time ? isOfficeOpen(time) : false;
        return (
          <li key={office.timeZone} className={styles.compactPill} data-open={open ? 'true' : 'false'}>
            <span className={styles.compactCity}>{office.city}</span>
            {time ? (
              <Clock hhmm={time.hhmm} flip={flip} className={styles.compactTime} />
            ) : (
              <span className={styles.compactTime} aria-hidden="true">
                --:--
              </span>
            )}
            {open ? <span className={styles.dot} aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ul>
  );
}
