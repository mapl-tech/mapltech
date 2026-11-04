import type { CSSProperties } from 'react';
import ed from './Company.module.scss';

export interface Fact {
  term: string;
  /** The value in words; after `figure` it reads as the figure's unit ("years combined"). */
  detail?: string;
  /** A published figure at the head of the value ("200+", "$3,500"), set large. */
  figure?: string;
}

/**
 * The page's answer-first facts, set as the hero's foot: terms and values
 * under one rule (a ruled list, one fact a row, on phones; side by side from
 * 768px). These are the lines a buyer scans first and an assistant quotes;
 * every value is computed or sourced in content.ts / regions.ts, and each is
 * said once on its page. A fact with a `figure` sets it in the display face,
 * so the published numbers are what the eye meets first. `placement="aside"`
 * sets the same list in the hero's aside (PageHeader `aside`, /about-us and
 * /team): a ruled column beside the copy from 1024px, the band's layout under
 * the copy below that. Server Component.
 */
export default function FactsBand({
  facts,
  label,
  placement = 'band',
}: {
  facts: readonly Fact[];
  label: string;
  placement?: 'band' | 'aside';
}) {
  if (!facts.length) return null;
  const style = { '--cols': Math.min(facts.length, 6) } as CSSProperties;
  const aside = placement === 'aside';
  const list = (
    <dl
      className={aside ? `${ed.factsGrid} ${ed.asideFacts}` : ed.factsGrid}
      style={style}
      data-count={facts.length}
    >
      {facts.map((fact) => (
        <div key={fact.term} className={ed.fact}>
          <dt>{fact.term}</dt>
          <dd className={fact.figure ? ed.figured : undefined}>
            {fact.figure ? <span className={ed.figure}>{fact.figure}</span> : null}
            {fact.figure && fact.detail ? ' ' : null}
            {fact.detail}
          </dd>
        </div>
      ))}
    </dl>
  );
  return aside ? (
    <section aria-label={label}>{list}</section>
  ) : (
    <section className={ed.facts} aria-label={label}>
      <div className={ed.factsInner}>{list}</div>
    </section>
  );
}
