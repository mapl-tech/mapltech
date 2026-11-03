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
  formatEstimateMonthly,
  formatEstimateRange,
  formatLineRange,
  formatMoney,
  formatRange,
  tiersFor,
  type EstimateInput,
  type EstimateLine,
  type EstimateResult,
} from '@/lib/estimate';
import { PROJECT_LABEL } from '@/components/layout/chrome';
import SendEstimateForm from './SendEstimateForm';
import { QUOTE_NOTE, TOGGLE_LABELS, keepHyphens, priceText } from './content';
import styles from './ScopeEstimator.module.scss';

/**
 * The estimate readout. The live range first (teal, tabular, springing
 * between values), what it is and what follows it, then the one next step.
 * The number is on screen before any contact field exists (reciprocity); the
 * email ask comes after it and is optional. The primary action is "Start a
 * project", and it opens the brief already filled in from these answers.
 * How the price adds up and what is included sit one tap away, each on a
 * native <details>, so the card stays short beside the questions.
 */

interface SummaryProps {
  input: EstimateInput;
  result: EstimateResult;
}

const linePrice = (line: EstimateLine) => (line.isCustom ? 'Custom quote' : formatLineRange(line));

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
    if (line.isCustom) notes.push(`${line.tierName} (${line.serviceName}) gets its own quote after the call.`);
  }
  return notes;
}

/** "$5,000 to $8,500 one-time, plus $500 to $1,000 a month": what the live region reads out. */
function spoken(result: EstimateResult): string {
  const range = formatEstimateRange(result).replace('–', ' to ');
  const monthly = result.monthly.length > 0 ? `, plus ${formatRange(result.monthlyLow, result.monthlyHigh).replace('–', ' to ')} a month` : '';
  return range === 'Custom' ? `Estimate: custom quote${monthly}.` : `Estimate: ${range} one-time${monthly}.`;
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

  const allCustom = result.lines.length > 0 && result.lines.every((line) => line.isCustom);
  const monthly = formatEstimateMonthly(result);
  const multi = result.lines.length > 1;
  const level = SUPPORT_LEVELS.find((entry) => entry.key === input.support);
  const caveats = caveatsFor(input, result);
  const featureCount = result.lines.reduce((sum, line) => sum + line.features.length, 0);
  const callHref = estimateHref(input, { path: '/contact-us', hash: null });

  return (
    <section id="estimate-readout" className={styles.readout} aria-labelledby="estimate-readout-title">
      <div className={styles.card}>
        <h3 id="estimate-readout-title" className={styles.readoutLabel}>
          Your estimate
        </h3>

        {/* The total is the live region and the focus target of the package hand-off: one polite
            announcement in words once the visitor pauses, while the springing digits stay silent. */}
        <div className={styles.totalBox}>
          <p className={styles.total} id="estimate-total" tabIndex={-1} aria-live="polite" aria-atomic="true">
            <span className="visually-hidden">{announced}</span>
            <span className={styles.digits} aria-hidden="true">
              {allCustom ? (
                <span className={styles.live}>Custom</span>
              ) : result.oneTimeHigh === null ? (
                <LiveNumber value={result.oneTimeLow} format={formatMoney} suffix="+" className={styles.live} />
              ) : (
                <>
                  <LiveNumber value={result.oneTimeLow} format={formatMoney} className={styles.live} />
                  <span className={styles.dash}>–</span>
                  <LiveNumber
                    value={result.oneTimeHigh}
                    format={formatMoney}
                    suffix={result.isOpenEnded ? '+' : ''}
                    className={styles.live}
                  />
                </>
              )}
            </span>
          </p>
        </div>

        <p className={styles.unit}>
          {allCustom ? (
            'We quote this after a 20-minute call'
          ) : (
            <>
              One-time cost<span className={styles.unitNote}> · {QUOTE_NOTE}</span>
            </>
          )}
        </p>

        {monthly ? (
          <p className={styles.monthly}>
            <span className={styles.monthlyValue}>+ {monthly}</span>
            <span className={styles.monthlyName}> {result.monthly.map((line) => line.name).join(' + ')}</span>
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
              →
            </span>
          </Link>
          <p className={styles.nextNote}>Your answers are added to the project form for you.</p>
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
                      {level?.label} support: {line.name}
                      {multi ? <span className={styles.driverFor}> ({SERVICE_META[line.service].shortLabel})</span> : null}
                    </span>
                    <span className={styles.driverPrice}>{formatRange(line.low, line.high)}/mo</span>
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
                  <span className={styles.driverName}>Monthly bundle: {result.bundle.name}</span>
                  <span className={styles.driverPrice}>{formatRange(result.bundle.low, result.bundle.high)}/mo</span>
                </p>
                <p className={styles.bundleNote}>
                  Covers these {result.lines.length} services for one monthly price.{' '}
                  <a href="#bundles" className={styles.inlineLink} data-cta-placement="pricing_estimate_bundles">
                    Compare bundles
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
                {line.tierName} · {line.serviceName}
              </h4>
              <ul>
                {line.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </details>
      </div>
    </section>
  );
}
