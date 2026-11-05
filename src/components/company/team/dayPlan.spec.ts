import { describe, expect, it } from 'vitest';
import {
  YOUR_DAY,
  cityOf,
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

const at = (iso: string) => Date.parse(iso);
const nb = (text: string) => text.replace(/ (am|pm)/g, ' $1');

/** Every office's open spans on the visitor's shown day, and the minutes of their 9 to 6 covered. */
function plan(iso: string, zone: string) {
  const day = planDay(at(iso), zone);
  const spans = Object.fromEntries(OFFICES.map((o) => [o.city, openSpans(day.start, o.timeZone)]));
  const covered = overlapMinutes(Object.values(spans).flat(), YOUR_DAY.from, YOUR_DAY.to);
  return { day, spans, covered };
}

describe('localMidnight', () => {
  it('finds local midnight on an ordinary day', () => {
    expect(localMidnight(at('2026-11-05T15:00:00Z'), 'Europe/London')).toBe(at('2026-11-05T00:00:00Z'));
    expect(localMidnight(at('2026-11-05T15:00:00Z'), 'America/Los_Angeles')).toBe(at('2026-11-05T08:00:00Z'));
  });

  it('survives the clocks changing since midnight', () => {
    // Toronto springs forward at 2 am on March 8, 2026: midnight was still EST (UTC-5).
    expect(localMidnight(at('2026-03-08T16:00:00Z'), 'America/Toronto')).toBe(at('2026-03-08T05:00:00Z'));
    // And falls back on November 1, 2026: midnight was still EDT (UTC-4).
    expect(localMidnight(at('2026-11-01T15:00:00Z'), 'America/Toronto')).toBe(at('2026-11-01T04:00:00Z'));
  });
});

describe('planDay', () => {
  it('shows today on a weekday', () => {
    expect(planDay(at('2026-11-05T15:00:00Z'), 'Europe/London')).toEqual({ start: at('2026-11-05T00:00:00Z'), today: true });
  });

  it('shows the next Monday at the weekend', () => {
    expect(planDay(at('2026-11-07T12:00:00Z'), 'Europe/London')).toEqual({ start: at('2026-11-09T00:00:00Z'), today: false });
    expect(planDay(at('2026-11-08T12:00:00Z'), 'Europe/London')).toEqual({ start: at('2026-11-09T00:00:00Z'), today: false });
  });
});

describe('openSpans and coverage', () => {
  it('Toronto sees its own day', () => {
    const { spans, covered } = plan('2026-11-05T15:00:00Z', 'America/Toronto');
    expect(spans.Toronto).toEqual([{ from: 540, to: 1080 }]);
    expect(spans.Kingston).toEqual([{ from: 540, to: 1080 }]); // the same clock in winter
    expect(spans.Lagos).toEqual([{ from: 180, to: 720 }]); // 6 hours ahead in winter
    expect(covered).toBe(540);
  });

  it('London is covered from 8 am to 11 pm', () => {
    const { spans, covered } = plan('2026-11-05T15:00:00Z', 'Europe/London');
    expect(spans.Lagos).toEqual([{ from: 480, to: 1020 }]);
    expect(spans.Toronto).toEqual([{ from: 840, to: 1380 }]);
    expect(spanWords(mergeSpans(Object.values(spans).flat()))).toBe(nb('8 am to 11 pm'));
    expect(covered).toBe(540);
  });

  it('Los Angeles gets six hours of its 9 to 6', () => {
    const { spans, covered } = plan('2026-11-05T20:00:00Z', 'America/Los_Angeles');
    expect(spans.Toronto).toEqual([{ from: 360, to: 900 }]);
    expect(spans.Lagos).toEqual([{ from: 0, to: 540 }]);
    expect(covered).toBe(360);
    expect(hoursFigure(covered)).toBe('6');
  });

  it('a half-hour zone gets a half-hour answer', () => {
    const { spans, covered } = plan('2026-11-05T06:00:00Z', 'Asia/Kolkata');
    expect(spans.Lagos).toEqual([{ from: 810, to: 1350 }]);
    expect(spans.Toronto).toEqual([
      { from: 0, to: 270 },
      { from: 1170, to: 1440 },
    ]);
    expect(hoursFigure(covered)).toBe('4.5');
  });

  it('daylight saving moves Toronto away from Kingston', () => {
    // March 9, 2026: Toronto is on EDT (UTC-4), Kingston stays on EST, London is still on GMT.
    const { spans } = plan('2026-03-09T12:00:00Z', 'Europe/London');
    expect(spans.Toronto).toEqual([{ from: 780, to: 1320 }]);
    expect(spans.Kingston).toEqual([{ from: 840, to: 1380 }]);
  });

  it('a Sydney Monday is still Sunday in Toronto', () => {
    const { spans } = plan('2026-11-08T23:00:00Z', 'Australia/Sydney');
    expect(spans.Toronto).toEqual([]);
    expect(spans.Lagos).toEqual([{ from: 1140, to: 1440 }]);
  });
});

describe('officeAt', () => {
  it('reads an office clock and says when its day differs', () => {
    expect(officeAt(at('2026-11-05T15:00:00Z'), 'America/Toronto', 'Europe/London')).toEqual({
      time: nb('10 am'),
      hhmm: '10:00',
      open: true,
      otherDay: null,
    });
    expect(officeAt(at('2026-11-05T02:00:00Z'), 'America/Toronto', 'Australia/Sydney')).toEqual({
      time: nb('9 pm'),
      hhmm: '21:00',
      open: false,
      otherDay: 'Wednesday',
    });
  });
});

describe('words', () => {
  it('says minutes and zones as people do', () => {
    expect(minuteWords(0)).toBe(nb('12 am'));
    expect(minuteWords(1440)).toBe(nb('12 am'));
    expect(minuteWords(975)).toBe(nb('4:15 pm'));
    expect(cityOf('America/Argentina/Buenos_Aires')).toBe('Buenos Aires');
    expect(cityOf('UTC')).toBe('UTC');
  });
});
