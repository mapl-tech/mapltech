import { describe, expect, it } from 'vitest';
import { WORK_END, WORK_START } from '@/components/ui/officeTime';
import { openingWords, statusWords, timeWords } from './timeWords';

// Weekday 0 is Sunday (ui/officeTime's ZoneTime).
const at = (weekday: number, hour: number) => ({ weekday, hour });
const next = (weekday: number, hour: number, open: boolean) => openingWords(at(weekday, hour), open, WORK_START, WORK_END);
const status = (weekday: number, hour: number, open: boolean) => statusWords(at(weekday, hour), open, WORK_START, WORK_END);

describe('timeWords', () => {
  it('says times as people do, the number and am/pm held together', () => {
    expect(timeWords(9)).toBe('9 am');
    expect(timeWords(18)).toBe('6 pm');
    expect(timeWords(0, 5)).toBe('12:05 am');
    expect(timeWords(17, 22)).toBe('5:22 pm');
  });
});

describe('openingWords', () => {
  it('gives the closing time while the office is open', () => {
    expect(next(2, 11, true)).toBe('until 6 pm');
  });

  it('opens the same morning before the working day starts', () => {
    expect(next(1, 7, false)).toBe('opens at 9 am');
    expect(next(5, 0, false)).toBe('opens at 9 am');
  });

  it('opens tomorrow after a Monday to Thursday working day ends', () => {
    expect(next(1, 18, false)).toBe('opens tomorrow at 9 am');
    expect(next(4, 23, false)).toBe('opens tomorrow at 9 am');
  });

  it('opens on Monday from Friday evening through Sunday', () => {
    expect(next(5, 18, false)).toBe('opens Monday at 9 am');
    expect(next(6, 12, false)).toBe('opens Monday at 9 am');
    expect(next(0, 8, false)).toBe('opens Monday at 9 am');
  });
});

describe('statusWords', () => {
  it('never leaves a bare "Closed": the next opening is always said', () => {
    expect(status(3, 10, true)).toBe('Open until 6 pm');
    expect(status(3, 19, false)).toBe('Closed, opens tomorrow at 9 am');
    expect(status(3, 6, false)).toBe('Closed, opens at 9 am');
    expect(status(6, 10, false)).toBe('Closed, opens Monday at 9 am');
  });
});
