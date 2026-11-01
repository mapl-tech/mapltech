'use client';

import { useId, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
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
  type EstimateInput,
  type EstimateLine,
  type EstimateService,
} from '@/lib/estimate';
import Cta from '@/components/home/Cta';
import { HERO_ESTIMATE, PRIMARY_CTA } from './content';
import styles from './HeroEstimate.module.scss';

/**
 * The hero's product: a working price check. The price leads (a published
 * range for the default choice, before any input), the one filled button sits
 * under it, and the two inputs that drive it (what, how big) follow. They run
 * through the same engine as the pricing page, so the range is the published
 * tier price, never a teaser; the button carries both choices into the full
 * estimator.
 *
 * Accessibility: native radios and a native range input (arrow keys, value
 * text for assistive tech). The springing digits are visual only; one status
 * line announces the composed range after each change. Without JavaScript the
 * form still submits to the estimator.
 */

function inputFor(service: EstimateService, sizeIndex: number): Partial<EstimateInput> {
  const size = SIZE_OPTIONS[service][sizeIndex];
  return { services: [service], size: { [service]: size.key }, support: 'none', timeline: 'standard' };
}

/** Lower-cases a leading capital mid-sentence, leaving acronyms alone ("AI agents"). */
function midSentence(text: string): string {
  return /^[A-Z][a-z]/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

/** The announcement after each change, in the words on screen: "Web Development, up to 7 pages: $5,000 to $8,500." */
function spoken(selection: string, line: EstimateLine): string {
  if (line.isCustom || line.low === null) return `${selection}: custom quote.`;
  const upper = line.high === null ? ' and up' : ` to ${formatMoney(line.high)}${line.isOpenEnded ? ' and up' : ''}`;
  return `${selection}: ${formatMoney(line.low)}${upper}.`;
}

/** Settles in about 0.4s, so a jump (say to an open-ended $20,000+) barely shows the figures in between. */
const RANGE_SPRING = { stiffness: 260, damping: 30, mass: 0.6 };

/** Line icons for the four services: 24px grid, stroke drawn by CSS. */
const ICONS: Record<EstimateService, ReactNode> = {
  web: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M3 9h18M6.5 6.75h.01M9 6.75h.01" />
    </>
  ),
  automation: (
    <>
      <circle cx="5.5" cy="12" r="2.5" />
      <circle cx="18.5" cy="6" r="2.5" />
      <circle cx="18.5" cy="18" r="2.5" />
      <path d="M8 12h3.5a3 3 0 0 0 3-3V7.5A1.5 1.5 0 0 1 16 6M11.5 12a3 3 0 0 1 3 3v1.5a1.5 1.5 0 0 0 1.5 1.5" />
    </>
  ),
  tools: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="4" rx="1.5" />
      <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  cloud: <path d="M7 18.5h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 6.9 9.6 4.5 4.5 0 0 0 7 18.5Z" />,
};

export default function HeroEstimate({ className }: { className?: string }) {
  const id = useId();
  const router = useRouter();
  const [service, setService] = useState<EstimateService>(HERO_ESTIMATE.openingService);
  const [sizeIndex, setSizeIndex] = useState(0);
  // Counts choices; each one replays a small nudge on the button above them.
  const [nudges, setNudges] = useState(0);

  const sizes = SIZE_OPTIONS[service];
  const size = sizes[sizeIndex];
  const input = inputFor(service, sizeIndex);
  const line = estimate(input).lines[0];
  const href = estimateHref(input);
  const fill = sizes.length > 1 ? sizeIndex / (sizes.length - 1) : 0;
  const custom = line.isCustom || line.low === null;
  const selection = `${SERVICE_META[service].label}, ${midSentence(size.label)}`;

  const chooseService = (next: EstimateService) => {
    setService(next);
    setSizeIndex(0);
    setNudges((n) => n + 1);
  };

  const chooseSize = (next: number) => {
    setSizeIndex(next);
    setNudges((n) => n + 1);
  };

  // With JavaScript, open the estimator with both choices in the URL; without
  // it, the plain GET submit still lands on the estimator.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(href);
  };

  return (
    <form
      className={`${styles.card} ${className ?? ''}`.trim()}
      action={PRIMARY_CTA.href}
      method="get"
      onSubmit={onSubmit}
      aria-labelledby={`${id}-title`}
    >
      <div className={styles.head}>
        <h2 id={`${id}-title`} className={styles.title}>
          {HERO_ESTIMATE.title}
        </h2>
        <p className={styles.meta}>{HERO_ESTIMATE.meta}</p>
      </div>

      <div className={styles.result}>
        <p className={styles.resultLabel}>{selection}</p>
        <p className={styles.range} aria-hidden="true">
          {custom ? (
            <span>{HERO_ESTIMATE.customLabel}</span>
          ) : (
            <>
              <LiveNumber value={line.low ?? 0} format={formatMoney} spring={RANGE_SPRING} decorative />
              {line.high !== null ? (
                <>
                  <span className={styles.dash}>–</span>
                  <LiveNumber value={line.high} format={formatMoney} spring={RANGE_SPRING} decorative />
                </>
              ) : null}
              {line.isOpenEnded || line.high === null ? <span className={styles.plus}>+</span> : null}
            </>
          )}
        </p>
        <p className="visually-hidden" role="status">
          {spoken(selection, line)}
        </p>
        <p className={styles.note}>{FIXED_QUOTE_NOTE}</p>
      </div>

      <Cta
        placement="home_hero_estimate"
        hero
        type="submit"
        size="large"
        boxClassName={`${styles.submit} ${nudges === 0 ? '' : nudges % 2 ? styles.nudgeA : styles.nudgeB}`.trim()}
      >
        {PRIMARY_CTA.label}
        <span aria-hidden="true" className={styles.arrow}>
          →
        </span>
      </Cta>

      {/* Price first (on phones the range and the button land in the first
          screen); the choices that drive it sit underneath. */}
      <div className={styles.controls}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>{HERO_ESTIMATE.serviceLegend}</legend>
          <div className={styles.services}>
            {ESTIMATE_SERVICES.map((key) => (
              <label key={key} className={styles.service} data-on={key === service ? 'true' : 'false'}>
                <input
                  type="radio"
                  name="svc"
                  value={key}
                  checked={key === service}
                  onChange={() => chooseService(key)}
                  className={styles.radio}
                />
                <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  {ICONS[key]}
                </svg>
                <span className={styles.serviceName}>{SERVICE_META[key].label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.group}>
          <div className={styles.sizeHead}>
            <label htmlFor={`${id}-size`} className={styles.legend}>
              {HERO_ESTIMATE.sizeLegend}
            </label>
            <span className={styles.sizeValue} aria-hidden="true">
              {size.label}
            </span>
          </div>
          <input
            id={`${id}-size`}
            type="range"
            min={0}
            max={sizes.length - 1}
            step={1}
            value={sizeIndex}
            onChange={(event) => chooseSize(Number(event.target.value))}
            aria-valuetext={size.label}
            className={styles.slider}
            style={{ '--fill': fill } as CSSProperties}
          />
          <div className={styles.ticks} aria-hidden="true">
            {sizes.map((option, i) => (
              <span key={option.key} className={styles.tick} data-on={i <= sizeIndex ? 'true' : 'false'} />
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
