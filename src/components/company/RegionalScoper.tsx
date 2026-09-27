'use client';

import { useId, useState } from 'react';
import {
  ESTIMATE_SERVICES,
  FIXED_QUOTE_NOTE,
  SERVICE_META,
  SIZE_OPTIONS,
  SUPPORT_LEVELS,
  estimate,
  estimateHref,
  formatEstimateMonthly,
  formatMoney,
  supportLineFor,
  type EstimateInput,
  type EstimateService,
  type EstimateSize,
  type SizeKey,
  type SupportLevel,
} from '@/lib/estimate';
import LiveNumber from '@/components/ui/LiveNumber';
import Cta from './Cta';
import styles from './RegionalScoper.module.scss';

/**
 * Per-market mini-scoper (3 inputs, live range - interaction #7). Every number
 * comes from the shared estimate engine over `pricing`; nothing is invented.
 * The "Refine" CTA carries the same state to /pricing#estimator via the
 * engine's URL encoding. Prices stay in USD: no FX source exists in the repo,
 * so no indicative local-currency line is shown.
 */

export interface RegionalScoperProps {
  defaultService: EstimateService;
  /** `nigeria` / `jamaica` - prefix for data-cta-placement. */
  placementPrefix: string;
  /** Country name for the currency note. */
  country: string;
}

const DEFAULT_SIZES = Object.fromEntries(
  ESTIMATE_SERVICES.map((service) => [service, SIZE_OPTIONS[service][0].key]),
) as Record<EstimateService, SizeKey>;

export default function RegionalScoper({ defaultService, placementPrefix, country }: RegionalScoperProps) {
  const [service, setService] = useState<EstimateService>(defaultService);
  const [sizes, setSizes] = useState<Record<EstimateService, SizeKey>>(DEFAULT_SIZES);
  const [support, setSupport] = useState<SupportLevel>('none');
  const baseId = useId();

  const input: EstimateInput = {
    services: [service],
    size: { [service]: sizes[service] } as EstimateSize,
    toggles: {},
    support,
    timeline: 'standard',
  };
  const result = estimate(input);
  const line = result.lines[0];
  const monthly = formatEstimateMonthly(result);
  const showHigh = result.oneTimeHigh !== null && result.oneTimeHigh > result.oneTimeLow;
  const openEnded = result.oneTimeHigh === null || result.isOpenEnded;

  const serviceGroupId = `${baseId}-service`;
  const sizeGroupId = `${baseId}-size`;
  const supportGroupId = `${baseId}-support`;
  const outputId = `${baseId}-range`;

  return (
    <div className={styles.scoper}>
      <div className={styles.groups}>
        <div className={styles.group} role="group" aria-labelledby={serviceGroupId}>
          <p id={serviceGroupId} className={styles.groupLabel}>
            1 · Service line
          </p>
          <div className={styles.chips}>
            {ESTIMATE_SERVICES.map((key) => (
              <button
                key={key}
                type="button"
                className={styles.chip}
                aria-pressed={key === service}
                onClick={() => setService(key)}
                data-cursor="estimate"
              >
                {SERVICE_META[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Every size group is in the HTML; only the active service's group is shown. */}
        {ESTIMATE_SERVICES.map((key) => (
          <div
            key={key}
            className={styles.group}
            role="group"
            aria-labelledby={`${sizeGroupId}-${key}`}
            hidden={key !== service}
          >
            <p id={`${sizeGroupId}-${key}`} className={styles.groupLabel}>
              2 · Size · {SERVICE_META[key].label}
            </p>
            <div className={styles.chips}>
              {SIZE_OPTIONS[key].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={styles.chip}
                  aria-pressed={sizes[key] === option.key}
                  onClick={() => setSizes((prev) => ({ ...prev, [key]: option.key }))}
                  data-cursor="estimate"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.group} role="group" aria-labelledby={supportGroupId}>
          <p id={supportGroupId} className={styles.groupLabel}>
            3 · Ongoing support
          </p>
          <div className={styles.chips}>
            {SUPPORT_LEVELS.map((level) => {
              const supportLine = supportLineFor(service, level.key);
              return (
                <button
                  key={level.key}
                  type="button"
                  className={styles.chip}
                  aria-pressed={level.key === support}
                  onClick={() => setSupport(level.key)}
                  data-cursor="estimate"
                >
                  <span>{level.label}</span>
                  {supportLine ? <span className={styles.chipHint}>{supportLine.priceLabel}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.summary}>
        <p className={styles.summaryLabel}>Estimated range · USD</p>
        {line?.isCustom ? (
          <p className={styles.range} id={outputId}>
            Custom
          </p>
        ) : (
          <p className={styles.range}>
            <LiveNumber id={outputId} value={result.oneTimeLow} format={formatMoney} />
            {showHigh ? (
              <>
                <span className={styles.rangeSep} aria-hidden="true">
                  –
                </span>
                <LiveNumber value={result.oneTimeHigh ?? result.oneTimeLow} format={formatMoney} suffix={openEnded ? '+' : ''} />
              </>
            ) : openEnded ? (
              <span aria-hidden="true">+</span>
            ) : null}
          </p>
        )}
        {monthly ? <p className={styles.monthly}>+ {monthly} ongoing</p> : null}

        <ul className={styles.drivers} aria-label="What drove this estimate">
          {result.drivers.map((driver, index) => (
            <li key={`${driver.kind}-${index}`}>{driver.text}</li>
          ))}
        </ul>

        <p className={styles.note}>{FIXED_QUOTE_NOTE}.</p>
        <p className={styles.fine}>
          Prices are published in USD and are the same tiers MAPL TECH quotes everywhere; the fixed quote for {country} follows the scoping call.
        </p>

        <div className={styles.actions}>
          <Cta placement={`${placementPrefix}_scoper_refine`} href={estimateHref(input)}>
            Refine on the pricing page
          </Cta>
          <Cta placement={`${placementPrefix}_scoper_call`} href="/contact-us" variant="secondary">
            Continue to scoping call
          </Cta>
        </div>
      </div>
    </div>
  );
}
