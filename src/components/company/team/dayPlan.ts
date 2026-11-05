import { WORK_END, WORK_START, isOfficeOpen, zoneTime } from '@/components/ui/officeTime';
import { timeWords } from '../timeWords';

/**
 * The arithmetic behind "Our hours, in your day" (DayPlanner): the three
 * offices' published working day (9 am to 6 pm local, Monday to Friday, from
 * ui/officeTime) laid over one real day in the visitor's time zone. Nothing
 * here is a claim: every span is read off the clock, in 15-minute steps, from
 * the offices' own zones on that date, so daylight saving time, half-hour
 * zones and a Monday that is still Sunday in Toronto all come out right.
 * Pure and client-safe; dayPlan.spec.ts pins the results.
 */

export const DAY_MINUTES = 1440;
export const STEP_MINUTES = 15;
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** The visitor's 9 to 6, in minutes from midnight: the same working day the offices keep. */
export const YOUR_DAY = { from: WORK_START * 60, to: WORK_END * 60 } as const;

/** Minutes from the start of the shown day: [from, to). */
export interface Span {
  from: number;
  to: number;
}

/** The instant of 00:00 on the local day that contains `ms` in `timeZone`. */
export function localMidnight(ms: number, timeZone: string): number {
  const floored = Math.floor(ms / MINUTE_MS) * MINUTE_MS;
  const t = zoneTime(floored, timeZone);
  let midnight = floored - (t.hour * 60 + t.minute) * MINUTE_MS;
  // The clocks changed since midnight (a daylight saving day): one correction.
  const check = zoneTime(midnight, timeZone);
  const off = check.hour * 60 + check.minute;
  if (off !== 0) midnight -= (off > 720 ? off - DAY_MINUTES : off) * MINUTE_MS;
  return midnight;
}

export interface PlanDay {
  /** The instant the shown day starts (local midnight in the visitor's zone). */
  start: number;
  /** False when it is the weekend where the visitor is, and the plan shows their Monday. */
  today: boolean;
}

/** The day the plan shows: the visitor's today, or their next Monday at the weekend. */
export function planDay(nowMs: number, timeZone: string): PlanDay {
  const { weekday } = zoneTime(nowMs, timeZone);
  const start = localMidnight(nowMs, timeZone);
  if (weekday >= 1 && weekday <= 5) return { start, today: true };
  const ahead = weekday === 6 ? 2 : 1;
  return { start: localMidnight(start + ahead * DAY_MS + 12 * HOUR_MS, timeZone), today: false };
}

/** When one office is open during the shown day, as spans of the visitor's clock. */
export function openSpans(dayStart: number, officeZone: string): Span[] {
  const spans: Span[] = [];
  for (let m = 0; m < DAY_MINUTES; m += STEP_MINUTES) {
    if (!isOfficeOpen(zoneTime(dayStart + m * MINUTE_MS, officeZone))) continue;
    const last = spans[spans.length - 1];
    if (last && last.to === m) last.to = m + STEP_MINUTES;
    else spans.push({ from: m, to: m + STEP_MINUTES });
  }
  return spans;
}

/** Overlapping or touching spans joined, in order. */
export function mergeSpans(spans: readonly Span[]): Span[] {
  const sorted = [...spans].sort((a, b) => a.from - b.from);
  const out: Span[] = [];
  for (const span of sorted) {
    const last = out[out.length - 1];
    if (last && span.from <= last.to) last.to = Math.max(last.to, span.to);
    else out.push({ ...span });
  }
  return out;
}

/** Minutes of `spans` inside [from, to). */
export function overlapMinutes(spans: readonly Span[], from: number, to: number): number {
  return mergeSpans(spans).reduce((sum, span) => sum + Math.max(0, Math.min(span.to, to) - Math.max(span.from, from)), 0);
}

/** A minute of the shown day as people say it: "2 pm", "4:30 pm"; the day's end (1440) is "12 am". */
export function minuteWords(m: number): string {
  const hour = Math.floor(m / 60) % 24;
  const minute = m % 60;
  return minute ? timeWords(hour, minute) : timeWords(hour);
}

/** "2 pm to 11 pm", "12 am to 4 am and 7 pm to 12 am"; empty when there are none. */
export function spanWords(spans: readonly Span[]): string {
  return spans.map((span) => `${minuteWords(span.from)} to ${minuteWords(span.to)}`).join(' and ');
}

/** Hours as a figure: "9", "4.5", "1.25". */
export function hoursFigure(minutes: number): string {
  return String(Math.round((minutes / 60) * 100) / 100);
}

/** "London" from "Europe/London", "Buenos Aires" from "America/Argentina/Buenos_Aires". */
export function cityOf(timeZone: string): string {
  return (timeZone.split('/').pop() ?? timeZone).replace(/_/g, ' ');
}

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export interface OfficeMoment {
  /** "4:15 pm", "4 pm" */
  time: string;
  /** 24-hour value for <time dateTime>. */
  hhmm: string;
  open: boolean;
  /** The office's weekday where it differs from the visitor's ("Wednesday"), else null. */
  otherDay: string | null;
}

/** One office at one instant: its local time, whether it is open, and its day if that is not the visitor's. */
export function officeAt(ms: number, officeZone: string, visitorZone: string): OfficeMoment {
  const t = zoneTime(ms, officeZone);
  const yours = zoneTime(ms, visitorZone).weekday;
  return {
    time: t.minute ? timeWords(t.hour, t.minute) : timeWords(t.hour),
    hhmm: t.hhmm,
    open: isOfficeOpen(t),
    otherDay: t.weekday === yours ? null : WEEKDAY_NAMES[t.weekday],
  };
}

const dateFormats = new Map<string, Intl.DateTimeFormat>();

/** "Thursday, November 5": the shown day, in the visitor's zone. */
export function dayWords(dayStart: number, timeZone: string): string {
  let format = dateFormats.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', month: 'long', day: 'numeric' });
    dateFormats.set(timeZone, format);
  }
  return format.format(new Date(dayStart + 12 * HOUR_MS));
}
