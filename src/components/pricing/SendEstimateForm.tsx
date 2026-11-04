'use client';

import Link from 'next/link';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import { estimateSubjectText, estimateSummaryText, type EstimateResult } from '@/lib/estimate';
import styles from './ScopeEstimator.module.scss';
import RecaptchaNotice from '@/components/convert/RecaptchaNotice';

/**
 * "Get it in writing": an optional step after the number (reciprocity), with
 * one field, the email, which it needs (so the field is required, not
 * labelled optional).
 * It posts the engine's plain-text summary plus the shareable URL to
 * /api/contact, which emails MAPL TECH with the visitor as Reply-To, so the
 * copy promises a reply in writing, not an automatic email. The form is
 * replaced by one inline status line; no modal. Bots that fill the hidden
 * "website" field get the same success line and nothing is sent.
 *
 * As on the brief: the email's privacy line sits under the field (the brief's
 * words, "about your estimate" for "about your brief", and its link), and a
 * failed check moves focus to the field with the error read beside it. The
 * field is controlled, so a failed send keeps what was typed.
 */

type SendState =
  | { status: 'idle' }
  | { status: 'sent'; email: string }
  | { status: 'error'; message: string; field?: 'email' };

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEND_FAILED =
  'That didn’t send. Check the email address, or write to contact@mapltech.com and attach the estimate link.';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

let recaptchaLoader: Promise<void> | null = null;

// Same lazy loader as ContactForm: Google's script is fetched on first use only.
function loadRecaptcha(): Promise<void> {
  if (!RECAPTCHA_SITE_KEY) return Promise.resolve();
  if (recaptchaLoader) return recaptchaLoader;
  recaptchaLoader = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.onload = () => window.grecaptcha?.ready(resolve);
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
  return recaptchaLoader;
}

async function getRecaptchaToken(): Promise<string | undefined> {
  if (!RECAPTCHA_SITE_KEY) return undefined;
  try {
    await loadRecaptcha();
    return await window.grecaptcha?.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });
  } catch {
    return undefined;
  }
}

interface SendEstimateFormProps {
  result: EstimateResult;
  /** Namespaces the CTA placement ("pricing_<placement>_send"). */
  placement?: string;
}

export default function SendEstimateForm({ result, placement = 'estimate' }: SendEstimateFormProps) {
  const id = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState('');

  const [state, formAction, pending] = useActionState<SendState, FormData>(
    async (_previous, formData) => {
      const email = String(formData.get('email') ?? '').trim();
      const honeypot = String(formData.get('website') ?? '');
      if (!email) return { status: 'error', message: 'Enter your email address, like you@agency.com.', field: 'email' };
      if (!EMAIL.test(email)) {
        return { status: 'error', message: 'Enter the email address in the format name@agency.com.', field: 'email' };
      }
      if (honeypot) return { status: 'sent', email };

      const recaptchaToken = await getRecaptchaToken();
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: email,
            email,
            subject: estimateSubjectText(result),
            message: estimateSummaryText(result, { shareUrl: window.location.href }),
            contactMethod: 'email',
            recaptchaToken,
          }),
        });
        if (!response.ok) return { status: 'error', message: SEND_FAILED };
        return { status: 'sent', email };
      } catch {
        return { status: 'error', message: SEND_FAILED };
      }
    },
    { status: 'idle' },
  );

  // A failed check: focus goes to the field to fix, which reads its error (aria-describedby).
  useEffect(() => {
    if (state.status === 'error' && state.field === 'email') emailRef.current?.focus();
  }, [state]);

  if (state.status === 'sent') {
    return (
      <output className={styles.sent} role="status">
        Sent. We’ll reply to <strong>{state.email}</strong> with this estimate in writing.
      </output>
    );
  }

  const errorId = `${id}-error`;
  const privacyId = `${id}-privacy`;
  const error = state.status === 'error' ? state : null;

  return (
    // Closed until asked for, like the card's other two disclosures: the total
    // and "Start a project" are the only things competing at the decision point.
    <details className={styles.disclosure} data-send="">
      <summary id={`${id}-title`} className={styles.disclosureSummary}>
        Want it in writing?
      </summary>
      <form action={formAction} className={styles.send} noValidate aria-labelledby={`${id}-title`}>
        <label htmlFor={`${id}-email`} className={styles.sendLabel}>
          Your email
        </label>
        <div className={styles.sendRow}>
          <input
            ref={emailRef}
            id={`${id}-email`}
            className={styles.input}
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="you@agency.com"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            required
            aria-describedby={error ? `${errorId} ${privacyId}` : privacyId}
            aria-invalid={error?.field === 'email' || undefined}
          />
          <button type="submit" className={styles.secondary} disabled={pending} data-cta-placement={`pricing_${placement}_send`}>
            {pending ? 'Sending…' : 'Get it in writing'}
          </button>
        </div>
        <div className={styles.honeypot} aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        {/* A check error is read with the field focus moves to; a failed send has no field to
            move to, so it is announced. */}
        {error ? (
          <p id={errorId} className={styles.error} role={error.field ? undefined : 'alert'}>
            {error.message}
          </p>
        ) : null}
        <p id={privacyId} className={styles.privacy}>
          We use your email to contact you about your estimate. We never sell it. <Link href="/privacy">Privacy policy</Link>
        </p>
        {/* The badge is hidden site-wide (globals.scss), so Google's notice is shown in its own words. */}
        <RecaptchaNotice className={styles.recaptcha} />
      </form>
    </details>
  );
}
