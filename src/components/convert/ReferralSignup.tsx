'use client';

import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ESTIMATE_SERVICES, SERVICE_META } from '@/lib/estimate';
import { GENERIC_ERROR, field, isEmail, useContactSubmit } from './useContactSubmit';
import styles from '@/components/pricing/ReferralForm.module.scss';
import RecaptchaNotice from './RecaptchaNotice';

/**
 * The referral form (the live page's fields, kept): the four required ones on
 * show, you and the person you are introducing (name and email each); the
 * four optional ones (their agency's name, what they need, notes, your
 * company) folded behind "Add details (optional)", a native disclosure, so
 * the short form looks short. Required fields are validated on submit, then
 * again on blur once a first attempt has been made; their email must not be
 * your own. Each error sits under its field in the brief's pattern (a "!"
 * disc, then the sentence), is linked with aria-describedby, and focus moves
 * to the first one; the button is aria-disabled while sending, so it keeps
 * focus. Beside the button, the brief's own
 * privacy line, with the link to the policy. On success the form is replaced
 * by a status panel that takes focus. Posts to /api/contact with the subject
 * "Referral: <name>".
 */

type FieldKey = 'name' | 'email' | 'refName' | 'refEmail';
type Errors = Partial<Record<FieldKey, string>>;

const ORDER: FieldKey[] = ['name', 'email', 'refName', 'refEmail'];

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
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const id = (key: string) => `${uid}-${key}`;
  const sent = status === 'success' || botSent;

  // The status panel replaces the form; move focus to it so it is announced.
  useEffect(() => {
    if (sent) statusRef.current?.focus();
  }, [sent]);

  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    if (!attempted || !formRef.current) return;
    if (!(event.target instanceof HTMLInputElement)) return;
    setErrors(validate(new FormData(formRef.current)));
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

    const ok = await submit({
      name: field(data, 'name'),
      email: field(data, 'email'),
      subject: `Referral: ${refName}${refCompany ? ` (${refCompany})` : ''}`,
      message,
    });
    if (ok) setSentTo(refName);
  };

  const startOver = () => {
    reset();
    setBotSent(false);
    setErrors({});
    setAttempted(false);
    setNeed('');
    setSentTo('');
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

      {/* As the brief says it: a titled box, the API's own words when it sent some, then the way out. */}
      {status === 'error' ? (
        <div className={styles.formError} role="alert">
          <p className={styles.formErrorTitle}>That did not send.</p>
          <p className={styles.formErrorText}>
            {error && error !== GENERIC_ERROR ? `${error} ` : ''}Your answers are still here, so you can try again, or
            email the details to <a href="mailto:contact@mapltech.com">contact@mapltech.com</a>.
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
