'use client';

import { useActionState, useId } from 'react';
import { estimateSubjectText, estimateSummaryText, type EstimateResult } from '@/lib/estimate';
import Cta from './Cta';
import styles from './ScopeEstimator.module.scss';

/**
 * Interaction IX-4: "Send this estimate" needs only an email. It posts the
 * engine's plain-text summary (plus the shareable URL) to /api/contact and
 * replaces the form with one inline <output> line - no modal. Bots that fill
 * the hidden "website" field get the same success line and nothing is sent.
 */

type SendState = { status: 'idle' } | { status: 'sent'; email: string } | { status: 'error'; message: string };

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

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
  /** 'rail' | 'sheet' - namespaces ids and CTA placements. */
  placement: string;
}

export default function SendEstimateForm({ result, placement }: SendEstimateFormProps) {
  const id = useId();

  const [state, formAction, pending] = useActionState<SendState, FormData>(
    async (_previous, formData) => {
      const email = String(formData.get('email') ?? '').trim();
      const honeypot = String(formData.get('website') ?? '');
      if (!email) return { status: 'error', message: 'Enter the email address to send this estimate to.' };
      if (honeypot) return { status: 'sent', email };

      const recaptchaToken = await getRecaptchaToken();
      const payload = {
        name: email,
        email,
        subject: estimateSubjectText(result),
        message: estimateSummaryText(result, { shareUrl: window.location.href }),
        contactMethod: 'email',
        recaptchaToken,
      };

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string };
          return { status: 'error', message: body.error || 'Could not send. Please try again.' };
        }
        return { status: 'sent', email };
      } catch {
        return { status: 'error', message: 'Could not send. Check your connection and try again.' };
      }
    },
    { status: 'idle' },
  );

  if (state.status === 'sent') {
    return (
      <output className={styles.sent} role="status">
        Sent. We&apos;ll reply to <strong>{state.email}</strong> with this estimate in writing.
      </output>
    );
  }

  return (
    <form action={formAction} className={styles.send}>
      <label htmlFor={`${id}-email`} className={styles.label}>
        Email <span>(the only field)</span>
      </label>
      <div className={styles.sendRow}>
        <input
          id={`${id}-email`}
          className={styles.input}
          type="email"
          name="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="you@agency.com"
          aria-describedby={state.status === 'error' ? `${id}-error` : undefined}
          aria-invalid={state.status === 'error' || undefined}
        />
        <Cta type="submit" size="small" disabled={pending} placement={`pricing_${placement}_send`}>
          {pending ? 'Sending…' : 'Send this estimate'}
        </Cta>
      </div>
      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.status === 'error' && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
