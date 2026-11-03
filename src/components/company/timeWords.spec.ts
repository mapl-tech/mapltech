import { describe, expect, it } from 'vitest';
import { WORK_END, WORK_START } from '@/components/ui/officeTime';
import { nextStateWords, timeWords } from './timeWords';

// Weekday 0 is Sunday (ui/officeTime's ZoneTime).
const at = (weekday: number, hour: number) => ({ weekday, hour });
const next = (weekday: number, hour: number, open: boolean, zone?: string) =>
  nextStateWords(at(weekday, hour), open, WORK_START, WORK_END, zone);

describe('timeWords', () => {
  it('says times as people do, the number and am/pm held together', () => {
    expect(timeWords(9)).toBe('9 am');
    expect(timeWords(18)).toBe('6 pm');
    expect(timeWords(0, 5)).toBe('12:05 am');
    expect(timeWords(17, 22)).toBe('5:22 pm');
  });
});

describe('nextStateWords', () => {
  it('gives the closing time while the office is open', () => {
    expect(next(2, 11, true)).toBe('Until 6 pm');
    expect(next(2, 11, true, 'WAT')).toBe('Until 6 pm WAT');
  });

  it('is back the same morning before the working day starts', () => {
    expect(next(1, 7, false, 'WAT')).toBe('Back at 9 am WAT');
    expect(next(5, 0, false)).toBe('Back at 9 am');
  });

  it('is back tomorrow after a Monday to Thursday working day ends', () => {
    expect(next(1, 18, false)).toBe('Back tomorrow at 9 am');
    expect(next(4, 23, false, 'EST')).toBe('Back tomorrow at 9 am EST');
  });

  it('is back on Monday from Friday evening through Sunday', () => {
    expect(next(5, 18, false)).toBe('Back Monday at 9 am');
    expect(next(6, 12, false)).toBe('Back Monday at 9 am');
    expect(next(0, 8, false, 'WAT')).toBe('Back Monday at 9 am WAT');
  });
});
