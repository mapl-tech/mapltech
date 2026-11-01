'use client';

import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from 'react';
import { ESTIMATE_SERVICES, SERVICE_META } from '@/lib/estimate';
import { useReferralChoice } from '@/components/pricing/referralChoice';
import { RECAPTCHA_ENABLED, field, isEmail, useContactSubmit } from './useContactSubmit';
import styles from '@/components/pricing/ReferralForm.module.scss';

/**
 * The referral form (the live page's fields, kept: you, and the agency you
 * are introducing). Required fields are validated on submit, then again on
 * blur once a first attempt has been made; each error sits under its field,
 * is linked with aria-describedby, and focus moves to the first one. On
 * success the form is replaced by a status panel that takes focus. Posts to
 * /api/contact with the subject "Referral: <name>". "What do they need?"
 * starts from the visitor's own choice in the calculator above, if they made
 * one, and says so.
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
  if (!field(data, 'refName')) errors.refName = 'Enter the name of the person or agency you are introducing.';
  const refEmail = field(data, 'refEmail');
  if (!refEmail) errors.refEmail = 'Enter their email address so we can reach them.';
  else if (!isEmail(refEmail)) errors.refEmail = 'Enter an email address like name@agency.com.';
  return errors;
}

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  wide?: boolean;
  children: (describedBy: string | undefined) => ReactNode;
}

function Field({ id, label, optional = false, error, hint, wide = false, children }: FieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ''}`.trim()}>
      <label htmlFor={id} className={styles.label}>
        {label} {optional ? <span className={styles.optional}>(optional)</span> : null}
      </label>
      {children(describedBy)}
      {hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={styles.fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function ReferralSignup() {
  const uid = useId();
  const { status, submit, warmUp, reset } = useContactSubmit();
  const choice = useReferralChoice();
  const [picked, setPicked] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [botSent, setBotSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const id = (key: string) => `${uid}-${key}`;
  const need = picked ?? choice ?? '';
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
    setPicked(null);
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
          <Field id={id('yourCompany')} label="Your company" optional wide>
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
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>The agency you are introducing</legend>
        <div className={styles.fields}>
          <Field id={id('refName')} label="Contact or agency name" error={errors.refName}>
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
          <Field id={id('refCompany')} label="Agency name" optional>
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
          <Field
            id={id('refNeed')}
            label="What do they need?"
            optional
            hint={picked === null && choice ? 'From your choice in the calculator. Change it if you like.' : undefined}
          >
            {(describedBy) => (
              <select
                id={id('refNeed')}
                name="refNeed"
                className={styles.select}
                value={need}
                onChange={(event) => setPicked(event.target.value)}
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
          <Field id={id('refNotes')} label="Anything that would help us reach out?" optional wide>
            {(describedBy) => (
              <textarea id={id('refNotes')} name="refNotes" rows={4} className={styles.textarea} aria-describedby={describedBy} />
            )}
          </Field>
        </div>
      </fieldset>

      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === 'error' ? (
        <p className={styles.formError} role="alert">
          That didn&apos;t send. Check your connection and try again, or email the details to{' '}
          <a href="mailto:contact@mapltech.com">contact@mapltech.com</a>.
        </p>
      ) : null}

      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={status === 'sending'} data-cta-placement="referral_signup_submit">
          {status === 'sending' ? 'Sending…' : 'Send referral'}
        </button>
        <p className={styles.note}>We mention your introduction when we reach out.</p>
      </div>

      {RECAPTCHA_ENABLED ? (
        <p className={styles.recaptcha}>
          Protected by reCAPTCHA:{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy<span className="visually-hidden"> (opens in a new tab)</span>
          </a>{' '}
          ·{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
            Terms<span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </p>
      ) : null}
    </form>
  );
}
