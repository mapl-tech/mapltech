import { useSyncExternalStore } from 'react';

/**
 * Office time helpers for the live local times on /about-us, the team page and
 * the country pages: the shared working day, a minute ticker every clock reads
 * (aligned to the minute, paused while the tab is hidden; 0 on the server, so
 * hydration matches) and wall-clock time in a given IANA zone.
 */

export const WORK_START = 9;
export const WORK_END = 18;

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
