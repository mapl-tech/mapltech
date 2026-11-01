'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LiveNumber from '@/components/ui/LiveNumber';
import {
  FIXED_QUOTE_NOTE,
  SERVICE_META,
  SIZE_OPTIONS,
  SUPPORT_LEVELS,
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
import SendEstimateForm from './SendEstimateForm';
import { PROOF, keepHyphens } from './content';
import styles from './ScopeEstimator.module.scss';

/** The first sentence of the one approved client quote, for the decision point. */
const PROOF_EXCERPT = PROOF ? `${PROOF.quote.split('. ')[0].replace(/\.$/, '')}.` : null;

/**
 * The estimate readout. The live range first (teal, tabular, springing
 * between values), then the breakdown behind it, line by line from the
 * engine's own drivers, then the two next steps. The number is on screen
 * before any contact field exists (reciprocity); the email ask comes last
 * and is optional.
 */

interface SummaryProps {
  input: EstimateInput;
  result: EstimateResult;
}

const linePrice = (line: EstimateLine) => (line.isCustom ? 'Custom quote' : formatLineRange(line));

/**
 * The engine's drivers in plain words. Its notation is "<cause> → <effect>":
 * "8–12 pages → Growth / E-Commerce", "CMS integration → Growth / E-Commerce",
 * "Auth → included in Advanced", "Standard timeline → no rush premium".
 */
function plain(text: string, tierNames: readonly string[]): string {
  const [cause, effect] = text.split(' → ');
  if (effect === undefined) return text;
  if (effect.startsWith('included in ')) return `${cause}: ${effect}`;
  if (tierNames.includes(effect)) return `${cause} needs ${effect}`;
  return `${cause}: ${effect}`;
}

/**
 * A line's drivers without repeating its own tier name: the first driver maps
 * the size to a tier, and when that tier is the one heading the row the size
 * alone stands in for it ("8–12 pages"); otherwise it reads "Up to 7 pages:
 * Starter" and the add-on that moved it follows ("CMS integration needs
 * Growth / E-Commerce").
 */
function lineSteps(line: EstimateLine, input: EstimateInput): string[] {
  const size = SIZE_OPTIONS[line.service].find((option) => option.key === input.size[line.service]);
  const tierNames = tiersFor(line.service).map((tier) => tier.name);
  const [first, ...rest] = line.drivers;
  const head = size && first?.endsWith(`→ ${line.tierName}`) ? size.label : first?.replace(' → ', ': ');
  return [head, ...rest.map((text) => plain(text, tierNames))].filter((text): text is string => Boolean(text));
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
  const timeline = result.drivers.find((driver) => driver.kind === 'timeline');
  const caveats = result.notes.filter((note) => note !== FIXED_QUOTE_NOTE);
  const featureCount = result.lines.reduce((sum, line) => sum + line.features.length, 0);
  const callHref = estimateHref(input, { path: '/contact-us', hash: null });

  return (
    <section id="estimate-readout" className={styles.readout} aria-labelledby="estimate-readout-title">
      {/* The site's signature frame: an offset red hairline that slides into register. */}
      <span className={styles.frame} aria-hidden="true" />

      <div className={styles.card}>
        <div className={styles.readoutTop}>
          <h3 id="estimate-readout-title" className={styles.readoutLabel}>
            Your estimate
          </h3>
          <span className={styles.liveTag} aria-hidden="true">
            Live
          </span>
        </div>

        {/* The total is the live region and the focus target of the tier hand-off: one polite
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
          {allCustom ? 'Quoted after a 20-minute scoping call' : 'One-time build'}
          <span className={styles.unitNote}> · {FIXED_QUOTE_NOTE.replace('20-min', '20-minute')}</span>
        </p>

        {monthly ? (
          <p className={styles.monthly}>
            <span className={styles.monthlyValue}>+ {monthly}</span>
            <span className={styles.monthlyName}> {result.monthly.map((line) => line.name).join(' + ')}</span>
          </p>
        ) : null}

        {/* The breakdown: every figure above, traced to the line that produced it. */}
        <div className={styles.breakdown}>
          <h4 className={styles.subhead}>What drives the price</h4>
          <ol className={styles.drivers}>
            {/* Keys carry what each row says, so a row whose tier or price changes
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
                  <span className={styles.driverMuted}>No ongoing support selected</span>
                </p>
              </li>
            )}

            {timeline ? (
              <li key={`timeline-${input.timeline}`} className={styles.driver} data-kind="timeline">
                <p className={styles.driverRow}>
                  <span className={input.timeline === 'rush' ? styles.driverName : styles.driverMuted}>
                    {timeline.text.replace(' → ', ': ')}
                  </span>
                </p>
              </li>
            ) : null}

            {result.bundle ? (
              <li className={styles.driver} data-kind="bundle">
                <p className={styles.driverRow}>
                  <span className={styles.driverName}>Partner bundle: {result.bundle.name}</span>
                  <span className={styles.driverPrice}>{formatRange(result.bundle.low, result.bundle.high)}/mo</span>
                </p>
                <p className={styles.bundleNote}>
                  Covers these {result.lines.length} service lines as one monthly partnership.{' '}
                  <a href="#bundles" className={styles.inlineLink} data-cta-placement="pricing_estimate_bundles">
                    Compare both bundles
                  </a>
                </p>
              </li>
            ) : null}
          </ol>

          {caveats.length > 0 ? (
            <ul className={styles.caveats}>
              {caveats.map((note) => (
                <li key={note}>{note}.</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className={styles.next}>
          <Link href={callHref} className={styles.primary} data-cta-placement="pricing_estimate_call">
            Book a call
          </Link>
          <p className={styles.nextNote}>Your answers come with you, so the call starts from this estimate.</p>
          {/* Social proof beside the decision: an attributed excerpt of the real quote. */}
          {PROOF && PROOF_EXCERPT ? (
            <figure className={styles.proof}>
              <blockquote className={styles.proofQuote}>
                <p>{PROOF_EXCERPT}</p>
              </blockquote>
              <figcaption className={styles.proofBy}>
                {PROOF.name}, {PROOF.role}, {PROOF.company}
              </figcaption>
            </figure>
          ) : null}
        </div>

        <SendEstimateForm result={result} placement="estimate" />

        <details className={styles.included}>
          <summary className={styles.includedSummary}>
            <span>
              What&apos;s included <span className={styles.count}>({featureCount})</span>
            </span>
          </summary>
          {result.lines.map((line) => (
            <div key={line.service} className={styles.includedGroup}>
              <h5 className={styles.includedTitle}>
                {line.tierName} · {line.serviceName}
              </h5>
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
