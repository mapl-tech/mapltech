import type { ReactNode } from 'react';
import Link from 'next/link';
import Cta from '@/components/home/Cta';
import HeroLight from './HeroLight';
import styles from './PageHero.module.scss';

export interface Crumb {
  name: string;
  href?: string;
}

export interface HeroFact {
  term: string;
  detail: ReactNode;
}

export interface HeroAction {
  label: string;
  href: string;
  /** `<page>_<slot>`, stamped as data-cta-placement and emitted as cta_click. */
  placement: string;
}

export interface PageHeroProps {
  /** id of the H1 (the section is labelled by it). */
  id?: string;
  crumbs?: readonly Crumb[];
  eyebrow: string;
  /** Two lines: the finished surface in white, then the structure line in red. */
  titleLines: readonly string[];
  lede: string;
  primary: HeroAction;
  secondary?: HeroAction;
  trust?: string;
  facts?: readonly HeroFact[];
  /** Right column on wide screens, under the copy on phones. */
  aside?: ReactNode;
  /** 'wide': show the aside on wide screens only (it repeats what phones see further down). */
  asideOn?: 'all' | 'wide';
}

/**
 * The company family's first screen (flagship idiom): H1 in the first paint
 * (never faded in, so it can be the LCP element), a lede under 30 words, one
 * filled CTA marked `data-hero-cta` for the mobile action bar, one quiet text
 * link, then the answer-first facts search engines and AI assistants quote.
 *
 * Wide screens: with an `aside` the copy and the aside share the row and the
 * facts run underneath; without one the headline spans the width and the
 * facts become a spec sheet beside the lede (dense where it is evidence).
 * Server Component; the only client code is the magnetic button.
 */
export default function PageHero({
  id = 'page-title',
  crumbs,
  eyebrow,
  titleLines,
  lede,
  primary,
  secondary,
  trust,
  facts,
  aside,
  asideOn = 'all',
}: PageHeroProps) {
  const layout = aside ? 'aside' : facts?.length ? 'spec' : 'plain';
  return (
    <section className={styles.hero} aria-labelledby={id} data-layout={layout} data-aside={aside ? asideOn : undefined}>
      <HeroLight />
      <div className={styles.inner}>
        <div className={styles.head}>
          {crumbs?.length ? (
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <ol role="list">
                {crumbs.map((crumb) => (
                  <li key={crumb.name} aria-current={crumb.href ? undefined : 'page'}>
                    {crumb.href ? <Link href={crumb.href}>{crumb.name}</Link> : crumb.name}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <div className={styles.eyebrowRow}>
            <span className={styles.rule} aria-hidden="true" />
            <p className={styles.eyebrow}>{eyebrow}</p>
          </div>
          <h1 id={id} className={styles.title}>
            {titleLines.map((line, i) => (
              <span key={line} className={styles.titleLine}>
                {/* The lines are blocks visually; the space keeps the heading's text one sentence. */}
                {i > 0 ? ' ' : null}
                {line}
              </span>
            ))}
          </h1>
        </div>

        <div className={styles.body}>
          <p className={styles.lede}>{lede}</p>
          <div className={styles.actions}>
            <Cta placement={primary.placement} hero href={primary.href} size="large" boxClassName={styles.primary}>
              {primary.label}
            </Cta>
            {secondary ? (
              <Link href={secondary.href} className={styles.secondary} data-cta-placement={secondary.placement}>
                {secondary.label}
                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
              </Link>
            ) : null}
          </div>
          {trust ? <p className={styles.trust}>{trust}</p> : null}
        </div>

        {aside ? <div className={styles.aside}>{aside}</div> : null}

        {facts?.length ? (
          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.term} className={styles.fact}>
                <dt>{fact.term}</dt>
                <dd>{fact.detail}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
