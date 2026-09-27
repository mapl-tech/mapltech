'use client';

import { useActionState, useId } from 'react';
import MagneticButton from '@/components/ui/MagneticButton';
import styles from './Footer.module.scss';

/**
 * Footer newsletter island. Posts { email } to the existing /api/newsletter
 * route; success and error states render inline (role="status").
 */

type State = { status: 'idle' | 'success' | 'error'; message: string };

const IDLE: State = { status: 'idle', message: '' };

async function subscribe(_previous: State, formData: FormData): Promise<State> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { status: 'error', message: 'Enter your email address.' };
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`newsletter ${res.status}`);
    return { status: 'success', message: 'Thanks for subscribing.' };
  } catch {
    return { status: 'error', message: 'Could not subscribe right now. Please try again.' };
  }
}

export default function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, IDLE);
  const inputId = useId();

  if (state.status === 'success') {
    return (
      <p className={styles.formMessage} role="status" data-state="success">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className={styles.form} aria-label="Newsletter signup">
      <div className={styles.formRow}>
        <label htmlFor={inputId} className="visually-hidden">
          Email address
        </label>
        <input
          id={inputId}
          className={styles.input}
          type="email"
          name="email"
          placeholder="you@agency.com"
          autoComplete="email"
          inputMode="email"
          required
          disabled={pending}
        />
        <span data-cta-placement="footer_newsletter">
          <MagneticButton type="submit" size="small" placement="footer_newsletter" disabled={pending} className={styles.formBtn}>
            {pending ? 'Subscribing…' : 'Subscribe'}
          </MagneticButton>
        </span>
      </div>
      <p className={styles.formMessage} role="status" aria-live="polite" data-state={state.status}>
        {state.status === 'error' ? state.message : ''}
      </p>
    </form>
  );
}
