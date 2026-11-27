import styles from './QuoteText.module.scss';

/**
 * A testimonial's words exactly as given, in curly quotes, with the part a
 * skimming reader should catch (site.ts `highlight`) in a <mark>. Emphasis
 * only: the words never change, and nothing is marked unless the highlight
 * is, word for word, part of the quote. Each place sets its own colours on
 * `mark` (the quote around it a step quieter), so the emphasis suits the
 * ground it sits on. `marks={false}` leaves the quotation marks to the
 * page's CSS (the contact page draws them in crimson).
 */
export default function QuoteText({ quote, highlight, marks = true }: { quote: string; highlight?: string; marks?: boolean }) {
  const open = marks ? '“' : '';
  const close = marks ? '”' : '';
  const at = highlight ? quote.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <>{`${open}${quote}${close}`}</>;
  return (
    <>
      {open}
      {quote.slice(0, at)}
      <mark className={styles.mark}>{highlight}</mark>
      {quote.slice(at + highlight.length)}
      {close}
    </>
  );
}
