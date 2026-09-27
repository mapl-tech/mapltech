'use client';

import { useActionState, useId, useRef } from 'react';
import MagneticButton from '@/components/ui/MagneticButton';
import styles from './ServiceBriefForm.module.scss';

export interface ServiceBriefFormProps {
  /** Published page name, e.g. "Custom Web Development for Agencies". */
  serviceName: string;
  /** Short name used in the email subject, e.g. "Web Development". */
  shortName: string;
  /** Route the brief was sent from. */
  path: string;
  submitLabel: string;
  placeholder: string;
  /** Analytics prefix (service slug). */
  slug: string;
}

interface BriefState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

const IDLE: BriefState = { status: 'idle' };

// reCAPTCHA v3 (invisible), mirrored from ContactForm: the script loads on the
// first focus inside the form and a token is fetched on submit. Without the
// public site key the form works unprotected (dev/preview safe); the API
// route only enforces the check when its secret is configured.
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
}

function grecaptcha(): Grecaptcha | undefined {
  return (window as Window & { grecaptcha?: Grecaptcha }).grecaptcha;
}

let recaptchaLoader: Promise<void> | null = null;

function loadRecaptcha(): Promise<void> {
  if (!RECAPTCHA_SITE_KEY) return Promise.resolve();
  if (recaptchaLoader) return recaptchaLoader;
  recaptchaLoader = new Promise((resolve) => {
    if (grecaptcha()) {
      grecaptcha()?.ready(resolve);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.onload = () => grecaptcha()?.ready(resolve);
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
  return recaptchaLoader;
}

async function recaptchaToken(): Promise<string | undefined> {
  if (!RECAPTCHA_SITE_KEY) return undefined;
  try {
    await loadRecaptcha();
    return await grecaptcha()?.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });
  } catch {
    return undefined;
  }
}

async function sendBrief(
  formData: FormData,
  meta: { serviceName: string; shortName: string; path: string },
): Promise<BriefState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const brief = String(formData.get('brief') ?? '').trim();

  if (!name || !email || !brief) {
    return { status: 'error', message: 'Please fill in your name, work email and a short brief.' };
  }

  const message = [`Service: ${meta.serviceName}`, `Sent from: ${meta.path}`, '', brief].join('\n');

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        subject: `${meta.shortName} brief`,
        message,
        recaptchaToken: await recaptchaToken(),
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return { status: 'error', message: body.error ?? 'Failed to send. Please try again.' };
    }
    return { status: 'success' };
  } catch {
    return { status: 'error', message: 'Failed to send. Please try again or email contact@mapltech.com.' };
  }
}

/**
 * The 3-field brief in the CTA band. Posts JSON to /api/contact
 * ({ name, email, subject, message }) with the service prefilled into the
 * message; success and error states render inline. `useActionState` keeps the
 * pending state and the result without extra client state.
 */
export default function ServiceBriefForm({ serviceName, shortName, path, submitLabel, placeholder, slug }: ServiceBriefFormProps) {
  const uid = useId();
  const warmed = useRef(false);

  const [state, formAction, pending] = useActionState<BriefState, FormData>(
    (_prev, formData) => sendBrief(formData, { serviceName, shortName, path }),
    IDLE,
  );

  const warmUp = () => {
    if (warmed.current) return;
    warmed.current = true;
    void loadRecaptcha();
  };

  if (state.status === 'success') {
    return (
      <div className={styles.form} aria-live="polite">
        <p className={styles.eyebrow}>Brief received</p>
        <p className={styles.success} role="status">
          Thank you! Your {shortName} brief has been sent. We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} action={formAction} onFocusCapture={warmUp} aria-labelledby={`${uid}-legend`}>
      <p id={`${uid}-legend`} className={styles.eyebrow}>
        Or send a brief · 3 fields
      </p>

      {state.status === 'error' ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${uid}-name`}>
          Name
        </label>
        <input
          id={`${uid}-name`}
          name="name"
          type="text"
          autoComplete="name"
          className={styles.input}
          placeholder="Your full name"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${uid}-email`}>
          Work email
        </label>
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className={styles.input}
          placeholder="you@agency.com"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${uid}-brief`}>
          What are you building?
        </label>
        <p className={styles.prefill}>
          Service: <span>{serviceName}</span>
        </p>
        <textarea
          id={`${uid}-brief`}
          name="brief"
          className={styles.textarea}
          placeholder={placeholder}
          rows={5}
          required
        />
      </div>

      <div data-cta-placement={`${slug}_band_form`} className={styles.submit}>
        <MagneticButton type="submit" size="large" disabled={pending} placement={`${slug}_band_form`}>
          {pending ? 'Sending…' : submitLabel}
        </MagneticButton>
      </div>

      {RECAPTCHA_SITE_KEY ? (
        <p className={styles.recaptcha}>
          Protected by reCAPTCHA. Google&apos;s{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          apply.
        </p>
      ) : null}
    </form>
  );
}
