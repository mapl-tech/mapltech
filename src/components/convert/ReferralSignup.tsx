'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { ESTIMATE_SERVICES, SERVICE_META } from '@/lib/estimate';
import { mailtoLink, type ComposedBrief } from './brief';
import { GENERIC_ERROR, field, isEmail, useContactSubmit } from './useContactSubmit';
import styles from '@/components/pricing/ReferralForm.module.scss';
import RecaptchaNotice from './RecaptchaNotice';

/**
 * The referral form (the live page's fields, kept): the four required ones on
 * show, you and the person you are introducing (name and email each); the
 * four optional ones (their agency's name, what they need, notes, your
 * company) folded behind "Add details (optional)", a native disclosure, so
 * the short form looks short. Required fields are validated on submit; their
 * email must not be your own. Each error sits under its field in the brief's
 * pattern (a "!" disc, then the sentence), is linked with aria-describedby,
 * and focus moves to the first one; the button is aria-disabled while
 * sending, so it keeps focus. Beside the button, the brief's own privacy
 * line, with the link to the policy. On success the form is replaced by a
 * status panel that takes focus. Posts to /api/contact with the subject
 * "Referral: <name>"; if that fails, the same referral opens in the
 * visitor's mail app, already written.
 *
 * After a first attempt, errors follow the brief's rules: each one clears as
 * soon as its value is fixed (while typing), and a field is checked again on
 * blur, but never in the middle of a press. The press that moves focus out of
 * the last field is the one that sends; an error line added or removed under
 * that field mid-press would move "Send referral" out from under the pointer
 * or finger and swallow the press.
 */

type FieldKey = 'name' | 'email' | 'refName' | 'refEmail';
type Errors = Partial<Record<FieldKey, string>>;

const ORDER: FieldKey[] = ['name', 'email', 'refName', 'refEmail'];

const isFieldKey = (name: string): name is FieldKey => (ORDER as string[]).includes(name);

function validate(data: FormData): Errors {
  const errors: Errors = {};
  if (!field(data, 'name')) errors.name = 'Enter your name.';
  const email = field(data, 'email');
  if (!email) errors.email = 'Enter your email address.';
  else if (!isEmail(email)) errors.email = 'Enter an email address like name@agency.com.';
  if (!field(data, 'refName')) errors.refName = 'Enter their name, so we know who to ask for.';
  const refEmail = field(data, 'refEmail');
  if (!refEmail) errors.refEmail = 'Enter their email address so we can reach them.';
  else if (!isEmail(refEmail)) errors.refEmail = 'Enter an email address like name@agency.com.';
  // The introduction goes to them, so their address cannot be the one you gave for yourself.
  else if (isEmail(email) && refEmail.toLowerCase() === email.toLowerCase())
    errors.refEmail = 'That is your own email. Enter theirs, so we can reach them.';
  return errors;
}

/** The referral as it is sent: the subject and message /api/contact gets, and the mail app's fallback. */
function composeReferral(data: FormData): ComposedBrief {
  const refName = field(data, 'refName');
  const refCompany = field(data, 'refCompany');
  const yourCompany = field(data, 'yourCompany');
  const notes = field(data, 'refNotes');
  const needLabel = ESTIMATE_SERVICES.find((service) => service === field(data, 'refNeed'));

  const message = [
    'Referral',
    `Referral's name: ${refName}`,
    `Referral's email: ${field(data, 'refEmail')}`,
    refCompany ? `Referral's company: ${refCompany}` : null,
    `What they need: ${needLabel ? SERVICE_META[needLabel].label : 'Not sure yet'}`,
    '',
    `Referred by: ${field(data, 'name')}${yourCompany ? ` (${yourCompany})` : ''}`,
    '',
    notes ? `Notes:\n${notes}` : 'No additional notes.',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  return { subject: `Referral: ${refName}${refCompany ? ` (${refCompany})` : ''}`, message };
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  wide?: boolean;
  children: (describedBy: string | undefined) => ReactNode;
}

function Field({ id, label, error, wide = false, children }: FieldProps) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ''}`.trim()}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children(describedBy)}
      {/* The brief's error: a drawn "!" (state never rests on colour alone), then the sentence. */}
      {error ? (
        <p id={`${id}-error`} className={styles.fieldError}>
          <span className={styles.errorIcon} aria-hidden="true">
            !
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function ReferralSignup() {
  const uid = useId();
  const { status, error, submit, warmUp, reset } = useContactSubmit();
  const [need, setNeed] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [botSent, setBotSent] = useState(false);
  // What a failed send carried, kept current while the visitor edits: the mail-app fallback.
  const [unsent, setUnsent] = useState<ComposedBrief | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const id = (key: string) => `${uid}-${key}`;
  const sent = status === 'success' || botSent;

  // The status panel replaces the form; move focus to it so it is announced.
  useEffect(() => {
    if (sent) statusRef.current?.focus();
  }, [sent]);

  // As in the brief: a blur check waits while a pointer is pressed, then runs
  // once it lifts (after the press's click has landed).
  const pointerDown = useRef(false);
  const pendingBlur = useRef<(() => void) | null>(null);

  useEffect(() => {
    const down = () => {
      pointerDown.current = true;
    };
    const up = () => {
      window.setTimeout(() => {
        pointerDown.current = false;
        const run = pendingBlur.current;
        pendingBlur.current = null;
        run?.();
      }, 0);
    };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('pointerup', up, true);
    document.addEventListener('pointercancel', up, true);
    return () => {
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('pointerup', up, true);
      document.removeEventListener('pointercancel', up, true);
    };
  }, []);

  // While typing, errors only ever clear: each one as soon as its value is fixed
  // (their email clears too once your own changes). New ones wait for the blur or the next send.
  const onChange = (event: ChangeEvent<HTMLFormElement>) => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    if (status === 'error') setUnsent(composeReferral(data));
    if (!(event.target instanceof HTMLInputElement) || !ORDER.some((key) => errors[key])) return;
    const now = validate(data);
    setErrors((current) => {
      const fixedKeys = ORDER.filter((key) => current[key] && !now[key]);
      if (!fixedKeys.length) return current;
      const next = { ...current };
      for (const key of fixedKeys) delete next[key];
      return next;
    });
  };

  // After a first attempt, the field just left is checked again: only that
  // field, and never mid-press. A tap's blur comes in the middle of its own
  // click, so even with no pointer down the check waits one task.
  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!attempted || !(target instanceof HTMLInputElement) || !isFieldKey(target.name)) return;
    const key = target.name;
    const check = () => {
      const form = formRef.current;
      if (!form) return;
      const found = validate(new FormData(form))[key];
      setErrors((current) => (current[key] === found ? current : { ...current, [key]: found }));
    };
    if (pointerDown.current) {
      const earlier = pendingBlur.current;
      pendingBlur.current = earlier
        ? () => {
            earlier();
            check();
          }
        : check;
    } else {
      window.setTimeout(check, 0);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const data = new FormData(event.currentTarget);
    const next = validate(data);
    setErrors(next);
    setAttempted(true);
    const first = ORDER.find((key) => next[key]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }

    const refName = field(data, 'refName');
    // Honeypot: bots get the same confirmation and nothing is sent.
    if (field(data, 'website')) {
      setSentTo(refName);
      setBotSent(true);
      return;
    }

    const composed = composeReferral(data);
    setUnsent(composed);
    const ok = await submit({ name: field(data, 'name'), email: field(data, 'email'), ...composed });
    if (ok) setSentTo(refName);
  };

  const startOver = () => {
    reset();
    setBotSent(false);
    setErrors({});
    setAttempted(false);
    setNeed('');
    setSentTo('');
    setUnsent(null);
  };

  if (sent) {
    return (
      <div ref={statusRef} className={styles.success} role="status" tabIndex={-1}>
        <p className={styles.successTitle}>Referral received.</p>
        <p className={styles.successText}>
          Thank you. We will contact {sentTo || 'them'} and mention that you introduced them.
        </p>
        <button type="button" className={styles.secondary} onClick={startOver}>
          Refer another agency
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={onSubmit}
      onChange={onChange}
      onFocusCapture={warmUp}
      onBlurCapture={onBlur}
      noValidate
      aria-label="Refer an agency"
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>About you</legend>
        <div className={styles.fields}>
          <Field id={id('name')} label="Your name" error={errors.name}>
            {(describedBy) => (
              <input
                id={id('name')}
                name="name"
                type="text"
                autoComplete="name"
                className={styles.input}
                required
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={describedBy}
              />
            )}
          </Field>
          <Field id={id('email')} label="Your email" error={errors.email}>
            {(describedBy) => (
              <input
                id={id('email')}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={styles.input}
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy}
              />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>The agency you are introducing</legend>
        <div className={styles.fields}>
          {/* A person, not the agency (its name is an optional field below): the live page's "Contact person". */}
          <Field id={id('refName')} label="Contact person’s name" error={errors.refName}>
            {(describedBy) => (
              <input
                id={id('refName')}
                name="refName"
                type="text"
                autoComplete="off"
                className={styles.input}
                required
                aria-invalid={errors.refName ? true : undefined}
                aria-describedby={describedBy}
              />
            )}
          </Field>
          <Field id={id('refEmail')} label="Their email" error={errors.refEmail}>
            {(describedBy) => (
              <input
                id={id('refEmail')}
                name="refEmail"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="name@agency.com"
                className={styles.input}
                required
                aria-invalid={errors.refEmail ? true : undefined}
                aria-describedby={describedBy}
              />
            )}
          </Field>
        </div>
      </fieldset>

      {/* The optional fields, folded: still in the form (and in what it sends)
          when closed. The summary is the control; it says optional, so the
          labels inside do not repeat it. */}
      <details className={styles.more}>
        <summary className={styles.moreToggle}>Add details (optional)</summary>
        <div className={`${styles.fields} ${styles.moreFields}`}>
          <Field id={id('refCompany')} label="Their agency’s name">
            {(describedBy) => (
              <input
                id={id('refCompany')}
                name="refCompany"
                type="text"
                autoComplete="off"
                className={styles.input}
                aria-describedby={describedBy}
              />
            )}
          </Field>
          <Field id={id('refNeed')} label="What do they need?">
            {(describedBy) => (
              <select
                id={id('refNeed')}
                name="refNeed"
                className={styles.select}
                value={need}
                onChange={(event) => setNeed(event.target.value)}
                aria-describedby={describedBy}
              >
                <option value="">Not sure yet</option>
                {ESTIMATE_SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {SERVICE_META[service].label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id={id('refNotes')} label="Anything that would help us reach out?" wide>
            {(describedBy) => (
              <textarea id={id('refNotes')} name="refNotes" rows={4} className={styles.textarea} aria-describedby={describedBy} />
            )}
          </Field>
          <Field id={id('yourCompany')} label="Your company" wide>
            {(describedBy) => (
              <input
                id={id('yourCompany')}
                name="yourCompany"
                type="text"
                autoComplete="organization"
                className={styles.input}
                aria-describedby={describedBy}
              />
            )}
          </Field>
        </div>
      </details>

      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {/* As the brief says it: a titled box, the API's own words when it sent some, then the
          way out: the same referral in the visitor's mail app, already written. */}
      {status === 'error' && unsent ? (
        <div className={styles.formError} role="alert">
          <p className={styles.formErrorTitle}>That did not send.</p>
          <p className={styles.formErrorText}>
            {error && error !== GENERIC_ERROR ? `${error} ` : ''}Your answers are still here, so you can try again, or{' '}
            <a href={mailtoLink(unsent)}>email the referral instead</a> (it opens already written).
          </p>
        </div>
      ) : null}

      <div className={styles.actions}>
        {/* aria-disabled while sending, as on the brief: a disabled button would drop keyboard focus. */}
        <button
          type="submit"
          className={styles.primary}
          aria-disabled={status === 'sending' ? true : undefined}
          data-cta-placement="referral_signup_submit"
        >
          {status === 'sending' ? 'Sending…' : 'Send referral'}
        </button>
        <p className={styles.note}>We mention your introduction when we reach out.</p>
        {/* The brief's privacy line, for both addresses this form collects. */}
        <p className={styles.privacy}>
          We use these emails to contact you and the agency about this referral. We never sell them.{' '}
          <Link href="/privacy">Privacy policy</Link>
        </p>
      </div>

      {/* The badge is hidden site-wide (globals.scss), so Google's notice is shown in its own words. */}
      <RecaptchaNotice className={styles.recaptcha} />
    </form>
  );
}
