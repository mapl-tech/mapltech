'use client';

import { useCallback, useState } from 'react';
import { announceLead, type LeadForm } from './lead';
import { useRecaptcha } from './Recaptcha';

/**
 * Shared submit hook for every form on the convert pages. Posts JSON to
 * /api/contact ({ name, email, phone?, contactMethod?, subject?, message,
 * recaptchaToken? }).
 *
 * reCAPTCHA v2: the hook owns the form's "I'm not a robot" state (`captcha`);
 * the form places <Recaptcha control={captcha} /> just before its send
 * button. `submit` sends nothing while the box is unticked (the widget says
 * why) and clears the box after every send that reached the server, since a
 * token works once. With no NEXT_PUBLIC_RECAPTCHA_SITE_KEY there is no widget
 * and every send goes out without a token, as before.
 *
 * A send the server accepts fires one `lead` event naming the form (lead.ts).
 */

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  contactMethod?: string;
  subject?: string;
  message: string;
}

export { RECAPTCHA_ENABLED } from './recaptchaLoader';

export const GENERIC_ERROR = 'Failed to send message. Please try again.';

export function useContactSubmit(form: LeadForm) {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState('');
  const captcha = useRecaptcha();
  const { check: checkCaptcha, reset: resetCaptcha } = captcha;

  const submit = useCallback(
    async (payload: ContactPayload): Promise<boolean> => {
      // Not ticked: nothing is sent, and the status stays as it was (the widget shows the message).
      const verdict = checkCaptcha();
      if (!verdict.ok) return false;
      setStatus('sending');
      setError('');
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, recaptchaToken: verdict.token }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error || GENERIC_ERROR);
        }
        setStatus('success');
        announceLead(form);
        return true;
      } catch (err) {
        setStatus('error');
        // The API's own messages pass through; a network failure (fetch rejects
        // with a TypeError: "Failed to fetch", "Load failed") gets the plain one.
        setError(err instanceof Error && !(err instanceof TypeError) ? err.message : GENERIC_ERROR);
        return false;
      } finally {
        resetCaptcha();
      }
    },
    [checkCaptcha, resetCaptcha, form],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError('');
  }, []);

  return { status, error, submit, reset, captcha };
}

/** Trimmed string from FormData, '' when missing. */
export function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
