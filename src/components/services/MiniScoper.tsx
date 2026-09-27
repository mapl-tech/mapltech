'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import BottomSheet from '@/components/ui/BottomSheet';
import LiveNumber from '@/components/ui/LiveNumber';
import {
  FIXED_QUOTE_NOTE,
  SIZE_OPTIONS,
  SUPPORT_LEVELS,
  TOGGLE_OPTIONS,
  encodeEstimateParams,
  estimate,
  estimateHref,
  formatEstimateMonthly,
  formatMoney,
  formatRange,
  normalizeEstimateInput,
  parsePriceLabel,
  supportLineFor,
  tiersFor,
  type EstimateInput,
  type EstimateResult,
  type EstimateService,
  type EstimateSize,
  type EstimateToggles,
  type SizeKey,
  type SupportLevel,
  type ToggleKey,
} from '@/lib/estimate';
import Cta from './Cta';
import { prettyPrice, type ScoperLegends } from './serviceCopy';
import styles from './MiniScoper.module.scss';

export interface MiniScoperProps {
  id?: string;
  service: EstimateService;
  /** Service slug for analytics placements. */
  slug: string;
  eyebrow: string;
  heading: string;
  intro: string;
  legends: ScoperLegends;
}

interface SupportChoice {
  level: SupportLevel;
  label: string;
}

/** Support chips labelled with the real maintenance/retainer line. Tools and cloud have two lines, so duplicates collapse. */
function supportChoices(service: EstimateService): SupportChoice[] {
  const seen = new Set<string>();
  const out: SupportChoice[] = [];
  for (const level of SUPPORT_LEVELS) {
    if (level.key === 'none') {
      out.push({ level: 'none', label: 'None' });
      continue;
    }
    const line = supportLineFor(service, level.key);
    if (!line || seen.has(line.name)) continue;
    seen.add(line.name);
    out.push({ level: level.key, label: `${line.name} · ${formatRange(line.low, line.high)}/mo` });
  }
  return out;
}

/** One sentence under the range explaining which tier(s) bound it. */
function tierSubline(result: EstimateResult): string {
  const line = result.lines[0];
  if (!line) return '';
  if (line.isCustom) return `${line.tierName}: ${FIXED_QUOTE_NOTE.toLowerCase()}`;
  if (line.startingAt) {
    const next = tiersFor(line.service)[line.tierIndex + 1];
    const nextIsCustom = !next || parsePriceLabel(next.price).isCustom;
    return nextIsCustom
      ? `${line.tierName} starting price; the upper bound is scoped individually`
      : `${line.tierName} starting price to ${next.name} starting price`;
  }
  return `${line.tierName} · ${prettyPrice(line.priceLabel)}`;
}

/** Mirror the current choices into the URL (write-only, no navigation). */
function mirrorToUrl(input: EstimateInput) {
  if (typeof window === 'undefined') return;
  const query = encodeEstimateParams(input);
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(window.history.state, '', url);
}

/**
 * Live range (interaction #7). SSR renders the final formatted numbers as
 * text; on the client each figure springs to its new value inside
 * <output aria-live="polite">. Teal is reserved for this live value.
 */
function RangeOutput({ result, className }: { result: EstimateResult; className?: string }) {
  const line = result.lines[0];
  if (!line || line.isCustom) {
    return (
      <output aria-live="polite" className={className}>
        Custom
      </output>
    );
  }
  const low = result.oneTimeLow;
  const high = result.oneTimeHigh;
  const showHigh = high !== null && high > low;
  return (
    <span className={className}>
      <LiveNumber value={low} format={formatMoney} suffix={high === null ? '+' : ''} />
      {showHigh ? (
        <>
          <span aria-hidden="true" className={styles.dash}>
            –
          </span>
          <LiveNumber value={high} format={formatMoney} suffix={result.isOpenEnded ? '+' : ''} />
        </>
      ) : null}
    </span>
  );
}

interface SummaryProps {
  result: EstimateResult;
  refineHref: string;
  callHref: string;
  slug: string;
  /** Rendered inside the bottom sheet (mobile): the range is already in the sheet header. */
  compact?: boolean;
}

function Summary({ result, refineHref, callHref, slug, compact = false }: SummaryProps) {
  const monthly = formatEstimateMonthly(result);
  const drivers = result.drivers.filter((driver) => driver.kind !== 'timeline');
  const place = compact ? 'sheet' : 'summary';

  return (
    <>
      {!compact ? (
        <>
          <p className={styles.summaryLabel}>
            Your range <span className={styles.live}>live</span>
          </p>
          <RangeOutput result={result} className={styles.range} />
        </>
      ) : null}
      <p className={styles.tierLine}>{tierSubline(result)}</p>
      {monthly && result.monthly[0] ? (
        <p className={styles.monthly}>
          + {monthly} · {result.monthly[0].name}
        </p>
      ) : null}

      <p className={styles.driversLabel}>What drove this</p>
      <ul className={styles.drivers}>
        {drivers.map((driver) => (
          <li key={driver.text}>{driver.text}</li>
        ))}
      </ul>

      {result.notes.map((note) => (
        <p key={note} className={styles.note}>
          {note}.
        </p>
      ))}

      <div className={styles.ctas}>
        <Cta href={refineHref} placement={`${slug}_scoper_${place}_refine`} cursor="estimate" boxClassName={styles.ctaBox}>
          Refine on the pricing page
        </Cta>
        <Link href={callHref} className={styles.textLink} data-cta-placement={`${slug}_scoper_${place}_call`}>
          Book a 20-min scoping call →
        </Link>
      </div>
    </>
  );
}

/**
 * Per-service mini-scoper: three inputs (size, needs, ongoing support) mapped
 * deterministically onto the tier table by `estimate()`, a live range, a
 * "What drove this" breakdown and a "Refine on the pricing page" CTA that
 * carries the state to /pricing#estimator. Choices are mirrored into the URL
 * with history.replaceState (no navigation). On phones the range sits in a
 * sticky strip at the foot of the section and the breakdown opens in a
 * bottom sheet; the desktop summary card is the same content, SSR'd.
 */
export default function MiniScoper({ id = 'scoper', service, slug, eyebrow, heading, intro, legends }: MiniScoperProps) {
  const uid = useId();
  const [input, setInput] = useState<EstimateInput>(() => normalizeEstimateInput({ services: [service] }));
  const result = useMemo(() => estimate(input), [input]);

  const toggles = TOGGLE_OPTIONS.filter((toggle) => toggle.appliesTo.includes(service));
  const supports = useMemo(() => supportChoices(service), [service]);

  const update = (patch: Partial<EstimateInput>) => {
    const next = normalizeEstimateInput({ ...input, ...patch });
    setInput(next);
    mirrorToUrl(next);
  };

  const setSize = (key: SizeKey) => {
    const size: EstimateSize = { ...input.size };
    (size as Record<EstimateService, SizeKey>)[service] = key;
    update({ size });
  };

  const setToggle = (key: ToggleKey, checked: boolean) => {
    const next: EstimateToggles = { ...input.toggles };
    next[key] = checked;
    update({ toggles: next });
  };

  const setSupport = (level: SupportLevel) => update({ support: level });

  const refineHref = estimateHref(input);
  const callHref = estimateHref(input, { path: '/contact-us', hash: null });
  const currentSize = input.size[service];

  return (
    <section id={id} className={styles.scoper} aria-labelledby={`${id}-title`}>
      <div className={`${styles.head} reveal`}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`} className={styles.h2}>
          {heading}
        </h2>
        <p className={styles.sub}>{intro}</p>
      </div>

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={(event) => event.preventDefault()} aria-describedby={`${id}-mapping`}>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>1 · {legends.size}</legend>
            <div className={styles.chips}>
              {SIZE_OPTIONS[service].map((option) => (
                <label key={option.key} className={styles.chip}>
                  <input
                    className={styles.chipInput}
                    type="radio"
                    name={`${uid}-size`}
                    value={option.key}
                    checked={currentSize === option.key}
                    onChange={() => setSize(option.key)}
                  />
                  <span className={styles.chipText}>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>2 · {legends.needs}</legend>
            <div className={styles.chips}>
              {toggles.map((toggle) => (
                <label key={toggle.key} className={styles.chip}>
                  <input
                    className={styles.chipInput}
                    type="checkbox"
                    name={`${uid}-${toggle.param}`}
                    checked={input.toggles[toggle.key] === true}
                    onChange={(event) => setToggle(toggle.key, event.target.checked)}
                  />
                  <span className={styles.chipText}>{toggle.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>3 · {legends.support}</legend>
            <div className={styles.chips}>
              {supports.map((choice) => (
                <label key={choice.level} className={styles.chip}>
                  <input
                    className={styles.chipInput}
                    type="radio"
                    name={`${uid}-support`}
                    value={choice.level}
                    checked={input.support === choice.level}
                    onChange={() => setSupport(choice.level)}
                  />
                  <span className={styles.chipText}>{choice.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <p id={`${id}-mapping`} className={styles.mapping}>
            Every choice points at a tier listed above; the output is always a range. {FIXED_QUOTE_NOTE}.
          </p>
        </form>

        {/* Desktop summary card (display: none on phones; the strip below takes over). */}
        <aside className={styles.summary} data-cursor="estimate" aria-label="Your estimate">
          <Summary result={result} refineHref={refineHref} callHref={callHref} slug={slug} />
        </aside>
      </div>

      {/* Phones: range pinned at the foot of the section; breakdown in a bottom sheet. */}
      <div className={styles.strip} data-cursor="estimate">
        <div className={styles.stripRange}>
          <span className={styles.stripLabel}>
            Your range <span className={styles.live}>live</span>
          </span>
          <RangeOutput result={result} className={styles.rangeSmall} />
        </div>
        <BottomSheet
          title="Your range"
          description={FIXED_QUOTE_NOTE}
          snapPoints={[0.65, 1]}
          header={<RangeOutput result={result} className={styles.range} />}
          trigger={
            <button type="button" className={styles.stripButton} data-cta-placement={`${slug}_scoper_strip_breakdown`}>
              What drove this
            </button>
          }
        >
          <div className={styles.sheetBody}>
            <Summary result={result} refineHref={refineHref} callHref={callHref} slug={slug} compact />
          </div>
        </BottomSheet>
      </div>
    </section>
  );
}
