'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useAnimate } from 'framer-motion';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import { pricing, siteConfig } from '@/config/site';
import {
  ESTIMATE_SERVICES,
  SERVICE_META,
  SIZE_OPTIONS,
  SUPPORT_LEVELS,
  decodeEstimateParams,
  estimateHref,
  isEstimateService,
  resolveTier,
  tiersFor,
  type EstimateInput,
  type EstimateService,
  type EstimateTimeline,
  type SizeKey,
} from '@/lib/estimate';
import Cta from './Cta';
import { useSearchString } from './useUrlState';
import { RECAPTCHA_ENABLED, field, isEmail, useContactSubmit } from './useContactSubmit';
import forms from './forms.module.scss';
import styles from './ScopingWizard.module.scss';

/**
 * Contact PEAK (brief §2.11): a three-step scoping brief inside ONE form.
 *
 * - Every step is in the SSR HTML; inactive steps carry the `hidden` attribute
 *   (nothing mounts on click, no AnimatePresence unmounting).
 * - Step change: the entering panel slides 24px on the x axis (useAnimate on the
 *   DOM node, no per-frame React state), focus moves to the step heading and a
 *   native <progress> mirrors "Step n of 3". Reduced motion: instant swap.
 * - Prefill: `?svc=&size.web=&support=&timeline=` from the pricing estimator is
 *   read client-side through the URL store and pre-selects step 2; a visible
 *   "Prefilled from your estimate" line lets the visitor clear it.
 * - Submit: composes subject + message and posts to /api/contact.
 */

type Intent = EstimateService | 'partnership' | 'general';

const INTENTS: ReadonlyArray<{ key: Intent; label: string }> = [
  { key: 'web', label: SERVICE_META.web.label },
  { key: 'automation', label: 'Automation & AI Workflows' },
  { key: 'tools', label: SERVICE_META.tools.label },
  { key: 'cloud', label: SERVICE_META.cloud.label },
  { key: 'partnership', label: 'Agency Partnership' },
  { key: 'general', label: 'General Inquiry' },
];

const STEP_TITLES = ['What are you building?', 'Scope and budget', 'Where should we reply?'] as const;
const TOTAL_STEPS = STEP_TITLES.length;
const EASE = [0.16, 1, 0.3, 1] as const;

const NOT_SURE = 'not-sure';

function intentLabel(intent: Intent): string {
  return INTENTS.find((entry) => entry.key === intent)?.label ?? '';
}

function tierPriceLabel(service: EstimateService, price: string): string {
  if (price === 'Custom') return 'Custom quote';
  return service === 'web' ? `from ${price}` : price;
}

export default function ScopingWizard() {
  const search = useSearchString();
  const reduceMotion = usePrefersReducedMotion();
  const [scope, animate] = useAnimate<HTMLFormElement>();
  const { status, error, submit, warmUp } = useContactSubmit();

  // Estimator prefill (client-side read of the query string, no fetch).
  const prefill = useMemo<EstimateInput | null>(() => {
    if (!search || !new URLSearchParams(search).has('svc')) return null;
    return decodeEstimateParams(search);
  }, [search]);
  const [cleared, setCleared] = useState(false);
  const prefillActive = prefill !== null && !cleared;

  const [step, setStep] = useState(1);
  const [intentChoice, setIntentChoice] = useState<Intent | null>(null);
  const [sizeChoice, setSizeChoice] = useState<Partial<Record<EstimateService, SizeKey>>>({});
  const [bundleChoice, setBundleChoice] = useState<string | null>(null);
  const [timelineChoice, setTimelineChoice] = useState<EstimateTimeline | null>(null);
  const [errors, setErrors] = useState<{ intent?: string; name?: string; email?: string }>({});

  const prefillService = prefillActive ? prefill.services[0] : undefined;
  const intent: Intent | null = intentChoice ?? prefillService ?? null;
  const service: EstimateService | null = intent && isEstimateService(intent) ? intent : null;

  const sizeFor = (svc: EstimateService): SizeKey =>
    sizeChoice[svc] ?? (prefillActive ? prefill.size[svc] : undefined) ?? SIZE_OPTIONS[svc][0].key;
  const timeline: EstimateTimeline = timelineChoice ?? (prefillActive ? prefill.timeline : 'standard');
  const bundle = bundleChoice ?? NOT_SURE;

  // Step transitions: animate the entering panel, move focus to its heading.
  const panelRefs = useRef<Array<HTMLFieldSetElement | null>>([]);
  const headingRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const direction = useRef(1);
  const shownStep = useRef(1);

  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    const panel = panelRefs.current[step];
    if (panel && !reduceMotion) {
      animate(panel, { x: [direction.current * 24, 0], opacity: [0, 1] }, { duration: 0.32, ease: EASE });
    }
    headingRefs.current[step]?.focus();
  }, [step, reduceMotion, animate]);

  const goTo = (next: number) => {
    direction.current = next > step ? 1 : -1;
    setStep(next);
  };

  const validateStep1 = () => {
    if (!intent) {
      setErrors({ intent: 'Choose what you are building to continue.' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep3 = (data: FormData) => {
    const next: typeof errors = {};
    if (!field(data, 'name')) next.name = 'Your name is required.';
    const email = field(data, 'email');
    if (!email) next.email = 'Your email is required.';
    else if (!isEmail(email)) next.email = 'Enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const compose = (data: FormData) => {
    const lines: string[] = [];
    let subject = 'General Inquiry';

    if (service) {
      const meta = SERVICE_META[service];
      const size = sizeFor(service);
      const option = SIZE_OPTIONS[service].find((entry) => entry.key === size) ?? SIZE_OPTIONS[service][0];
      const { tier } = resolveTier(service, size, prefillActive ? prefill.toggles : {});
      subject = `${meta.label} — ${option.label} (${tier.name}, ${tier.price})`;
      lines.push(`Project: ${meta.label}`);
      lines.push(`Scope: ${option.label} → ${tier.name} (${tierPriceLabel(service, tier.price)})`);
      lines.push(
        timeline === 'rush'
          ? `Timeline: Rush (billed at the emergency rate, ${pricing.hourlyRates.emergency})`
          : 'Timeline: Standard',
      );
      if (prefillActive && prefill.support !== 'none') {
        const level = SUPPORT_LEVELS.find((entry) => entry.key === prefill.support);
        lines.push(`Ongoing support: ${level?.label ?? prefill.support}`);
      }
    } else if (intent === 'partnership') {
      const chosen = pricing.bundles.find((entry) => entry.name === bundle);
      subject = chosen ? `Agency Partnership — ${chosen.name} (${chosen.price})` : 'Agency Partnership';
      lines.push('Project: Agency Partnership');
      lines.push(chosen ? `Bundle: ${chosen.name} (${chosen.price})` : 'Bundle: not sure yet');
      lines.push(timeline === 'rush' ? 'Timeline: Rush' : 'Timeline: Standard');
    } else {
      lines.push('Project: General Inquiry');
    }

    const company = field(data, 'company');
    if (company) lines.push(`Company: ${company}`);
    if (prefillActive) lines.push(`Estimate link: ${siteConfig.url}${estimateHref(prefill)}`);

    const note = field(data, 'message');
    lines.push('', note || 'No additional details provided.');

    return { subject, message: lines.join('\n') };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      if (validateStep1()) goTo(2);
      return;
    }
    if (step === 2) {
      goTo(3);
      return;
    }
    if (status === 'sending') return;
    const data = new FormData(event.currentTarget);
    if (!validateStep3(data)) return;
    const { subject, message } = compose(data);
    await submit({
      name: field(data, 'name'),
      email: field(data, 'email'),
      phone: field(data, 'phone') || undefined,
      contactMethod: field(data, 'contactMethod') || undefined,
      subject,
      message,
    });
  };

  const setPanelRef = (index: number) => (el: HTMLFieldSetElement | null) => {
    panelRefs.current[index] = el;
  };
  const setHeadingRef = (index: number) => (el: HTMLHeadingElement | null) => {
    headingRefs.current[index] = el;
  };

  if (status === 'success') {
    return (
      <div className={`${forms.status} ${forms.statusSuccess}`} role="alert">
        <strong className={forms.statusTitle}>Thank you! Your message has been sent.</strong>
        We&apos;ll get back to you within 24 hours.
      </div>
    );
  }

  const showTimeline = service !== null || intent === 'partnership';

  return (
    <form
      ref={scope}
      className={styles.wizard}
      onSubmit={onSubmit}
      onFocusCapture={warmUp}
      noValidate
      aria-label="Scoping brief"
    >
      <div className={styles.head}>
        <p className={styles.progressText} aria-hidden="true">
          Step {step} of {TOTAL_STEPS}
        </p>
        <progress className={styles.progress} value={step} max={TOTAL_STEPS} aria-label={`Step ${step} of ${TOTAL_STEPS}`} />
      </div>

      {/* Step 1 — intent */}
      <fieldset ref={setPanelRef(1)} className={styles.panel} hidden={step !== 1} data-step="1">
        <legend className="visually-hidden">Step 1 of {TOTAL_STEPS}</legend>
        <h3 ref={setHeadingRef(1)} className={styles.stepTitle} tabIndex={-1}>
          <span className="visually-hidden">Step 1 of {TOTAL_STEPS}: </span>
          {STEP_TITLES[0]}
        </h3>
        <div className={forms.chips}>
          {INTENTS.map((option) => (
            <label key={option.key} className={`${forms.chip} ${styles.intentChip}`}>
              <input
                type="radio"
                name="intent"
                value={option.key}
                className="visually-hidden"
                checked={intent === option.key}
                onChange={() => {
                  setIntentChoice(option.key);
                  setErrors({});
                }}
                aria-describedby={errors.intent ? 'wizard-intent-error' : undefined}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.intent ? (
          <p id="wizard-intent-error" className={forms.error} role="alert">
            {errors.intent}
          </p>
        ) : null}
        <p className={forms.hint}>Enter also continues. Nothing is sent until step 3.</p>
      </fieldset>

      {/* Step 2 — scope & budget (every service's chips are in the HTML; only the chosen one is shown) */}
      <fieldset ref={setPanelRef(2)} className={styles.panel} hidden={step !== 2} data-step="2">
        <legend className="visually-hidden">Step 2 of {TOTAL_STEPS}</legend>
        <h3 ref={setHeadingRef(2)} className={styles.stepTitle} tabIndex={-1}>
          <span className="visually-hidden">Step 2 of {TOTAL_STEPS}: </span>
          {STEP_TITLES[1]}
        </h3>

        {prefillActive ? (
          <p className={styles.prefill}>
            Prefilled from your estimate.
            <button type="button" className={forms.textButton} onClick={() => setCleared(true)}>
              Clear
            </button>
          </p>
        ) : null}

        {ESTIMATE_SERVICES.map((svc) => {
          const tiers = tiersFor(svc);
          const active = service === svc;
          return (
            <fieldset key={svc} className={forms.fieldset} hidden={!active} disabled={!active}>
              <legend className={forms.legend}>
                {SERVICE_META[svc].label} · size and budget band
              </legend>
              <div className={forms.chips}>
                {SIZE_OPTIONS[svc].map((option) => {
                  const tier = tiers[Math.min(option.tierIndex, tiers.length - 1)];
                  return (
                    <label key={option.key} className={`${forms.chip} ${forms.chipCard}`}>
                      <input
                        type="radio"
                        name={`size-${svc}`}
                        value={option.key}
                        className="visually-hidden"
                        checked={sizeFor(svc) === option.key}
                        onChange={() => setSizeChoice((prev) => ({ ...prev, [svc]: option.key }))}
                      />
                      <span>{option.label}</span>
                      <span className={forms.chipSub}>
                        {tier.name} · {tierPriceLabel(svc, tier.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <fieldset className={forms.fieldset} hidden={intent !== 'partnership'} disabled={intent !== 'partnership'}>
          <legend className={forms.legend}>Partnership bundle</legend>
          <div className={forms.chips}>
            {pricing.bundles.map((entry) => (
              <label key={entry.name} className={`${forms.chip} ${forms.chipCard}`}>
                <input
                  type="radio"
                  name="bundle"
                  value={entry.name}
                  className="visually-hidden"
                  checked={bundle === entry.name}
                  onChange={() => setBundleChoice(entry.name)}
                />
                <span>{entry.name}</span>
                <span className={forms.chipSub}>{entry.price}</span>
              </label>
            ))}
            <label className={`${forms.chip} ${forms.chipCard}`}>
              <input
                type="radio"
                name="bundle"
                value={NOT_SURE}
                className="visually-hidden"
                checked={bundle === NOT_SURE}
                onChange={() => setBundleChoice(NOT_SURE)}
              />
              <span>Not sure yet</span>
              <span className={forms.chipSub}>We&apos;ll suggest one on the call</span>
            </label>
          </div>
        </fieldset>

        <fieldset className={forms.fieldset} hidden={!showTimeline} disabled={!showTimeline}>
          <legend className={forms.legend}>Timeline</legend>
          <div className={forms.chips}>
            <label className={forms.chip}>
              <input
                type="radio"
                name="timeline"
                value="standard"
                className="visually-hidden"
                checked={timeline === 'standard'}
                onChange={() => setTimelineChoice('standard')}
              />
              Standard
            </label>
            <label className={forms.chip}>
              <input
                type="radio"
                name="timeline"
                value="rush"
                className="visually-hidden"
                checked={timeline === 'rush'}
                onChange={() => setTimelineChoice('rush')}
              />
              Rush
            </label>
          </div>
          <p className={forms.hint} hidden={timeline !== 'rush'}>
            Rush work outside the standard schedule is billed at the emergency rate, {pricing.hourlyRates.emergency}.
          </p>
        </fieldset>

        <div className={forms.field}>
          <label className={forms.label} htmlFor="wizard-message">
            Message <span className={forms.optional}>(optional)</span>
          </label>
          <textarea
            id="wizard-message"
            name="message"
            className={forms.textarea}
            rows={5}
            placeholder="Tell us about your project, timeline, and any specific requirements..."
          />
        </div>
      </fieldset>

      {/* Step 3 — contact */}
      <fieldset ref={setPanelRef(3)} className={styles.panel} hidden={step !== 3} data-step="3">
        <legend className="visually-hidden">Step 3 of {TOTAL_STEPS}</legend>
        <h3 ref={setHeadingRef(3)} className={styles.stepTitle} tabIndex={-1}>
          <span className="visually-hidden">Step 3 of {TOTAL_STEPS}: </span>
          {STEP_TITLES[2]}
        </h3>
        {intent ? (
          <p className={forms.hint}>
            Sending as: <span className={styles.summary}>{intentLabel(intent)}</span>
          </p>
        ) : null}

        <div className={forms.row}>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="wizard-name">
              Name
            </label>
            <input
              id="wizard-name"
              name="name"
              type="text"
              autoComplete="name"
              className={forms.input}
              placeholder="Your full name"
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? 'wizard-name-error' : undefined}
            />
            {errors.name ? (
              <p id="wizard-name-error" className={forms.error}>
                {errors.name}
              </p>
            ) : null}
          </div>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="wizard-email">
              Email
            </label>
            <input
              id="wizard-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className={forms.input}
              placeholder="you@company.com"
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'wizard-email-error' : undefined}
            />
            {errors.email ? (
              <p id="wizard-email-error" className={forms.error}>
                {errors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div className={forms.row}>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="wizard-company">
              Company <span className={forms.optional}>(optional)</span>
            </label>
            <input
              id="wizard-company"
              name="company"
              type="text"
              autoComplete="organization"
              className={forms.input}
              placeholder="Agency name"
            />
          </div>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="wizard-phone">
              Phone <span className={forms.optional}>(optional)</span>
            </label>
            <input
              id="wizard-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={forms.input}
              placeholder="+1 (000) 000-0000"
            />
          </div>
        </div>

        <fieldset className={forms.fieldset}>
          <legend className={forms.legend}>Preferred contact method</legend>
          <div className={forms.radios}>
            <label className={forms.radio}>
              <input type="radio" name="contactMethod" value="email" defaultChecked />
              Email
            </label>
            <label className={forms.radio}>
              <input type="radio" name="contactMethod" value="phone" />
              Phone
            </label>
          </div>
        </fieldset>

        {status === 'error' ? (
          <p className={forms.error} role="alert">
            {error}
          </p>
        ) : null}

        {RECAPTCHA_ENABLED ? (
          <p className={forms.recaptcha}>
            Protected by reCAPTCHA –{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Privacy
            </a>{' '}
            ·{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
              Terms
            </a>
          </p>
        ) : null}
      </fieldset>

      <div className={styles.nav}>
        {step > 1 ? (
          <button type="button" className={forms.textButton} onClick={() => goTo(step - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <Cta placement={`contact_wizard_step${step}_continue`} type="submit" size="medium">
            Continue
          </Cta>
        ) : (
          <Cta placement="contact_wizard_submit" type="submit" size="medium" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </Cta>
        )}
      </div>
    </form>
  );
}
