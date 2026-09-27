import type { ReactNode } from 'react';
import { routeLastModified } from '@/config/routes';
import shared from '@/app/convert.module.scss';

export interface KeyFact {
  label: string;
  value: ReactNode;
}

/** ISO date the route registry lists for this path, as a <time> ("Last reviewed"). */
export function LastReviewed({ path }: { path: string }) {
  const iso = routeLastModified(path);
  if (!iso) return <>2026-09</>;
  return <time dateTime={iso}>{iso}</time>;
}

export interface ConvertHeroProps {
  eyebrow: string;
  title: string;
  /** 40-60 words naming MAPL TECH, the audience and one real number. */
  lede: string;
  facts: KeyFact[];
  /** Primary + secondary CTA (both visible at SSR, never revealed). */
  actions: ReactNode;
  /** Rendered above the eyebrow (e.g. a breadcrumb). */
  before?: ReactNode;
  wideTitle?: boolean;
}

/**
 * The page anatomy every marketing route shares (brief §2 preamble):
 * H1 → lede → key facts <dl class="kv"> → primary + secondary CTA.
 * Plain SSR HTML: no reveal, no opacity/translate at load; the H1 is the LCP.
 */
export default function ConvertHero({ eyebrow, title, lede, facts, actions, before, wideTitle }: ConvertHeroProps) {
  return (
    <header className={shared.hero}>
      <div className={shared.heroInner}>
        {before}
        <p className="eyebrow">{eyebrow}</p>
        <h1 className={wideTitle ? shared.heroTitleWide : shared.heroTitle}>{title}</h1>
        <p className="lede">{lede}</p>
        <dl className={`kv ${shared.heroFacts}`}>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className={shared.ctaRow}>{actions}</div>
      </div>
    </header>
  );
}
