'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Shared submit hook for every form on the convert pages. Posts JSON to
 * /api/contact ({ name, email, phone?, contactMethod?, subject?, message })
 * and mirrors ContactForm.tsx's reCAPTCHA v3 handling: the script loads on
 * first focus and only when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set, so visitors
 * who never touch a form never download it.
 */

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

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  contactMethod?: string;
  subject?: string;
  message: string;
}

export const RECAPTCHA_ENABLED = Boolean(RECAPTCHA_SITE_KEY);

export const GENERIC_ERROR = 'Failed to send message. Please try again.';

export function useContactSubmit() {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState('');
  const warmed = useRef(false);

  /** Call on first focus so the token is ready by the time the visitor submits. */
  const warmUp = useCallback(() => {
    if (warmed.current) return;
    warmed.current = true;
    void loadRecaptcha();
  }, []);

  const submit = useCallback(async (payload: ContactPayload): Promise<boolean> => {
    setStatus('sending');
    setError('');
    const recaptchaToken = await getRecaptchaToken();
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, recaptchaToken }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || GENERIC_ERROR);
      }
      setStatus('success');
      return true;
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError('');
  }, []);

  return { status, error, submit, warmUp, reset };
}

/** Trimmed string from FormData, '' when missing. */
export function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
