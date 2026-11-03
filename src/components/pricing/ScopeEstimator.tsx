'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { pricing } from '@/config/site';
import {
  SERVICE_META,
  SIZE_OPTIONS,
  SUPPORT_LEVELS,
  TIMELINES,
  TOGGLE_OPTIONS,
  formatRange,
  normalizeEstimateInput,
  resolveTier,
  supportLineFor,
  tiersFor,
  type EstimateInput,
  type EstimateService,
  type EstimateSize,
  type EstimateTimeline,
  type EstimateToggles,
  type SizeKey,
  type SupportLevel,
  type ToggleKey,
  type ToggleOption,
} from '@/lib/estimate';
import { anchorOffset, useLenis } from '@/components/ui/SmoothScroll';
import { useMediaQuery, usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import { SERVICES, TOGGLE_LABELS, keepHyphens, priceText } from './content';
import EstimateBar from './EstimateBar';
import EstimateSummary from './EstimateSummary';
import { clearEstimateUrl, useEstimateState, writeEstimateUrl } from './estimateUrlStore';
import styles from './ScopeEstimator.module.scss';

/**
 * The Scope Estimator, the page's one interaction.
 *
 * Five questions, each a native radio, checkbox or switch inside a styled
 * label (real group semantics, arrow keys for free, 44px+ targets). Every
 * option shows what it costs before it is chosen, every change recomputes the
 * estimate synchronously from site.ts (no network, well under 100ms) and is
 * mirrored to the URL, so any state is a shareable link and the contact form
 * can pick it up. Nothing here is a typed price: the numbers come from
 * `estimate()` and the price labels it reads.
 *
 * Below 1024px the readout sits under the questions; a one-line bar keeps the
 * live range on screen while the questions are in view and hands over to the
 * readout once it scrolls in. The five questions are numbered rows on
 * hairlines (the numerals are decorative; each legend is the question alone).
 *
 * Simplify pass (Nov 2026): every option changes the price or the brief. The
 * "design supplied" switch is gone from the questions (it never moved the
 * price); a shared link that carries it still decodes.
 */

const TIMELINE_COPY: Record<EstimateTimeline, { label: string; effect: string }> = {
  standard: { label: 'Standard', effect: 'No extra cost' },
  rush: { label: 'Rush', effect: `Adds our emergency rate, ${priceText(pricing.hourlyRates.emergency)} an hour` },
};

/** Add-ons that change the price: all but "design supplied". */
const PRICED_TOGGLES = TOGGLE_OPTIONS.filter((toggle) => toggle.key !== 'designSupplied');

/** An add-on's name in everyday words (TOGGLE_LABELS), or the engine's own. */
const toggleName = (toggle: ToggleOption): string => TOGGLE_LABELS[toggle.key] ?? toggle.label;

/**
 * What a support level is and costs across the selected lines: the published
 * line it maps to ("Essential Care") and the monthly sum ("$1,000–$2,000",
 * shown with "a month" under it).
 */
function supportEffect(services: readonly EstimateService[], level: SupportLevel): { meta: string; price: string | null } {
  if (level === 'none') return { meta: 'No monthly plan', price: null };
  const lines = services.map((service) => supportLineFor(service, level)).filter((line) => line !== undefined);
  if (lines.length === 0) return { meta: 'Not offered for this service', price: null };
  const price = formatRange(
    lines.reduce((sum, line) => sum + line.low, 0),
    lines.reduce((sum, line) => sum + line.high, 0),
  );
  return { meta: lines.length === 1 ? lines[0].name : `${lines.length} monthly plans`, price };
}

/**
 * What an add-on does to the price, read from the engine before the visitor
 * flips it: the tier it requires, or that the current tier already covers it.
 * Web Development prices are the lowest a package costs, so they read "from $8,500".
 */
function toggleEffect(toggle: ToggleOption, input: EstimateInput): string {
  const services = input.services.filter((service) => toggle.appliesTo.includes(service));
  const parts = services.map((service) => {
    const without = resolveTier(service, input.size[service], { ...input.toggles, [toggle.key]: false });
    const withIt = resolveTier(service, input.size[service], { ...input.toggles, [toggle.key]: true });
    const prefix = services.length > 1 ? `${SERVICE_META[service].shortLabel}: ` : '';
    const price = priceText(withIt.tier.price);
    const shown = service === 'web' && price !== 'Custom quote' ? `from ${price}` : price;
    return withIt.index > without.index
      ? `${prefix}${services.length > 1 ? 'n' : 'N'}eeds ${keepHyphens(withIt.tier.name)}, ${shown}`
      : `${prefix}${services.length > 1 ? 'i' : 'I'}ncluded in ${keepHyphens(without.tier.name)}`;
  });
  return parts.join(' · ');
}

export default function ScopeEstimator() {
  const uid = useId();
  const { input, result, touched } = useEstimateState();
  const reduceMotion = usePrefersReducedMotion();
  const lenis = useLenis();

  // Phones and tablets: the readout follows the questions instead of riding beside them.
  const stacked = useMediaQuery('(max-width: 1023px)');
  const controlsRef = useRef<HTMLFormElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const [controlsInView, setControlsInView] = useState(false);
  const [readoutInView, setReadoutInView] = useState(false);

  useEffect(() => {
    if (!stacked) return;
    const controls = controlsRef.current;
    const readout = readoutRef.current;
    if (!controls || !readout) return;
    // The 56px header never counts as "on screen"; the readout counts once its
    // top clears the bar's height above the bottom edge.
    const controlsObserver = new IntersectionObserver(([entry]) => setControlsInView(entry.isIntersecting), {
      rootMargin: '-56px 0px 0px 0px',
    });
    const readoutObserver = new IntersectionObserver(([entry]) => setReadoutInView(entry.isIntersecting), {
      rootMargin: '0px 0px -96px 0px',
    });
    controlsObserver.observe(controls);
    readoutObserver.observe(readout);
    return () => {
      controlsObserver.disconnect();
      readoutObserver.disconnect();
    };
  }, [stacked]);

  // Wide screens: the sticky readout scrolls inside itself only when it is
  // taller than the viewport (four lines priced at once). Only then does it
  // opt out of Lenis, so the wheel never changes feel over a short readout.
  useEffect(() => {
    const rail = readoutRef.current;
    if (!rail || stacked) return;
    const update = () => {
      if (rail.scrollHeight > rail.clientHeight + 1) rail.setAttribute('data-lenis-prevent', '');
      else rail.removeAttribute('data-lenis-prevent');
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(rail);
    if (rail.firstElementChild) resize.observe(rail.firstElementChild);
    return () => {
      resize.disconnect();
      rail.removeAttribute('data-lenis-prevent');
    };
  }, [stacked]);

  const commit = (patch: Partial<EstimateInput>) => {
    writeEstimateUrl(normalizeEstimateInput({ ...input, ...patch }));
  };

  const toggleService = (service: EstimateService) => {
    const selected = input.services.includes(service);
    if (selected && input.services.length === 1) return; // one line always stays selected
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

  // The button unmounts once nothing is left to undo, so focus moves to the first question.
  const startOver = () => {
    clearEstimateUrl();
    window.setTimeout(() => controlsRef.current?.querySelector<HTMLInputElement>('input')?.focus(), 0);
  };

  // Through Lenis where it runs (fine pointers), as the site's anchor handler
  // does, natively elsewhere; both land at the same place (anchorOffset).
  const jumpToReadout = () => {
    const target = document.getElementById('estimate-readout');
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: -anchorOffset(target), immediate: reduceMotion });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById('estimate-total')?.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  };

  const multi = input.services.length > 1;
  const applicableToggles = PRICED_TOGGLES.filter((toggle) => toggle.appliesTo.some((service) => input.services.includes(service)));

  return (
    <div className={styles.estimator}>
      <form ref={controlsRef} className={styles.controls} aria-label="Price estimator" onSubmit={(event) => event.preventDefault()}>
        {/* 1 · Service lines (checkboxes: several lines can be priced together) */}
        <fieldset className={styles.step} aria-describedby={`${uid}-svc-hint`}>
          <legend className={styles.legend}>
            <span className={styles.index} aria-hidden="true">01</span>
            <span className={styles.legendText}>What are we building?</span>
          </legend>
          <p id={`${uid}-svc-hint`} className={styles.hint}>
            Pick one or more services.
          </p>
          <div className={styles.services}>
            {SERVICES.map((facts) => {
              const checked = input.services.includes(facts.service);
              const locked = checked && input.services.length === 1;
              return (
                <label key={facts.service} className={styles.tile} data-checked={checked || undefined} data-locked={locked || undefined}>
                  <input
                    className={styles.native}
                    type="checkbox"
                    name={`${uid}-svc`}
                    value={facts.service}
                    checked={checked}
                    aria-disabled={locked || undefined}
                    aria-describedby={locked ? `${uid}-locked` : undefined}
                    onChange={() => toggleService(facts.service)}
                  />
                  <span className={styles.check} aria-hidden="true" />
                  <span className={styles.tileName}>{facts.name}</span>
                  <span className={styles.tileMeta}>from {facts.fromLabel}</span>
                </label>
              );
            })}
          </div>
          <span id={`${uid}-locked`} className="visually-hidden">
            At least one service stays selected.
          </span>
        </fieldset>

        {/* 2 · Size: one radio group per selected line */}
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            <span className={styles.index} aria-hidden="true">02</span>
            <span className={styles.legendText}>How big is it?</span>
          </legend>
          {input.services.map((service) => {
            const tiers = tiersFor(service);
            const startingAt = service === 'web';
            const options = (
              <div className={styles.sizes}>
                {SIZE_OPTIONS[service].map((option) => {
                  const tier = tiers[option.tierIndex];
                  const checked = input.size[service] === option.key;
                  const price = priceText(tier.price);
                  return (
                    <label key={option.key} className={styles.tile} data-checked={checked || undefined}>
                      <input
                        className={styles.native}
                        type="radio"
                        name={`${uid}-size-${service}`}
                        value={option.key}
                        checked={checked}
                        onChange={() => setSize(service, option.key)}
                      />
                      <span className={styles.radio} aria-hidden="true" />
                      <span className={styles.tileName}>{option.label}</span>
                      <span className={styles.tileMeta}>{keepHyphens(tier.name)}</span>
                      <span className={styles.tilePrice}>
                        {startingAt && price !== 'Custom quote' ? `from ${price}` : price}
                      </span>
                    </label>
                  );
                })}
              </div>
            );
            return multi ? (
              <fieldset key={service} className={styles.subStep}>
                <legend className={styles.subLegend}>{SERVICE_META[service].label}</legend>
                {options}
              </fieldset>
            ) : (
              <div key={service}>{options}</div>
            );
          })}
        </fieldset>

        {/* 3 · Add-ons: switches that say what they cost before they are flipped */}
        <fieldset className={styles.step} aria-describedby={`${uid}-addon-hint`}>
          <legend className={styles.legend}>
            <span className={styles.index} aria-hidden="true">03</span>
            <span className={styles.legendText}>What does it need?</span>
          </legend>
          <p id={`${uid}-addon-hint`} className={styles.hint}>
            Turn on what the project needs. Each one shows how it changes the price.
          </p>
          <div className={styles.switches}>
            {applicableToggles.map((toggle) => {
              const on = input.toggles[toggle.key] === true;
              const nameId = `${uid}-${toggle.param}-name`;
              const effectId = `${uid}-${toggle.param}-effect`;
              // Named by the add-on alone and described by its price effect, so the effect is
              // announced once (the wrapping label would otherwise put it in the name as well).
              return (
                <label key={toggle.key} className={styles.switch} data-checked={on || undefined}>
                  <span className={styles.switchText}>
                    <span id={nameId} className={styles.switchLabel}>
                      {toggleName(toggle)}
                    </span>
                    <span id={effectId} className={styles.switchEffect}>
                      {toggleEffect(toggle, input)}
                    </span>
                  </span>
                  <input
                    className={styles.native}
                    type="checkbox"
                    role="switch"
                    name={`${uid}-${toggle.param}`}
                    checked={on}
                    aria-labelledby={nameId}
                    aria-describedby={effectId}
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

        {/* 4 · Ongoing support, mapped to the published monthly lines */}
        <fieldset className={styles.step} aria-describedby={`${uid}-support-hint`}>
          <legend className={styles.legend}>
            <span className={styles.index} aria-hidden="true">04</span>
            <span className={styles.legendText}>Support after launch</span>
          </legend>
          <p id={`${uid}-support-hint`} className={styles.hint}>
            Optional. Each level matches one of our monthly plans.
          </p>
          <div className={styles.options}>
            {SUPPORT_LEVELS.map((level) => {
              const checked = input.support === level.key;
              const effect = supportEffect(input.services, level.key);
              return (
                <label key={level.key} className={styles.tile} data-checked={checked || undefined}>
                  <input
                    className={styles.native}
                    type="radio"
                    name={`${uid}-support`}
                    value={level.key}
                    checked={checked}
                    onChange={() => commit({ support: level.key })}
                  />
                  <span className={styles.radio} aria-hidden="true" />
                  <span className={styles.tileName}>{level.label}</span>
                  <span className={styles.tileMeta}>{effect.meta}</span>
                  {effect.price ? (
                    <span className={styles.tilePrice}>
                      {effect.price}
                      <span className={styles.tileUnit}> a month</span>
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 5 · Timeline */}
        <fieldset className={styles.step}>
          <legend className={styles.legend}>
            <span className={styles.index} aria-hidden="true">05</span>
            <span className={styles.legendText}>When do you need it?</span>
          </legend>
          <div className={styles.options}>
            {TIMELINES.map((timeline) => {
              const checked = input.timeline === timeline;
              return (
                <label key={timeline} className={styles.tile} data-checked={checked || undefined}>
                  <input
                    className={styles.native}
                    type="radio"
                    name={`${uid}-timeline`}
                    value={timeline}
                    checked={checked}
                    onChange={() => commit({ timeline })}
                  />
                  <span className={styles.radio} aria-hidden="true" />
                  <span className={styles.tileName}>{TIMELINE_COPY[timeline].label}</span>
                  <span className={styles.tileMeta}>{TIMELINE_COPY[timeline].effect}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Only once there is something to undo: back to the defaults, URL cleared. */}
        {touched ? (
          <div className={styles.reset}>
            <button type="button" className={styles.resetButton} onClick={startOver}>
              Start over
            </button>
            <span className={styles.resetNote}>Clears your answers.</span>
          </div>
        ) : null}
      </form>

      {/* data-header-quiet: the header's own "Start a project" stays an outline while the
          readout, which carries the same ask with this estimate, is on screen. */}
      <div ref={readoutRef} className={styles.rail} data-header-quiet="">
        <EstimateSummary input={input} result={result} />
      </div>

      {stacked && <EstimateBar result={result} visible={controlsInView && !readoutInView} onJump={jumpToReadout} />}
    </div>
  );
}
