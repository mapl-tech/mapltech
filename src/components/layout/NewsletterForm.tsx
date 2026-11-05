'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import MagneticButton from '@/components/ui/MagneticButton';
import { announceLead } from '@/components/convert/lead';
import FieldError from '@/components/convert/FieldError';
import styles from './Footer.module.scss';
import own from './NewsletterForm.module.scss';

/**
 * Footer newsletter island. Posts { email } to /api/newsletter.
 *
 * The forms' pattern in one field: a visible label over the pill; the
 * browser's own bubbles are off (noValidate) and the address is checked
 * here, its format when the field is left with something in it, and again
 * on Subscribe (an empty field is only flagged then); an error clears as
 * soon as the address is fixed. Errors sit under the pill with the "!" disc
 * (FieldError), linked with aria-describedby, and focus returns to the field
 * (after a failed send too: the button is disabled while sending).
 * The space under the pill is kept, so an error never moves the button.
 * Subscribed: the confirmation replaces the form, takes focus, and says
 * where the next issue goes. A subscription the route accepts fires one
 * `lead` event ("newsletter").
 */

type Status = 'idle' | 'sending' | 'success' | 'error';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FAILED = 'We could not subscribe you just now. Try again in a moment.';

function emailProblem(value: string): string {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  return EMAIL.test(email) ? '' : 'Enter an email address like name@agency.com.';
}

export default function NewsletterForm() {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  // `n` remounts the line for a repeated refusal, so the same words are announced again.
  const [error, setError] = useState<{ message: string; n: number; alert: boolean } | null>(null);
  const [subscribed, setSubscribed] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (subscribed) doneRef.current?.focus();
  }, [subscribed]);

  const flag = (message: string, alert: boolean) => setError((current) => (message ? { message, n: (current?.n ?? 0) + 1, alert } : null));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const problem = emailProblem(email);
    if (problem) {
      flag(problem, false);
      inputRef.current?.focus();
      return;
    }
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error(`newsletter ${res.status}`);
      announceLead('newsletter');
      setStatus('success');
      setSubscribed(email.trim());
    } catch {
      setStatus('error');
      flag(FAILED, true);
      // The button was disabled while sending, which drops focus; the field is where a retry starts.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  if (subscribed) {
    return (
      <p ref={doneRef} className={`${styles.formMessage} ${own.done}`} role="status" tabIndex={-1} data-state="success">
        You’re subscribed. The next issue goes to <strong>{subscribed}</strong>.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} aria-label="Newsletter signup" noValidate>
      <label htmlFor={inputId} className={own.label}>
        Your email
      </label>
      <div className={styles.formRow}>
        <input
          ref={inputRef}
          id={inputId}
          className={styles.input}
          type="email"
          name="email"
          placeholder="you@agency.com"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="off"
          spellCheck={false}
          required
          value={email}
          onChange={(event) => {
            const value = event.target.value;
            setEmail(value);
            if (error && !error.alert && !emailProblem(value)) setError(null);
          }}
          onBlur={(event) => {
            // Leaving the field: only a malformed address is flagged; an empty one waits for Subscribe.
            const value = event.target.value;
            if (value.trim()) flag(emailProblem(value), false);
          }}
          aria-invalid={error && !error.alert ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <span data-cta-placement="footer_newsletter">
          <MagneticButton
            type="submit"
            size="small"
            placement="footer_newsletter"
            disabled={status === 'sending'}
            className={styles.formBtn}
          >
            {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
          </MagneticButton>
        </span>
      </div>
      <div className={own.message}>
        {error ? (
          <FieldError key={error.n} id={errorId} alert={error.alert}>
            {error.message}
          </FieldError>
        ) : null}
      </div>
    </form>
  );
}
