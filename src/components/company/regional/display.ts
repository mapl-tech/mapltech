import { keepNumberWords } from '@/components/pricing/content';

/**
 * Display only: number words keep their parts on one line ("20‑minute",
 * keepNumberWords) and so do clock times ("9 am", a no-break space). The
 * JSON-LD and the data keep the plain text.
 */
export function display(text: string): string {
  return keepNumberWords(text).replace(/(\d) (am|pm)\b/g, '$1 $2');
}
