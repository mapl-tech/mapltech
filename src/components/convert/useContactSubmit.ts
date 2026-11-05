'use client';

import { useCallback, useState } from 'react';
import { announceLead, type LeadForm } from './lead';
import { useRecaptcha } from './Recaptcha';

/**
 * Shared submit hook for every form on the convert pages.
 *
 * - `submit(payload)` posts JSON to /api/contact ({ name, email, phone?,
 *   contactMethod?, subject?, message, recaptchaToken? }): the brief, the
 *   referral, the regional inquiries.
 * - `submitForm(data)` posts multipart to /api/apply (the careers forms, so a
 *   resume can come with them), adding the reCAPTCHA token to `data`. A
 *   refusal the server ties to a field comes back as `errorField`, so the form
 *   can put the words under that field rather than in its failure box.
 *
 * reCAPTCHA v2: the hook owns the form's "I'm not a robot" state (`captcha`);
 * the form places <Recaptcha control={captcha} /> just before its send
 * button. Nothing is sent while the box is unticked (the widget says why) and
 * the box is cleared after every send that reached the server, since a token
 * works once. With no NEXT_PUBLIC_RECAPTCHA_SITE_KEY there is no widget and
 * every send goes out without a token, as before.
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
  /** The page a regional inquiry came from ("/nigeria"): the server leads the subject with it. */
  source?: string;
}

export { RECAPTCHA_ENABLED } from './recaptchaLoader';

export const GENERIC_ERROR = 'Failed to send message. Please try again.';

class Refusal extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message);
  }
}

export function useContactSubmit(form: LeadForm) {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<string | undefined>(undefined);
  const captcha = useRecaptcha();
  const { check: checkCaptcha, reset: resetCaptcha } = captcha;

  /** One send: the captcha check, the request, the status, the lead. */
  const send = useCallback(
    async (request: (token: string | undefined) => Promise<Response>): Promise<boolean> => {
      // Not ticked: nothing is sent, and the status stays as it was (the widget shows the message).
      const verdict = checkCaptcha();
      if (!verdict.ok) return false;
      setStatus('sending');
      setError('');
      setErrorField(undefined);
      try {
        const res = await request(verdict.token);
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string; field?: string };
          throw new Refusal(body.error || GENERIC_ERROR, body.field);
        }
        setStatus('success');
        announceLead(form);
        return true;
      } catch (err) {
        setStatus('error');
        // The API's own messages pass through; a network failure (fetch rejects
        // with a TypeError: "Failed to fetch", "Load failed") gets the plain one.
        setError(err instanceof Error && !(err instanceof TypeError) ? err.message : GENERIC_ERROR);
        setErrorField(err instanceof Refusal ? err.field : undefined);
        return false;
      } finally {
        resetCaptcha();
      }
    },
    [checkCaptcha, resetCaptcha, form],
  );

  const submit = useCallback(
    (payload: ContactPayload) =>
      send((recaptchaToken) =>
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, recaptchaToken }),
        }),
      ),
    [send],
  );

  const submitForm = useCallback(
    (data: FormData, endpoint = '/api/apply') =>
      send((recaptchaToken) => {
        if (recaptchaToken) data.set('recaptchaToken', recaptchaToken);
        // No Content-Type: the browser writes the multipart boundary itself.
        return fetch(endpoint, { method: 'POST', body: data });
      }),
    [send],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError('');
    setErrorField(undefined);
  }, []);

  return { status, error, errorField, submit, submitForm, reset, captcha };
}

/** Trimmed string from FormData, '' when missing. */
export function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
