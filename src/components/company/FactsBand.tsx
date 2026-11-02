import type { CSSProperties } from 'react';
import ed from './Company.module.scss';

export interface Fact {
  term: string;
  detail: string;
}

/**
 * The page's answer-first facts, set as the hero's foot: a ruled row of
 * terms and values (two columns on phones, one row on wide screens). These
 * are the lines a buyer scans first and an assistant quotes; every value is
 * computed or sourced in content.ts / regions.ts. Server Component.
 */
export default function FactsBand({ facts, label }: { facts: readonly Fact[]; label: string }) {
  if (!facts.length) return null;
  const style = { '--cols': Math.min(facts.length, 6) } as CSSProperties;
  return (
    <section className={ed.facts} aria-label={label}>
      <div className={ed.factsInner}>
        <dl className={ed.factsGrid} style={style} data-count={facts.length}>
          {facts.map((fact) => (
            <div key={fact.term} className={ed.fact}>
              <dt>{fact.term}</dt>
              <dd>{fact.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
