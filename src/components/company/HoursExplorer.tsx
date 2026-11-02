'use client';

import { useId, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import {
  OFFICES,
  WORK_END,
  WORK_START,
  isOfficeOpen,
  safeTimeZone,
  shiftedWindow,
  useMinute,
  zoneTime,
  type Office,
  type Segment,
} from '@/components/ui/TimezoneOverlap';
import forms from '@/components/convert/forms.module.scss';
import styles from './HoursExplorer.module.scss';

/**
 * The company family's one signature interaction: your working day against
 * the office hours of Toronto, Lagos and Kingston.
 *
 * - The axis is the visitor's own day (time zone detected, changeable to any
 *   client city), so the answer is in their hours, not ours.
 * - A scrubber (a native range input: keyboard, touch and screen readers for
 *   free) answers "if we talk at 15:30 my time, who is at their desk?" The
 *   readout below it converts the moment into each office's local time.
 * - The summary states the overlap in words, answer first.
 *
 * Office hours are the published 09:00-18:00 local, Monday to Friday
 * (TimezoneOverlap). The server has no clock and no visitor zone, so the first
 * render is a labelled standard-time view in Toronto time; the live view takes
 * over after hydration. Every number on screen is computed, nothing is faked.
 */

const MINUTE = 60_000;
/** Quarter hours across one day: the slider runs 0..96 (00:00..24:00). */
const STEPS = 96;
const DAY: Segment = { start: WORK_START, end: WORK_END };
const DAY_HOURS = WORK_END - WORK_START;
/** Thumb width in px; the bars are inset by half of it so they line up with the slider's travel. */
const THUMB = 28;

/** Standard-time offsets for the server render: Toronto EST, Lagos WAT, Kingston EST. */
const STANDARD_OFFSETS: Record<string, number> = {
  'America/Toronto': -300,
  'Africa/Lagos': 60,
  'America/Jamaica': -300,
};

interface ZoneOption {
  zone: string;
  label: string;
}

const OFFICE_OPTIONS: readonly ZoneOption[] = OFFICES.map((office) => ({ zone: office.timeZone, label: office.city }));

/** Where agencies and their clients usually are: North America, the Caribbean, Europe, Africa, the Gulf. */
const CITY_OPTIONS: readonly ZoneOption[] = [
  { zone: 'America/Vancouver', label: 'Vancouver' },
  { zone: 'America/Chicago', label: 'Chicago' },
  { zone: 'America/New_York', label: 'New York' },
  { zone: 'America/Port_of_Spain', label: 'Port of Spain' },
  { zone: 'Europe/London', label: 'London' },
  { zone: 'Africa/Accra', label: 'Accra' },
  { zone: 'Africa/Johannesburg', label: 'Johannesburg' },
  { zone: 'Africa/Nairobi', label: 'Nairobi' },
  { zone: 'Asia/Dubai', label: 'Dubai' },
];

const AUTO = 'auto';

/* ------------------------------------------------------------------ */
/* Pure helpers                                                         */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, '0');

/** 13.5 -> "13:30"; 24 stays "24:00" so a range can end at midnight. */
function clock(hours: number): string {
  const total = Math.round(hours * 60);
  const wrapped = total === 1440 ? 1440 : ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

function merge(segments: readonly Segment[]): Segment[] {
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start <= last.end) last.end = Math.max(last.end, s.end);
    else out.push({ ...s });
  }
  return out;
}

function intersect(a: readonly Segment[], b: readonly Segment[]): Segment[] {
  const out: Segment[] = [];
  for (const s of a) {
    for (const t of b) {
      const start = Math.max(s.start, t.start);
      const end = Math.min(s.end, t.end);
      if (end > start) out.push({ start, end });
    }
  }
  return merge(out);
}

const sum = (segments: readonly Segment[]) => segments.reduce((n, s) => n + (s.end - s.start), 0);

function spans(segments: readonly Segment[]): string {
  return segments.map((s) => `${clock(s.start)}–${clock(s.end)}`).join(' and ');
}

function hoursText(n: number): string {
  const v = Math.round(n * 10) / 10;
  return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)} hour${v === 1 ? '' : 's'}`;
}

function utcLabel(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '−' : '+';
  const abs = Math.abs(offsetMinutes);
  const m = abs % 60;
  return `UTC${sign}${Math.floor(abs / 60)}${m ? `:${pad(m)}` : ''}`;
}

function cityOf(zone: string): string {
  const known = [...OFFICE_OPTIONS, ...CITY_OPTIONS].find((option) => option.zone === zone);
  return known?.label ?? (zone.split('/').pop() ?? zone).replace(/_/g, ' ');
}

const pct = (h: number) => `${((h / 24) * 100).toFixed(4)}%`;

/* ------------------------------------------------------------------ */
/* Model                                                                */
/* ------------------------------------------------------------------ */

interface OfficeRow {
  office: Office;
  offset: number;
  /** The office's 09:00-18:00, expressed in the visitor's hours (may wrap past midnight). */
  windows: Segment[];
  /** The part of the visitor's 09:00-18:00 this office covers. */
  overlap: Segment[];
  openNow: boolean | null;
  weekendNow: boolean;
}

interface Model {
  live: boolean;
  zoneLabel: string;
  visitorOffset: number;
  nowHour: number | null;
  rows: OfficeRow[];
  covered: Segment[];
  together: Segment[];
}

function buildModel(nowMs: number | null, zone: string): Model {
  const live = nowMs !== null;
  const visitor = live ? zoneTime(nowMs, zone) : null;
  const visitorOffset = visitor ? visitor.offsetMinutes : STANDARD_OFFSETS['America/Toronto'];
  const rows: OfficeRow[] = OFFICES.map((office) => {
    const t = live ? zoneTime(nowMs, office.timeZone) : null;
    const offset = t ? t.offsetMinutes : (STANDARD_OFFSETS[office.timeZone] ?? 0);
    const windows = shiftedWindow(offset, visitorOffset);
    return {
      office,
      offset,
      windows,
      overlap: intersect(windows, [DAY]),
      openNow: t ? isOfficeOpen(t) : null,
      weekendNow: t ? t.weekday === 0 || t.weekday === 6 : false,
    };
  });
  return {
    live,
    zoneLabel: live ? cityOf(zone) : 'Toronto',
    visitorOffset,
    nowHour: visitor ? visitor.hour + visitor.minute / 60 : null,
    rows,
    covered: merge(rows.flatMap((row) => row.overlap)),
    together: rows.reduce<Segment[]>((acc, row) => intersect(acc, row.windows), [DAY]),
  };
}

/** One office's local time at `hour` in the visitor's day (weekday assumed). */
function officeAt(row: OfficeRow, visitorOffset: number, hour: number) {
  const raw = hour + (row.offset - visitorOffset) / 60;
  const dayShift = Math.floor(raw / 24);
  const local = raw - dayShift * 24;
  return { local, dayShift, inHours: local >= WORK_START && local < WORK_END };
}

function summarize(model: Model, focus?: string): { lead: string; detail: string } {
  const covered = sum(model.covered);
  const everyHour = covered >= DAY_HOURS - 0.01;
  const row = focus ? model.rows.find((r) => r.office.city === focus) : undefined;

  if (row) {
    const own = sum(row.overlap);
    return {
      lead: own
        ? `${row.office.city} overlaps your working day ${spans(row.overlap)}: ${hoursText(own)}.`
        : `${row.office.city}'s office hours fall outside your 09:00–18:00 day.`,
      detail: everyHour
        ? 'Counting all three offices, one is open for every hour of your working day.'
        : covered
          ? `Counting all three offices, one is open for ${hoursText(covered)} of your working day.`
          : 'None of the three offices is open during your 09:00–18:00 day.',
    };
  }

  return {
    lead: everyHour
      ? 'An office is open for every hour of your working day.'
      : covered
        ? `An office is open for ${hoursText(covered)} of your working day: ${spans(model.covered)}.`
        : 'No office is open during your 09:00–18:00 day.',
    detail: sum(model.together)
      ? `All three overlap ${spans(model.together)} your time, the best window for a call with everyone.`
      : 'No hour of your working day has all three offices open at once.',
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export interface HoursExplorerProps {
  /** The office this page is about (a regional page): its row leads and the summary speaks for it. */
  focus?: 'Toronto' | 'Lagos' | 'Kingston';
  /** Accessible name for the whole instrument. */
  label?: string;
}

export default function HoursExplorer({ focus, label = 'Your working day against our office hours' }: HoursExplorerProps) {
  const minute = useMinute();
  const live = minute !== 0;
  const baseId = useId();
  const [zoneKey, setZoneKey] = useState(AUTO);
  const [pick, setPick] = useState<number | null>(null);

  const detected = live ? safeTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone, 'America/Toronto') : null;
  const zone = zoneKey === AUTO ? (detected ?? 'America/Toronto') : zoneKey;
  const model = useMemo(() => buildModel(live ? minute * MINUTE : null, zone), [live, minute, zone]);

  const ordered = focus
    ? [...model.rows].sort((a, b) => Number(b.office.city === focus) - Number(a.office.city === focus))
    : model.rows;

  const following = live && pick === null;
  const step = pick ?? (model.nowHour !== null ? Math.round(model.nowHour * 4) : 44);
  const hour = following && model.nowHour !== null ? model.nowHour : step / 4;
  const { lead, detail } = summarize(model, focus);
  const zoneWord = `${model.zoneLabel} time`;

  const readouts = ordered.map((row) => ({ row, at: officeAt(row, model.visitorOffset, hour) }));
  const valueText = `${clock(hour)} ${zoneWord}: ${readouts
    .map(({ row, at }) => `${row.office.city} ${clock(at.local)} ${at.inHours ? 'open' : 'closed'}`)
    .join(', ')}.`;

  const selectId = `${baseId}-zone`;
  const hintId = `${baseId}-hint`;
  const scrubId = `${baseId}-scrub`;

  const onTrackClick = (event: MouseEvent<HTMLInputElement>) => {
    // iOS Safari only moves a range thumb by dragging it; a tap on the track should jump there too.
    if (event.detail === 0) return; // keyboard-generated click
    const rect = event.currentTarget.getBoundingClientRect();
    const f = (event.clientX - rect.left - THUMB / 2) / Math.max(1, rect.width - THUMB);
    setPick(Math.min(STEPS, Math.max(0, Math.round(f * STEPS))));
  };

  return (
    <div className={styles.explorer} role="group" aria-label={label} data-live={live ? 'true' : 'false'}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor={selectId} className={styles.fieldLabel}>
            Your time zone
          </label>
          <select
            id={selectId}
            className={forms.select}
            value={zoneKey}
            aria-describedby={hintId}
            onChange={(event) => {
              setZoneKey(event.target.value);
              setPick(null);
            }}
          >
            <option value={AUTO}>{detected ? `Detected: ${cityOf(detected)}` : 'Detected from your browser'}</option>
            <optgroup label="MAPL TECH offices">
              {OFFICE_OPTIONS.map((option) => (
                <option key={option.zone} value={option.zone}>
                  {option.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Client cities">
              {CITY_OPTIONS.map((option) => (
                <option key={option.zone} value={option.zone}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          </select>
          <p id={hintId} className={styles.hint}>
            Pick a client&apos;s city to plan their calls.
          </p>
        </div>
      </div>

      <div className={styles.summary}>
        {/* Only the answer is live; the basis line below it is context, not news. */}
        <div aria-live="polite" aria-atomic="true">
          <p className={styles.lead}>{lead}</p>
          <p className={styles.detail}>{detail}</p>
        </div>
        <p className={styles.basis}>
          {live
            ? `For a 09:00–18:00 working day in ${zoneWord} (${utcLabel(model.visitorOffset)}).`
            : 'Shown in Toronto standard time until your browser reports its time zone.'}
        </p>
      </div>

      <div className={styles.ruler} style={{ '--f': step / STEPS, '--thumb': `${THUMB}px` } as CSSProperties}>
        <div className={styles.gridlines} aria-hidden="true" />
        <div className={styles.rows} aria-hidden="true">
          {ordered.map((row) => (
            <div key={row.office.timeZone} className={styles.row} data-focus={row.office.city === focus ? 'true' : undefined}>
              <span className={styles.rowLabel}>{row.office.city}</span>
              <span className={styles.track}>
                {row.windows.map((s) => (
                  <span key={`${s.start}-${s.end}`} className={styles.window} style={{ left: pct(s.start), width: pct(s.end - s.start) }} />
                ))}
              </span>
            </div>
          ))}
          <div className={styles.row} data-kind="you">
            <span className={styles.rowLabel}>You</span>
            <span className={styles.track}>
              <span className={styles.day} style={{ left: pct(DAY.start), width: pct(DAY_HOURS) }} />
              {model.covered.map((s) => (
                <span key={`${s.start}-${s.end}`} className={styles.covered} style={{ left: pct(s.start), width: pct(s.end - s.start) }} />
              ))}
              {model.nowHour !== null ? <span className={styles.now} style={{ left: pct(model.nowHour) }} /> : null}
            </span>
          </div>
          <div className={styles.axisRow}>
            <span className={styles.rowLabel} />
            <span className={styles.axis}>
              {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
                <span key={h} style={{ left: pct(h) }} data-minor={h % 6 !== 0 ? 'true' : undefined}>
                  {pad(h % 24)}
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className={styles.scrubZone}>
          <label htmlFor={scrubId} className="visually-hidden">
            Pick a time of day, in {zoneWord}
          </label>
          <input
            id={scrubId}
            type="range"
            min={0}
            max={STEPS}
            step={1}
            value={step}
            aria-valuetext={valueText}
            className={styles.scrub}
            onChange={(event) => setPick(Number(event.target.value))}
            onClick={onTrackClick}
          />
          <span className={styles.scrubLine} aria-hidden="true">
            <span className={styles.scrubTime}>{clock(hour)}</span>
          </span>
        </div>
      </div>

      <div className={styles.readout}>
        <div className={styles.readoutHead}>
          <p className={styles.readoutTitle}>
            {following ? (
              <>
                <span className={styles.liveDot} aria-hidden="true" />
                Right now, {clock(hour)} your time
              </>
            ) : (
              `On a weekday at ${clock(hour)} ${zoneWord}`
            )}
          </p>
          {live && pick !== null ? (
            <button type="button" className={styles.nowButton} onClick={() => setPick(null)}>
              Back to now
            </button>
          ) : null}
        </div>
        <ul className={styles.offices} role="list">
          {readouts.map(({ row, at }) => {
            const open = following ? row.openNow === true : at.inHours;
            const status = following
              ? row.openNow
                ? 'Open now'
                : row.weekendNow
                  ? 'Closed for the weekend'
                  : 'Closed now'
              : at.inHours
                ? 'In office hours'
                : 'Outside office hours';
            return (
              <li
                key={row.office.timeZone}
                className={styles.office}
                data-open={open ? 'true' : 'false'}
                data-focus={row.office.city === focus ? 'true' : undefined}
              >
                <p className={styles.officeCity}>
                  {row.office.city}
                  {row.office.city === 'Toronto' ? <span className={styles.tag}>HQ</span> : null}
                </p>
                <p className={styles.officeTime}>
                  <time dateTime={clock(at.local)}>{clock(at.local)}</time>
                  {at.dayShift !== 0 ? (
                    <span className={styles.shift}>{at.dayShift > 0 ? 'next day' : 'day before'}</span>
                  ) : null}
                </p>
                <p className={styles.officeStatus}>
                  <span className={styles.dot} aria-hidden="true" />
                  {status}
                </p>
                <p className={styles.officeZone}>
                  {row.office.country} · {utcLabel(row.offset)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
