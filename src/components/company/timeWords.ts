/**
 * A time as people say it: `timeWords(9)` is "9 am", `timeWords(17, 22)` is
 * "5:22 pm", with a no-break space so the number and "am" never part at a line
 * end. For visible text only; machine-readable values (`<time dateTime>`) keep
 * the 24-hour form. Pure and client-safe.
 */
export function timeWords(hour: number, minute?: number): string {
  const suffix = hour % 24 < 12 ? 'am' : 'pm';
  const h = hour % 12 || 12;
  return minute === undefined ? `${h} ${suffix}` : `${h}:${String(minute).padStart(2, '0')} ${suffix}`;
}

/**
 * When an office's state next changes, from the published working day
 * (`start`/`end` hours, Monday to Friday) and nothing else, so it is never a
 * reply-time promise. Open: "until 6 pm". Closed, the next opening: "opens at
 * 9 am" before the day starts, "opens tomorrow at 9 am" after a Monday to
 * Thursday ends, "opens Monday at 9 am" from Friday evening to Sunday.
 * `weekday` 0 is Sunday, as in ui/officeTime's ZoneTime.
 */
export function openingWords(t: { hour: number; weekday: number }, open: boolean, start: number, end: number): string {
  if (open) return `until ${timeWords(end)}`;
  const at = `at ${timeWords(start)}`;
  if (t.weekday >= 1 && t.weekday <= 5 && t.hour < start) return `opens ${at}`;
  if (t.weekday >= 1 && t.weekday <= 4) return `opens tomorrow ${at}`;
  return `opens Monday ${at}`;
}

/**
 * The office's state and its next change as one plain line: "Open until
 * 6 pm", "Closed, opens tomorrow at 9 am". OfficeStatus draws the same words
 * with a dot for the eye ("Closed · opens…"); this is what a screen reader
 * hears.
 */
export function statusWords(t: { hour: number; weekday: number }, open: boolean, start: number, end: number): string {
  const next = openingWords(t, open, start, end);
  return open ? `Open ${next}` : `Closed, ${next}`;
}
