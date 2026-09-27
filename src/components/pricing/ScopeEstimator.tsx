'use client';

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { pricing } from '@/config/site';
import {
  ESTIMATE_SERVICES,
  SERVICE_META,
  SIZE_OPTIONS,
  SUPPORT_LEVELS,
  TIMELINES,
  TOGGLE_OPTIONS,
  decodeEstimateParams,
  estimate,
  formatRange,
  normalizeEstimateInput,
  supportLineFor,
  type EstimateInput,
  type EstimateService,
  type EstimateSize,
  type EstimateTimeline,
  type EstimateToggles,
  type SizeKey,
  type SupportLevel,
  type ToggleKey,
} from '@/lib/estimate';
import { useMediaQuery } from '@/components/ui/useMediaQuery';
import EstimateSheet from './EstimateSheet';
import EstimateSummary from './EstimateSummary';
import { readEstimateSearch, readEstimateSearchServer, subscribeEstimateUrl, writeEstimateUrl } from './estimateUrlStore';
import styles from './ScopeEstimator.module.scss';

/**
 * The Scope Estimator (research synthesis §2.3) - this page's signature.
 *
 * Controls are native radios and checkboxes inside styled labels (real
 * radiogroup semantics, arrow-key roving for free, 44px targets). The output
 * is a pure function of the URL: every change writes the query string and the
 * island re-renders from it, so any state is a shareable link. The numbers
 * come from `estimate()` - nothing here is typed by hand.
 */

const TIMELINE_LABEL: Record<EstimateTimeline, string> = { standard: 'Standard', rush: 'Rush' };

/** Summed monthly line for a support level across the selected services ("$1,000–$2,000/mo"). */
function supportSubLabel(services: readonly EstimateService[], level: SupportLevel): string | null {
  if (level === 'none') return null;
  const lines = services.map((service) => supportLineFor(service, level)).filter((line) => line !== undefined);
  if (lines.length === 0) return null;
  const low = lines.reduce((sum, line) => sum + line.low, 0);
  const high = lines.reduce((sum, line) => sum + line.high, 0);
  return `${formatRange(low, high)}/mo`;
}

export default function ScopeEstimator() {
  const uid = useId();
  const search = useSyncExternalStore(subscribeEstimateUrl, readEstimateSearch, readEstimateSearchServer);
  const input = useMemo(() => decodeEstimateParams(search), [search]);
  const result = useMemo(() => estimate(input), [input]);

  const isPhone = useMediaQuery('(max-width: 767px)');
  const controlsRef = useRef<HTMLFormElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [controlsInView, setControlsInView] = useState(false);
  const [railInView, setRailInView] = useState(false);

  // Phones only: the summary sheet is pinned while the controls are on screen
  // and hands over to the inline summary once that scrolls up into view.
  useEffect(() => {
    if (!isPhone) return;
    const controls = controlsRef.current;
    const rail = railRef.current;
    if (!controls || !rail) return;

    const controlsObserver = new IntersectionObserver(
      ([entry]) => setControlsInView(entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px' },
    );
    const railObserver = new IntersectionObserver(
      ([entry]) => setRailInView(entry.isIntersecting),
      { rootMargin: '0px 0px -200px 0px' },
    );
    controlsObserver.observe(controls);
    railObserver.observe(rail);
    return () => {
      controlsObserver.disconnect();
      railObserver.disconnect();
    };
  }, [isPhone]);

  const commit = (patch: Partial<EstimateInput>) => {
    writeEstimateUrl(normalizeEstimateInput({ ...input, ...patch }));
  };

  const toggleService = (service: EstimateService) => {
    const selected = input.services.includes(service);
    if (selected && input.services.length === 1) return; // keep at least one line
    commit({
      services: selected ? input.services.filter((entry) => entry !== service) : [...input.services, service],
    });
  };

  const setSize = (service: EstimateService, size: SizeKey) => {
    commit({ size: { ...input.size, [service]: size } as EstimateSize });
  };

  const setToggle = (key: ToggleKey, on: boolean) => {
    const toggles: EstimateToggles = { ...input.toggles };
    if (on) toggles[key] = true;
    else delete toggles[key];
    commit({ toggles });
  };

  const multi = input.services.length > 1;
  const sheetOpen = isPhone && controlsInView && !railInView;

  return (
    <div className={styles.estimator}>
      <form
        ref={controlsRef}
        className={styles.controls}
        aria-label="Scope estimator inputs"
        onSubmit={(event) => event.preventDefault()}
      >
        {/* 1 · Service line */}
        <fieldset className={styles.group} data-cursor="estimate">
          <legend className={styles.legend}>
            <span className={styles.step}>1</span> Service line <span className={styles.legendHint}>pick one or more</span>
          </legend>
          <div className={styles.chips}>
            {ESTIMATE_SERVICES.map((service) => {
              const checked = input.services.includes(service);
              const locked = checked && input.services.length === 1;
              return (
                <label
                  key={service}
                  className={styles.chip}
                  data-checked={checked || undefined}
                  data-locked={locked || undefined}
                >
                  <input
                    className={styles.srInput}
                    type="checkbox"
                    name={`${uid}-svc`}
                    value={service}
                    checked={checked}
                    aria-disabled={locked || undefined}
                    onChange={() => toggleService(service)}
                  />
                  <span>{SERVICE_META[service].label}</span>
                </label>
              );
            })}
          </div>
          <p className={styles.hint}>Pick more than one to see the partner bundles.</p>
        </fieldset>

        {/* 2 · Size, one radiogroup per selected service */}
        {input.services.map((service) => (
          <fieldset key={service} className={styles.group} data-cursor="estimate">
            <legend className={styles.legend}>
              <span className={styles.step}>2</span> Size
              {multi ? (
                <span className={styles.legendHint}>{SERVICE_META[service].label}</span>
              ) : (
                <span className={styles.legendHint}>options follow the service line</span>
              )}
            </legend>
            <div className={styles.chips}>
              {SIZE_OPTIONS[service].map((option) => {
                const checked = input.size[service] === option.key;
                return (
                  <label key={option.key} className={styles.chip} data-checked={checked || undefined}>
                    <input
                      className={styles.srInput}
                      type="radio"
                      name={`${uid}-size-${service}`}
                      value={option.key}
                      checked={checked}
                      onChange={() => setSize(service, option.key)}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        {/* 3 · Add-ons */}
        <fieldset className={styles.group} data-cursor="estimate">
          <legend className={styles.legend}>
            <span className={styles.step}>3</span> Add-ons
          </legend>
          <div className={styles.switches}>
            {TOGGLE_OPTIONS.map((toggle) => {
              const applies = toggle.appliesTo.some((service) => input.services.includes(service));
              const on = input.toggles[toggle.key] === true;
              return (
                <label key={toggle.key} className={styles.switch} data-checked={on || undefined} hidden={!applies}>
                  <span className={styles.switchLabel}>{toggle.label}</span>
                  <span className={styles.switchState} aria-hidden="true">
                    {on ? 'On' : 'Off'}
                  </span>
                  <input
                    className={styles.srInput}
                    type="checkbox"
                    role="switch"
                    name={`${uid}-${toggle.param}`}
                    checked={on}
                    aria-checked={on}
                    onChange={(event) => setToggle(toggle.key, event.target.checked)}
                  />
                  <span className={styles.track} aria-hidden="true">
                    <span className={styles.knob} />
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 4 · Ongoing support */}
        <fieldset className={styles.group} data-cursor="estimate">
          <legend className={styles.legend}>
            <span className={styles.step}>4</span> Ongoing support
          </legend>
          <div className={styles.chips}>
            {SUPPORT_LEVELS.map((level) => {
              const checked = input.support === level.key;
              const sub = supportSubLabel(input.services, level.key);
              return (
                <label key={level.key} className={styles.chip} data-checked={checked || undefined}>
                  <input
                    className={styles.srInput}
                    type="radio"
                    name={`${uid}-support`}
                    value={level.key}
                    checked={checked}
                    onChange={() => commit({ support: level.key })}
                  />
                  <span>{level.label}</span>
                  {sub && <span className={styles.chipSub}>{sub}</span>}
                </label>
              );
            })}
          </div>
          <p className={styles.hint}>
            Each level maps to the published {multi ? 'maintenance or retainer lines' : SERVICE_META[input.services[0]].recurringLabel.toLowerCase() + ' line'} for the
            selected service; the breakdown names it.
          </p>
        </fieldset>

        {/* 5 · Timeline */}
        <fieldset className={styles.group} data-cursor="estimate">
          <legend className={styles.legend}>
            <span className={styles.step}>5</span> Timeline
          </legend>
          <div className={styles.chips}>
            {TIMELINES.map((timeline) => {
              const checked = input.timeline === timeline;
              return (
                <label key={timeline} className={styles.chip} data-checked={checked || undefined}>
                  <input
                    className={styles.srInput}
                    type="radio"
                    name={`${uid}-timeline`}
                    value={timeline}
                    checked={checked}
                    onChange={() => commit({ timeline })}
                  />
                  <span>{TIMELINE_LABEL[timeline]}</span>
                </label>
              );
            })}
          </div>
          <p className={styles.note} hidden={input.timeline !== 'rush'}>
            Rush: work outside the standard schedule is billed at the emergency rate, {pricing.hourlyRates.emergency}, on
            top of the range.
          </p>
        </fieldset>
      </form>

      <div ref={railRef} className={styles.rail}>
        <EstimateSummary result={result} input={input} />
      </div>

      {isPhone && <EstimateSheet open={sheetOpen} result={result} input={input} />}
    </div>
  );
}
