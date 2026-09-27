'use client';

import { useId, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LiveNumber from '@/components/ui/LiveNumber';
import {
  ESTIMATE_SERVICES,
  FIXED_QUOTE_NOTE,
  SERVICE_META,
  SIZE_OPTIONS,
  estimate,
  estimateHref,
  formatMoney,
  formatRange,
  supportLineFor,
  type EstimateInput,
  type EstimateService,
  type EstimateSize,
  type SizeKey,
} from '@/lib/estimate';
import Cta from './Cta';
import styles from './EstimateTeaser.module.scss';

/**
 * 07 Estimate teaser: three inputs (service, size, retainer) mapped through
 * the shared engine in src/lib/estimate.ts to a live range (interaction #7).
 * The range springs between values via LiveNumber; the final figures are
 * also in the SSR HTML. "Refine" carries the state to /pricing#estimator.
 */

interface TeaserState {
  service: EstimateService;
  size: SizeKey;
  support: 'none' | 'light';
}

const INITIAL: TeaserState = { service: 'web', size: 'starter', support: 'none' };

function toInput(state: TeaserState): Partial<EstimateInput> {
  const size: EstimateSize = {};
  (size as Record<EstimateService, SizeKey>)[state.service] = state.size;
  return { services: [state.service], size, support: state.support, timeline: 'standard' };
}

export default function EstimateTeaser() {
  const id = useId();
  const router = useRouter();
  const [state, setState] = useState<TeaserState>(INITIAL);
  // Phones: the breakdown collapses under the range (list stays in the DOM, `hidden`).
  const [driversOpen, setDriversOpen] = useState(false);
  const driversId = `${id}-drivers`;

  const input = toInput(state);
  const result = estimate(input);
  const line = result.lines[0];
  const href = estimateHref(input);
  const lightLine = supportLineFor(state.service, 'light');
  const drivers = result.drivers.filter((driver) => driver.kind !== 'timeline');

  const selectService = (service: EstimateService) =>
    setState((prev) => ({ ...prev, service, size: SIZE_OPTIONS[service][0].key }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} aria-label="Scope estimate">
      <div className={styles.inputs}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            <span className={styles.legendIndex}>1.</span> Service
          </legend>
          <div className={styles.chips}>
            {ESTIMATE_SERVICES.map((service) => (
              <label key={service} className={styles.chip} data-on={state.service === service ? 'true' : 'false'}>
                <input
                  type="radio"
                  name={`${id}-service`}
                  value={service}
                  checked={state.service === service}
                  onChange={() => selectService(service)}
                  className="visually-hidden"
                />
                {SERVICE_META[service].label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            <span className={styles.legendIndex}>2.</span> Size
          </legend>
          <div className={styles.chips}>
            {SIZE_OPTIONS[state.service].map((option) => (
              <label key={option.key} className={styles.chip} data-on={state.size === option.key ? 'true' : 'false'}>
                <input
                  type="radio"
                  name={`${id}-size`}
                  value={option.key}
                  checked={state.size === option.key}
                  onChange={() => setState((prev) => ({ ...prev, size: option.key }))}
                  className="visually-hidden"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            <span className={styles.legendIndex}>3.</span> Ongoing retainer
          </legend>
          <div className={styles.chips}>
            <label className={styles.chip} data-on={state.support === 'none' ? 'true' : 'false'}>
              <input
                type="radio"
                name={`${id}-support`}
                value="none"
                checked={state.support === 'none'}
                onChange={() => setState((prev) => ({ ...prev, support: 'none' }))}
                className="visually-hidden"
              />
              No
            </label>
            {lightLine ? (
              <label className={styles.chip} data-on={state.support === 'light' ? 'true' : 'false'}>
                <input
                  type="radio"
                  name={`${id}-support`}
                  value="light"
                  checked={state.support === 'light'}
                  onChange={() => setState((prev) => ({ ...prev, support: 'light' }))}
                  className="visually-hidden"
                />
                Yes · {lightLine.name}, {lightLine.priceLabel}
              </label>
            ) : null}
          </div>
        </fieldset>

        <p className={styles.footnote}>
          Every option maps to a tier on our pricing page, where the full tables live as plain HTML.
        </p>
      </div>

      <aside className={styles.summary} aria-label="Your range">
        <p className={styles.summaryLabel}>Your range</p>
        <p className={styles.range}>
          {line.isCustom ? (
            <span className={styles.live}>Custom</span>
          ) : (
            <>
              <LiveNumber value={line.low ?? 0} format={formatMoney} className={styles.live} />
              {line.high !== null ? (
                <>
                  <span className={styles.dash} aria-hidden="true">
                    –
                  </span>
                  <LiveNumber value={line.high} format={formatMoney} className={styles.live} />
                </>
              ) : null}
              {line.isOpenEnded ? <span className={styles.live}>+</span> : null}
            </>
          )}
        </p>
        <p className={styles.tier}>
          {line.serviceName} · {line.tierName} · {FIXED_QUOTE_NOTE}
        </p>
        {result.monthly.length > 0 ? (
          <p className={styles.monthly}>
            + <span className={styles.liveSmall}>{formatRange(result.monthlyLow, result.monthlyHigh)} / month</span> ·{' '}
            {result.monthly[0].name}
          </p>
        ) : null}

        <div className={styles.drivers} data-open={driversOpen ? 'true' : 'false'}>
          <p className={styles.driversLabel}>What drove this</p>
          <button
            type="button"
            className={styles.driversToggle}
            aria-expanded={driversOpen}
            aria-controls={driversId}
            onClick={() => setDriversOpen((open) => !open)}
          >
            What drove this
            <span aria-hidden="true">{driversOpen ? '−' : '+'}</span>
          </button>
          <ul id={driversId} className={styles.driversList}>
            {drivers.map((driver) => (
              <li key={driver.text}>{driver.text}</li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <Cta placement="home_estimate_refine" href={href} size="medium" cursor="estimate">
            Refine on the pricing page
          </Cta>
          <Link href="/contact-us" className={styles.callLink} data-cta-placement="home_estimate_call">
            or book a 20-min scoping call
          </Link>
        </div>
      </aside>
    </form>
  );
}
