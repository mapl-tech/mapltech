'use client';

import { useState } from 'react';
import LiveNumber from '@/components/ui/LiveNumber';
import { ESTIMATE_SERVICES, SERVICE_META, formatMoney, tiersFor, typicalProjectValue, type EstimateService } from '@/lib/estimate';
import Cta from './Cta';
import forms from './forms.module.scss';
import styles from './ReferralEstimator.module.scss';

/**
 * Referral PEAK (brief §2.9, interaction #7): two inputs, one live figure.
 * referrals per year × typical project value (midpoint of each service's
 * middle tier in site.ts) → project value introduced per year, in teal.
 * The reward line keeps the current page's wording: a referral bonus when
 * the introduction becomes a client. No percentage is stated because none
 * is published.
 */

const MIN = 1;
const MAX = 12;
const DEFAULT = 3;

/**
 * LiveNumber's default spring rests at restDelta 0.01, which on five-figure
 * values leaves the digits one dollar short for a beat; a coarser rest
 * threshold snaps the final frame to the exact total.
 */
const OUTPUT_SPRING = { stiffness: 120, damping: 22, mass: 0.6, restDelta: 0.5, restSpeed: 2 };

function clampCount(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return DEFAULT;
  return Math.min(MAX, Math.max(MIN, n));
}

export default function ReferralEstimator({ signupId = 'signup' }: { signupId?: string }) {
  const [raw, setRaw] = useState(String(DEFAULT));
  const [service, setService] = useState<EstimateService>('web');

  const referrals = clampCount(raw);
  const value = typicalProjectValue(service);
  const total = referrals * value;
  const serviceIds = ESTIMATE_SERVICES.map((svc) => `ref-svc-${svc}`).join(' ');

  const bump = (delta: number) => setRaw(String(Math.min(MAX, Math.max(MIN, referrals + delta))));

  return (
    <div className={styles.estimator}>
      <div className={styles.inputs}>
        <fieldset className={forms.fieldset}>
          <legend className={forms.legend}>Referrals per year</legend>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => bump(-1)}
              disabled={referrals <= MIN}
              aria-label="Fewer referrals"
            >
              −
            </button>
            <input
              id="ref-count"
              type="number"
              inputMode="numeric"
              min={MIN}
              max={MAX}
              step={1}
              className={`${forms.input} ${styles.count}`}
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              onBlur={() => setRaw(String(referrals))}
              aria-label="Referrals per year"
            />
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => bump(1)}
              disabled={referrals >= MAX}
              aria-label="More referrals"
            >
              +
            </button>
          </div>
          <p className={forms.hint}>
            {MIN} to {MAX} introductions a year.
          </p>
        </fieldset>

        <fieldset className={forms.fieldset}>
          <legend className={forms.legend}>Typical project value</legend>
          <div className={forms.chips}>
            {ESTIMATE_SERVICES.map((svc) => (
              <label key={svc} className={`${forms.chip} ${forms.chipCard}`}>
                <input
                  id={`ref-svc-${svc}`}
                  type="radio"
                  name="service"
                  value={svc}
                  className="visually-hidden"
                  checked={service === svc}
                  onChange={() => setService(svc)}
                />
                <span>{SERVICE_META[svc].label}</span>
                <span className={forms.chipSub}>{formatMoney(typicalProjectValue(svc))}</span>
              </label>
            ))}
          </div>
          <p className={forms.hint}>
            Midpoint of each service&apos;s middle tier:{' '}
            {ESTIMATE_SERVICES.map((svc, i) => {
              const tier = tiersFor(svc)[1];
              return (
                <span key={svc}>
                  {i > 0 ? ' · ' : ''}
                  {tier.name} {tier.price}
                </span>
              );
            })}
            .
          </p>
        </fieldset>
      </div>

      <div className={styles.output}>
        <p className={styles.outputLabel} id="ref-output-label">
          Project value introduced per year
        </p>
        <LiveNumber
          id="ref-output"
          value={total}
          format={formatMoney}
          spring={OUTPUT_SPRING}
          className={`${styles.outputValue} signal`}
          htmlFor={`ref-count ${serviceIds}`}
        />
        {/* The same formula as text, for crawlers and no-JS */}
        <p className={styles.formula}>
          {referrals} {referrals === 1 ? 'referral' : 'referrals'} × {formatMoney(value)} = {formatMoney(total)} of
          project value introduced.
        </p>
        <p className={styles.reward}>
          When they become a client, you earn a referral bonus for making the introduction.
        </p>
        <div className={styles.outputCta}>
          <Cta placement="referral_estimator_cta" href={`#${signupId}`} size="medium">
            Refer an agency
          </Cta>
        </div>
      </div>
    </div>
  );
}
