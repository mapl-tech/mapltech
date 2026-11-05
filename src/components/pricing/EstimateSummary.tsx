'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LiveNumber from '@/components/ui/LiveNumber';
import { pricing } from '@/config/site';
import {
  SERVICE_META,
  SIZE_OPTIONS,
  SUPPORT_LEVELS,
  TOGGLE_OPTIONS,
  estimateHref,
  formatLineRange,
  formatMoney,
  formatRange,
  tiersFor,
  type EstimateInput,
  type EstimateLine,
  type EstimateResult,
} from '@/lib/estimate';
import { NDA_LINE } from '@/components/flagship/content';
import QuoteLine from '@/components/flagship/QuoteLine';
import { PROJECT_LABEL } from '@/components/layout/chrome';
import { keepTogether } from '@/components/services/keepTogether';
import SendEstimateForm from './SendEstimateForm';
import {
  CUSTOM_NOTE,
  CUSTOM_PRICE,
  QUOTE_NOTE,
  TOGGLE_LABELS,
  TOTAL_SPRING,
  addOnsMoving,
  estimateHeadline,
  headlineRange,
  keepHyphens,
  listWords,
  priceText,
} from './content';
import styles from './ScopeEstimator.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * The estimate readout. The live range first (teal, tabular, springing
 * between values), what it is and what follows it, then the one next step.
 * The number is on screen before any contact field exists (reciprocity); the
 * email ask comes after it and is optional. The primary action is "Start a
 * project", and it opens the brief already filled in from these answers; the
 * NDA line and the approved client quote sit under it, so the decision has
 * its risk answer and its proof beside it. How the price adds up and what is
 * included sit one tap away, each on a native <details>, so the card stays
 * short beside the questions.
 */

interface SummaryProps {
  input: EstimateInput;
  result: EstimateResult;
}

const linePrice = (line: EstimateLine) => (line.isCustom ? CUSTOM_PRICE : formatLineRange(line));

/** The engine's add-on labels, as /pricing names them (TOGGLE_LABELS). */
const PLAIN_TOGGLE = new Map(TOGGLE_OPTIONS.map((toggle) => [toggle.label, TOGGLE_LABELS[toggle.key] ?? toggle.label]));

/**
 * The engine's drivers in plain words. Its notation is "<cause> → <effect>":
 * "8–12 pages → Growth / E-Commerce", "CMS integration → Growth / E-Commerce",
 * "Auth → included in Advanced".
 */
function plain(text: string, tierNames: readonly string[]): string {
  const [raw, effect] = text.split(' → ');
  const cause = PLAIN_TOGGLE.get(raw) ?? raw;
  if (effect === undefined) return cause;
  if (effect.startsWith('included in ')) return `${cause}: ${effect}`;
  if (tierNames.includes(effect)) return `${cause} needs ${effect}`;
  return `${cause}: ${effect}`;
}

/**
 * A line's drivers without repeating its own package name: the first driver
 * maps the size to a package, and when that package is the one heading the
 * row the size alone stands in for it ("8–12 pages"); otherwise it reads "Up
 * to 7 pages: Starter" and the add-on that moved it follows ("Content editing
 * (CMS) needs Growth / E-Commerce").
 */
function lineSteps(line: EstimateLine, input: EstimateInput): string[] {
  const size = SIZE_OPTIONS[line.service].find((option) => option.key === input.size[line.service]);
  const tierNames = tiersFor(line.service).map((tier) => tier.name);
  const [first, ...rest] = line.drivers;
  const head = size && first?.endsWith(`→ ${line.tierName}`) ? size.label : first?.replace(' → ', ': ');
  return [head, ...rest.map((text) => plain(text, tierNames))].filter((text): text is string => Boolean(text));
}

/** What the range does not cover, in the page's words (the engine's notes, rewritten). */
function caveatsFor(input: EstimateInput, result: EstimateResult): string[] {
  const notes: string[] = [];
  if (input.timeline === 'rush') {
    notes.push(`Rush work is billed at our emergency rate, ${priceText(pricing.hourlyRates.emergency)} an hour, on top of this range.`);
  }
  for (const line of result.lines) {
    if (line.isCustom) notes.push(`${line.tierName} (${line.serviceName}) is ${CUSTOM_NOTE.toLowerCase()}.`);
  }
  return notes;
}

/**
 * Where the range comes from, in plain sentences, exactly as estimate.ts
 * computes it: a Web Development package shows its own starting price, as the
 * live site lists it ("$5,000+"); any other package shows its listed range;
 * several packages are added together. When an add-on, not the size, chose the package,
 * the line says so first ("Content editing (CMS) needs Growth / E-Commerce"),
 * so a dearer package never appears without its reason. Null when nothing has
 * a public price (the unit line covers "Custom").
 */
function rangeBasis(result: EstimateResult): string | null {
  const priced = result.lines.filter((line) => !line.isCustom);
  if (priced.length === 0) return null;
  const { size, toggles } = result.input;
  if (priced.length > 1) {
    const moved = result.lines
      .filter((line) => addOnsMoving(line.service, size[line.service], toggles).length > 0)
      .map((line) => `${line.serviceName} to ${keepHyphens(line.tierName)}`);
    const why = moved.length > 0 ? ` Your add-ons move ${listWords(moved)}.` : '';
    return `The range adds together the price ranges of your packages.${why}`;
  }
  const [line] = priced;
  const name = keepHyphens(line.tierName);
  const movedBy = addOnsMoving(line.service, size[line.service], toggles);
  const needs = movedBy.length > 0 ? `${listWords(movedBy)} ${movedBy.length > 1 ? 'need' : 'needs'} ${name}` : null;
  if (!line.startingAt) return needs ? `${needs}. This is its listed price range.` : `This is the listed price range for ${name}.`;
  const from = line.low === null ? null : formatMoney(line.low);
  const starts = needs
    ? `${needs}${from ? `, which starts at ${from}` : ''}.`
    : from
      ? `${name} starts at ${from}.`
      : `${name} has a starting price.`;
  // Web packages are starting prices, as the live site lists them ("$5,000+"): the fixed quote, for the
  // scope agreed with the visitor (HERO.trust), sets the rest.
  return `${starts} This is its listed starting price. We agree the scope with you, then the fixed quote sets the final price.`;
}

/**
 * "$5,000 to $8,500 one-time, plus $500 to $1,000 a month": what the live region reads out, the
 * words on screen ("$3,500 to $5,000 one-time, and a custom quote for Enterprise").
 */
function spoken(result: EstimateResult): string {
  const headline = estimateHeadline(result);
  const range = headlineRange(headline).replace('–', ' to ');
  const custom = headline.customNote ? `, ${headline.customNote}` : '';
  const monthly = result.monthly.length > 0 ? `, plus ${formatRange(result.monthlyLow, result.monthlyHigh).replace('–', ' to ')} a month` : '';
  return headline.allCustom ? `Estimate: custom quote${monthly}.` : `Estimate: ${range} one-time${custom}${monthly}.`;
}

/** Spoken updates wait for the visitor to pause, so rapid clicking yields one announcement. */
const ANNOUNCE_DELAY_MS = 400;

export default function EstimateSummary({ input, result }: SummaryProps) {
  const latest = spoken(result);
  const [announced, setAnnounced] = useState(latest);
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(latest), ANNOUNCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [latest]);

  const headline = estimateHeadline(result);
  const { allCustom } = headline;
  const basis = rangeBasis(result);
  const monthly = result.monthly.length > 0 ? `${formatRange(result.monthlyLow, result.monthlyHigh)} a month` : null;
  const multi = result.lines.length > 1;
  const level = SUPPORT_LEVELS.find((entry) => entry.key === input.support);
  const caveats = caveatsFor(input, result);
  const featureCount = result.lines.reduce((sum, line) => sum + line.features.length, 0);
  const callHref = estimateHref(input, { path: '/contact-us', hash: null });

  return (
    <section id="estimate-readout" className={styles.readout} aria-labelledby="estimate-readout-title">
      <div className={styles.card}>
        {/* The head: the label and the total. Beside the questions (1024px and up) the card gets
            shorter from the bottom as the questions end, down to this head (ScopeEstimator). */}
        <div className={styles.cardHead} data-readout-head="">
          <h3 id="estimate-readout-title" className={styles.readoutLabel}>
            Your estimate
          </h3>

          {/* The total is the live region and the focus target of the package hand-off: one polite
              announcement in words once the visitor pauses, while the springing digits stay silent
              (decorative: no live regions of their own nested inside this one). A package quoted
              after a call is named under the priced range, never folded into a "+" floor. */}
          <div className={styles.totalBox}>
            <p className={styles.total} id="estimate-total" tabIndex={-1} aria-live="polite" aria-atomic="true">
              <span className="visually-hidden">{announced}</span>
              <span className={styles.digits} aria-hidden="true">
                {allCustom ? (
                  <span className={styles.live}>{CUSTOM_PRICE}</span>
                ) : headline.high === null ? (
                  <LiveNumber
                    value={headline.low}
                    format={formatMoney}
                    suffix="+"
                    className={styles.live}
                    spring={TOTAL_SPRING}
                    decorative
                  />
                ) : (
                  <>
                    <LiveNumber value={headline.low} format={formatMoney} className={styles.live} spring={TOTAL_SPRING} decorative />
                    <span className={styles.dash}>–</span>
                    <LiveNumber
                      value={headline.high}
                      format={formatMoney}
                      suffix={headline.openEnded ? '+' : ''}
                      className={styles.live}
                      spring={TOTAL_SPRING}
                      decorative
                    />
                  </>
                )}
              </span>
              {headline.customNote ? (
                <span className={styles.totalCustom} aria-hidden="true">
                  {headline.customNote}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Everything under the total: on wide screens it scrolls inside the card when a disclosure
            makes the card taller than the screen, and clips while the questions' end holds it short. */}
        <div className={styles.cardBody} data-readout-body="">
          {/* What the body holds, measured to tell when the body has to scroll (ScopeEstimator). */}
          <div data-readout-content="">
            <p className={styles.unit}>
              {/* "20-minute" never splits across lines (a no-wrap span, same characters). */}
              {allCustom ? (
                CUSTOM_NOTE
              ) : (
                <>
                  One-time cost<span className={styles.unitNote}> · {keepTogether(QUOTE_NOTE)}</span>
                </>
              )}
            </p>

            {basis ? <p className={styles.basis}>{basis}</p> : null}

            {monthly ? (
              <p className={styles.monthly}>
                <span className={styles.monthlyValue}>+ {monthly}</span>
                <span className={styles.monthlyName}> for {result.monthly.map((line) => keepHyphens(line.name)).join(' + ')}</span>
              </p>
            ) : null}

            {caveats.length > 0 ? (
              <ul className={styles.caveats}>
                {caveats.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}

            <div className={styles.next}>
              {/* The site's one primary ask, carrying this estimate into the brief on /contact-us. */}
              <Link href={callHref} className={styles.primary} data-cta-placement="pricing_estimate_call">
                {PROJECT_LABEL}
                <span className={styles.primaryArrow} aria-hidden="true">
                  <Arrow />
                </span>
              </Link>
              <p className={styles.nextNote}>Your answers are added to the project form for you. {NDA_LINE}</p>
              <QuoteLine className={styles.quote} />
            </div>

            <SendEstimateForm result={result} placement="estimate" />

            {/* Every figure above, traced to the line that produced it. */}
            <details className={styles.disclosure}>
              <summary className={styles.disclosureSummary}>How this price adds up</summary>
              <ol className={styles.drivers}>
                {/* Keys carry what each row says, so a row whose package or price changes
                    settles in again and draws the eye to what moved. */}
                {result.lines.map((line) => (
                  <li key={`${line.service}-${line.tierIndex}-${linePrice(line)}`} className={styles.driver} data-kind="service">
                    <p className={styles.driverRow}>
                      <span className={styles.driverName}>
                        {line.serviceName}: {keepHyphens(line.tierName)}
                      </span>
                      <span className={styles.driverPrice}>{linePrice(line)}</span>
                    </p>
                    <ul className={styles.driverSteps}>
                      {lineSteps(line, input).map((text) => (
                        <li key={text}>{text}</li>
                      ))}
                    </ul>
                  </li>
                ))}

                {result.monthly.length > 0 ? (
                  result.monthly.map((line) => (
                    <li key={`support-${line.service}-${line.name}`} className={styles.driver} data-kind="support">
                      <p className={styles.driverRow}>
                        <span className={styles.driverName}>
                          {level?.label} support: {keepHyphens(line.name)}
                          {multi ? <span className={styles.driverFor}> ({SERVICE_META[line.service].shortLabel})</span> : null}
                        </span>
                        <span className={styles.driverPrice}>{formatRange(line.low, line.high)} a month</span>
                      </p>
                    </li>
                  ))
                ) : (
                  <li className={styles.driver} data-kind="support">
                    <p className={styles.driverRow}>
                      <span className={styles.driverMuted}>No monthly plan</span>
                    </p>
                  </li>
                )}

                <li key={`timeline-${input.timeline}`} className={styles.driver} data-kind="timeline">
                  <p className={styles.driverRow}>
                    {input.timeline === 'rush' ? (
                      <span className={styles.driverName}>Rush timeline: our emergency rate on top</span>
                    ) : (
                      <span className={styles.driverMuted}>Standard timeline: no extra cost</span>
                    )}
                  </p>
                </li>

                {result.bundle ? (
                  <li className={styles.driver} data-kind="bundle">
                    <p className={styles.driverRow}>
                      <span className={styles.driverName}>Monthly partnership: {result.bundle.name}</span>
                      <span className={styles.driverPrice}>{formatRange(result.bundle.low, result.bundle.high)} a month</span>
                    </p>
                    <p className={styles.bundleNote}>
                      Covers these {result.lines.length} services for one monthly price.{' '}
                      <a href="#bundles" className={styles.inlineLink} data-cta-placement="pricing_estimate_bundles">
                        Compare monthly partnerships
                      </a>
                    </p>
                  </li>
                ) : null}
              </ol>
            </details>

            <details className={styles.disclosure}>
              <summary className={styles.disclosureSummary}>
                <span>
                  What&apos;s included <span className={styles.count}>({featureCount})</span>
                </span>
              </summary>
              {result.lines.map((line) => (
                <div key={line.service} className={styles.includedGroup}>
                  <h4 className={styles.includedTitle}>
                    {keepHyphens(line.tierName)} · {line.serviceName}
                  </h4>
                  <ul>
                    {line.features.map((feature) => (
                      <li key={feature}>{keepHyphens(feature)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
