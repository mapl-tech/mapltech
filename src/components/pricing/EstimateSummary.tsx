'use client';

import LiveNumber from '@/components/ui/LiveNumber';
import {
  estimateHref,
  formatEstimateMonthly,
  formatMoney,
  formatRange,
  type EstimateDriverKind,
  type EstimateInput,
  type EstimateLine,
  type EstimateResult,
} from '@/lib/estimate';
import Cta from './Cta';
import SendEstimateForm from './SendEstimateForm';
import styles from './ScopeEstimator.module.scss';

/**
 * Interaction IX-3: the estimate summary, one component in two placements
 * (desktop sticky rail, mobile vaul sheet). Everything is always in the DOM;
 * only the live range animates (#7), in teal.
 */

const TAG: Record<EstimateDriverKind, string> = {
  service: 'svc',
  addon: 'add',
  support: 'sup',
  timeline: 'time',
  bundle: 'bund',
};

export type SummaryPlacement = 'rail' | 'sheet';

const linePrice = (line: EstimateLine) =>
  line.isCustom ? 'custom, fixed quote after scoping' : line.startingAt ? `starting at ${line.priceLabel}` : line.priceLabel;

interface HeadlineProps {
  result: EstimateResult;
  /** id of the focus target for the tier -> estimator hand-off. */
  totalId: string;
  /** Sheet peek: no eyebrow or unit label, tier + monthly on one line. */
  compact?: boolean;
}

export function EstimateHeadline({ result, totalId, compact = false }: HeadlineProps) {
  const allCustom = result.hasCustom && result.lines.every((line) => line.isCustom);
  const monthly = formatEstimateMonthly(result);
  const multi = result.lines.length > 1;

  return (
    <div className={`${styles.headline} ${compact ? styles.compact : ''}`.trim()}>
      {!compact && <p className={styles.eyebrow}>Your estimate</p>}
      <div className={styles.total} id={totalId} tabIndex={-1}>
        {allCustom ? (
          <span className={styles.customTotal}>Custom</span>
        ) : result.oneTimeHigh === null ? (
          <LiveNumber value={result.oneTimeLow} format={formatMoney} suffix="+" className={styles.live} />
        ) : (
          <>
            <LiveNumber value={result.oneTimeLow} format={formatMoney} className={styles.live} />
            <span className={styles.dash} aria-hidden="true">
              &ndash;
            </span>
            <span className="visually-hidden">to</span>
            <LiveNumber
              value={result.oneTimeHigh}
              format={formatMoney}
              suffix={result.isOpenEnded ? '+' : ''}
              className={styles.live}
            />
          </>
        )}
        {!compact && (
          <span className={styles.totalUnit}>{allCustom ? 'fixed quote after a 20-min scoping call' : 'one-time'}</span>
        )}
      </div>

      {compact ? (
        <p className={styles.compactLines}>
          {result.lines.map((line, index) => (
            <span key={line.service}>
              {index > 0 && ' · '}
              <strong>{line.tierName}</strong> {'·'} {linePrice(line)}
            </span>
          ))}
          {monthly && (
            <>
              {' · '}
              <span className={styles.monthlyValue}>+ {monthly}</span>
            </>
          )}
        </p>
      ) : (
        <>
          <ul className={styles.lines}>
            {result.lines.map((line) => (
              <li key={line.service}>
                <strong>{line.tierName}</strong>
                {' · '}
                {linePrice(line)}
                {multi && <span className={styles.lineService}> {'·'} {line.serviceName}</span>}
              </li>
            ))}
          </ul>

          {monthly && (
            <p className={styles.monthly}>
              <span className={styles.monthlyValue}>+ {monthly}</span>
              {' · '}
              {result.monthly.map((line) => line.name).join(' + ')}
            </p>
          )}
        </>
      )}
    </div>
  );
}

interface BreakdownProps {
  result: EstimateResult;
  input: EstimateInput;
  placement: SummaryPlacement;
  /** The sheet head already carries the scoping-call CTA. */
  showContinue?: boolean;
}

export function EstimateBreakdown({ result, input, placement, showContinue = true }: BreakdownProps) {
  const continueHref = estimateHref(input, { path: '/contact-us', hash: null });
  const featureCount = result.lines.reduce((sum, line) => sum + line.features.length, 0);

  return (
    <>
      <div>
        <h3 className={styles.subhead}>What drove this</h3>
        <ol className={styles.drivers}>
          {result.drivers.map((driver, index) => (
            <li key={`${driver.kind}-${driver.service ?? 'all'}-${index}`}>
              <span className={styles.tag} aria-hidden="true">
                {TAG[driver.kind]}
              </span>
              <span>{driver.text}</span>
            </li>
          ))}
        </ol>
        <ul className={styles.notes}>
          {result.notes.map((note) => (
            <li key={note}>{note}.</li>
          ))}
        </ul>
      </div>

      <div className={styles.bundle} hidden={!result.bundle}>
        <span className={styles.eyebrow}>Partner bundles</span>
        {result.bundle && (
          <>
            <span>
              <span className={styles.bundleName}>{result.bundle.name}</span> covers {result.lines.length} service lines as
              one monthly partnership:{' '}
              <span className={styles.bundlePrice}>{formatRange(result.bundle.low, result.bundle.high)} / month</span>.
            </span>
            <a href="#bundles" className={styles.bundleLink} data-cta-placement={`pricing_${placement}_bundles`}>
              Compare both bundles
            </a>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <SendEstimateForm result={result} placement={placement} />
        {showContinue && (
          <Cta href={continueHref} variant="secondary" block placement={`pricing_${placement}_continue`}>
            Continue to scoping call
          </Cta>
        )}
      </div>

      <details className={styles.features} open={placement === 'sheet' || undefined}>
        <summary className={styles.featuresSummary}>
          <span>What&apos;s included ({featureCount})</span>
        </summary>
        {result.lines.map((line) => (
          <div key={line.service} className={styles.featureGroup}>
            <h4>
              {line.tierName} {'·'} {line.serviceName}
            </h4>
            <ul>
              {line.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </details>
    </>
  );
}

interface SummaryProps {
  result: EstimateResult;
  input: EstimateInput;
}

/** Desktop rail / inline mobile summary: headline + breakdown in one surface. */
export default function EstimateSummary({ result, input }: SummaryProps) {
  return (
    <section className={styles.summary} aria-label="Your estimate">
      <EstimateHeadline result={result} totalId="estimate-total" />
      <div className={styles.divider} aria-hidden="true" />
      <EstimateBreakdown result={result} input={input} placement="rail" />
    </section>
  );
}
