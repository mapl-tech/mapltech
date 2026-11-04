'use client';

import Link from 'next/link';
import { useActionState, useEffect, useId, useRef, useState, type RefObject } from 'react';
import { estimateHref, estimateSubjectText, estimateSummaryText, type EstimateResult } from '@/lib/estimate';
import { PROJECT_LABEL } from '@/components/layout/chrome';
import Arrow from '@/components/ui/Arrow';
import { withLastWord } from '@/components/services/keepTogether';
import styles from './ScopeEstimator.module.scss';
import RecaptchaNotice from '@/components/convert/RecaptchaNotice';

/**
 * "Get it in writing": an optional step after the number (reciprocity), with
 * one field, the email, which it needs (so the field is required, not
 * labelled optional).
 * It posts the engine's plain-text summary plus the shareable URL to
 * /api/contact, which emails MAPL TECH with the visitor as Reply-To, so the
 * copy promises a reply in writing, not an automatic email. The visitor
 * gives no name here, so the request's required name says what it is
 * ("Estimate request") instead of repeating the email. On success the
 * disclosure gives way to one confirmation, no modal: it fills a status
 * region that is mounted (empty) from the first render, so it is announced,
 * focus moves to it (the button that had focus is gone), and the next step
 * follows it, "Start a project" with this estimate in the brief (the
 * readout's own link). Bots that fill the hidden "website" field get the
 * same confirmation and nothing is sent.
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
/** /api/contact requires a name; the visitor gives none here, so the request names what it is. */
const SENDER_NAME = 'Estimate request';
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
  const sentRef = useRef<HTMLParagraphElement>(null);
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
            name: SENDER_NAME,
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
  // Sent: the form is gone, so focus goes to the confirmation rather than falling to the page.
  useEffect(() => {
    if (state.status === 'error' && state.field === 'email') emailRef.current?.focus();
    if (state.status === 'sent') sentRef.current?.focus();
  }, [state]);

  const errorId = `${id}-error`;
  const privacyId = `${id}-privacy`;
  const error = state.status === 'error' ? state : null;
  const sent = state.status === 'sent' ? state : null;

  return (
    <>
      {sent ? null : (
        // Closed until asked for, like the card's other two disclosures: the total
        // and "Start a project" are the only things competing at the decision point.
        <SendDisclosure
          id={id}
          formAction={formAction}
          pending={pending}
          placement={placement}
          emailRef={emailRef}
          typed={typed}
          onType={setTyped}
          error={error}
          errorId={errorId}
          privacyId={privacyId}
        />
      )}
      {/* The confirmation's box. Its status region is in the page from the first render, empty,
          so the confirmation is announced when it fills in; the next step follows it, outside the
          region, so the announcement is the confirmation alone. */}
      <div className={sent ? styles.sent : undefined}>
        <div role="status">
          {sent ? (
            <p ref={sentRef} tabIndex={-1} className={styles.sentText}>
              Sent. We’ll reply to <strong>{sent.email}</strong> with this estimate in writing.
            </p>
          ) : null}
        </div>
        {sent ? (
          <p className={styles.sentNext}>
            <Link
              href={estimateHref(result.input, { path: '/contact-us', hash: null })}
              className={styles.inlineLink}
              data-cta-placement={`pricing_${placement}_sent_project`}
            >
              {/* One flex item: a label that wraps keeps its last word and the arrow together. */}
              <span>
                {withLastWord(
                  `${PROJECT_LABEL} with this estimate`,
                  <span aria-hidden="true" className={styles.sentArrow}>
                    <Arrow />
                  </span>,
                )}
              </span>
            </Link>
          </p>
        ) : null}
      </div>
    </>
  );
}

interface SendDisclosureProps {
  id: string;
  formAction: (payload: FormData) => void;
  pending: boolean;
  placement: string;
  emailRef: RefObject<HTMLInputElement | null>;
  typed: string;
  onType: (value: string) => void;
  error: { message: string; field?: 'email' } | null;
  errorId: string;
  privacyId: string;
}

/** "Want it in writing?": the email field, its error and privacy line, and Google's notice. */
function SendDisclosure({ id, formAction, pending, placement, emailRef, typed, onType, error, errorId, privacyId }: SendDisclosureProps) {
  return (
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
            onChange={(event) => onType(event.target.value)}
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
