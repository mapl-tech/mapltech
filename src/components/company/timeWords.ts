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
