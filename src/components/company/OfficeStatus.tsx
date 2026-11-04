import { WORK_END, WORK_START, type ZoneTime } from '@/components/ui/officeTime';
import { openingWords } from './timeWords';

/**
 * An office's state and when it next changes, as one phrase: "Open until
 * 6 pm" or "Closed · opens tomorrow at 9 am", from the published working day
 * only (never a reply time). A closed office always says when it opens. The
 * dot is for the eye; a screen reader hears "Closed, opens…" (statusWords in
 * timeWords.ts is the same line in plain text). Rendered inside the clocks'
 * client components, after hydration.
 */
export default function OfficeStatus({ t, open }: { t: ZoneTime; open: boolean }) {
  const next = openingWords(t, open, WORK_START, WORK_END);
  if (open) return <>Open {next}</>;
  return (
    <>
      Closed
      <span aria-hidden="true">{' · '}</span>
      <span className="visually-hidden">, </span>
      {next}
    </>
  );
}
