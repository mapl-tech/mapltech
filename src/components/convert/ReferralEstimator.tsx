'use client';

import { useId, useState } from 'react';
import LiveNumber from '@/components/ui/LiveNumber';
import {
  ESTIMATE_SERVICES,
  SERVICE_META,
  formatMoney,
  parsePriceLabel,
  tiersFor,
  typicalProjectValue,
  type EstimateService,
} from '@/lib/estimate';
import { keepHyphens, priceText } from '@/components/pricing/content';
import { setReferralChoice } from '@/components/pricing/referralChoice';
import styles from './ReferralEstimator.module.scss';

/**
 * The referral page's one interaction: two inputs, one live figure.
 * Introductions a year × the typical project value of the work they need
 * (the middle tier of each service line in site.ts, via the shared engine)
 * = project value introduced per year, in teal. The bonus line keeps the
 * live page's wording and states no amount, because none is published; the
 * figure is labelled as project value, never as earnings.
 */

const MIN = 1;
const MAX = 12;
const DEFAULT = 3;

/**
 * LiveNumber's default spring rests at restDelta 0.01, which on five-figure
 * values leaves the digits a dollar short for a beat; a coarser rest
 * threshold snaps the final frame to the exact total.
 */
const OUTPUT_SPRING = { stiffness: 120, damping: 22, mass: 0.6, restDelta: 0.5, restSpeed: 2 };

const clamp = (n: number): number => Math.min(MAX, Math.max(MIN, n));

/**
 * The middle tier the typical project value is taken from (the hint says
 * so once): "Growth / E-Commerce", or for a range tier its range too,
 * "Production Infrastructure, $10,000–$18,000" (the value is its midpoint).
 * Tier names keep their hyphens unbroken, as on /pricing.
 */
function basisOf(service: EstimateService): string {
  const tier = tiersFor(service)[Math.min(1, tiersFor(service).length - 1)];
  const parsed = parsePriceLabel(tier.price);
  const range = parsed.high !== null && parsed.high !== parsed.low;
  return `${keepHyphens(tier.name)}${range ? `, ${priceText(tier.price)}` : ''}`;
}

export default function ReferralEstimator({ signupId = 'signup' }: { signupId?: string }) {
  const uid = useId();
  const [count, setCount] = useState(DEFAULT);
  // What the field shows while someone types; null shows the count itself.
  const [draft, setDraft] = useState<string | null>(null);
  const [service, setService] = useState<EstimateService>('web');

  const value = typicalProjectValue(service);
  const total = count * value;
  const countId = `${uid}-count`;
  const outputId = `${uid}-output`;
  const serviceIds = ESTIMATE_SERVICES.map((svc) => `${uid}-svc-${svc}`);

  const servicesHintId = `${uid}-svc-hint`;

  const atMin = count <= MIN;
  const atMax = count >= MAX;

  const commit = (next: number) => {
    setCount(clamp(next));
    setDraft(null);
  };
  const bump = (delta: number) => commit(count + delta);

  // The field, the figure and the formula always agree: an out-of-range
  // entry is clamped as it is typed (99 becomes 12), and an emptied field
  // keeps the last count until something valid is typed or it loses focus.
  const onCountChange = (text: string) => {
    const n = Number.parseInt(text, 10);
    if (!Number.isFinite(n)) {
      setDraft(text);
      return;
    }
    if (n < MIN || n > MAX) {
      commit(n);
      return;
    }
    setCount(n);
    setDraft(text);
  };
  const pick = (svc: EstimateService) => {
    setService(svc);
    setReferralChoice(svc);
  };

  return (
    // A form of controls with an output (nothing is sent): Enter in the count
    // settles the value instead of reloading, and the shared mobile bar,
    // which yields to forms, never covers the calculator.
    <form
      className={styles.instrument}
      aria-label="Referral calculator"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setDraft(null);
      }}
    >
      <div className={styles.inputs}>
        <div className={styles.field}>
          <label htmlFor={countId} className={styles.label}>
            Introductions a year
          </label>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepButton}
              onClick={() => {
                if (!atMin) bump(-1);
              }}
              aria-disabled={atMin || undefined}
              aria-controls={countId}
              aria-label="One fewer introduction"
            >
              <span aria-hidden="true">−</span>
            </button>
            <input
              id={countId}
              className={styles.count}
              type="number"
              inputMode="numeric"
              min={MIN}
              max={MAX}
              step={1}
              value={draft ?? String(count)}
              aria-describedby={`${uid}-count-hint`}
              onChange={(event) => onCountChange(event.target.value)}
              onBlur={() => setDraft(null)}
            />
            <button
              type="button"
              className={styles.stepButton}
              onClick={() => {
                if (!atMax) bump(1);
              }}
              aria-disabled={atMax || undefined}
              aria-controls={countId}
              aria-label="One more introduction"
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
          <p id={`${uid}-count-hint`} className={styles.hint}>
            Between {MIN} and {MAX}.
          </p>
        </div>

        <fieldset className={styles.fieldset} aria-describedby={servicesHintId}>
          <legend className={styles.label}>What they mostly need</legend>
          <div className={styles.services}>
            {ESTIMATE_SERVICES.map((svc, index) => {
              const checked = service === svc;
              return (
                <label key={svc} className={styles.tile} data-checked={checked || undefined}>
                  <input
                    id={serviceIds[index]}
                    className={styles.native}
                    type="radio"
                    name={`${uid}-svc`}
                    value={svc}
                    checked={checked}
                    onChange={() => pick(svc)}
                  />
                  <span className={styles.radio} aria-hidden="true" />
                  <span className={styles.tileName}>{SERVICE_META[svc].label}</span>
                  <span className={styles.tileMeta}>{formatMoney(typicalProjectValue(svc))}</span>
                </label>
              );
            })}
          </div>
          <p id={servicesHintId} className={styles.servicesHint}>
            Typical project value for each, taken from our middle tier.
          </p>
        </fieldset>
      </div>

      <div className={styles.output}>
        <span className={styles.frame} aria-hidden="true" />
        <div className={styles.card}>
          <label htmlFor={outputId} className={styles.outputLabel}>
            Project value you would introduce, per year
          </label>
          <LiveNumber
            id={outputId}
            value={total}
            format={formatMoney}
            spring={OUTPUT_SPRING}
            className={styles.total}
            htmlFor={[countId, ...serviceIds].join(' ')}
          />
          {/* The same sum as text, for crawlers, no-JS and anyone checking the maths. */}
          <p className={styles.formula}>
            {count} {count === 1 ? 'introduction' : 'introductions'} × {formatMoney(value)} typical project value ({basisOf(service)}).
          </p>
          <div className={styles.bonus}>
            <p className={styles.bonusLabel}>Your bonus</p>
            <p className={styles.bonusText}>
              A referral bonus for each agency that becomes a client. It is separate from the figure above.
            </p>
          </div>
          <a href={`#${signupId}`} className={styles.primary} data-cta-placement="referral_estimator_cta">
            Refer an agency
          </a>
        </div>
      </div>
    </form>
  );
}
