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
 * The line under an office's "Open now" or "Closed now": when that changes,
 * from the published working day (`start`/`end` hours, Monday to Friday) and
 * nothing else, so it is never a reply-time promise. Open: "Until 6 pm".
 * Closed: "Back at 9 am" before the day starts, "Back tomorrow at 9 am"
 * after it ends, "Back Monday at 9 am" from Friday evening to Sunday. `zone`
 * ("WAT") follows the time where the reader may be in another zone.
 * `weekday` 0 is Sunday, as in ui/officeTime's ZoneTime.
 */
export function nextStateWords(
  t: { hour: number; weekday: number },
  open: boolean,
  start: number,
  end: number,
  zone?: string,
): string {
  const z = zone ? ` ${zone}` : '';
  if (open) return `Until ${timeWords(end)}${z}`;
  const at = `${timeWords(start)}${z}`;
  if (t.weekday >= 1 && t.weekday <= 5 && t.hour < start) return `Back at ${at}`;
  if (t.weekday >= 1 && t.weekday <= 4) return `Back tomorrow at ${at}`;
  return `Back Monday at ${at}`;
}
