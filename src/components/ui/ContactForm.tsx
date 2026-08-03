'use client';

import { useState, useRef, FormEvent } from 'react';
import styles from './ContactForm.module.scss';

// reCAPTCHA v3 (invisible). Script loads lazily on first interaction with the
// form, so visitors who never touch it never download Google's JS. If the site
// key env is absent the form simply works without it (dev/preview safe).
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
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    s.async = true;
    s.onload = () => window.grecaptcha?.ready(resolve);
    s.onerror = () => resolve(); // never let a blocked script brick the form
    document.head.appendChild(s);
  });
  return recaptchaLoader;
}

async function getRecaptchaToken(): Promise<string | undefined> {
  if (!RECAPTCHA_SITE_KEY) return undefined;
  try {
    await loadRecaptcha();
    return await window.grecaptcha?.execute(RECAPTCHA_SITE_KEY, { action: 'contact' });
  } catch {
    return undefined; // server decides what to do with a missing token
  }
}

interface ContactFormProps {
  showPhone?: boolean;
  showContactMethod?: boolean;
  showSubject?: boolean;
  submitLabel?: string;
  compact?: boolean;
}

export default function ContactForm({
  showPhone = true,
  showContactMethod = true,
  showSubject = true,
  submitLabel = 'Send Message',
  compact = false,
}: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const warmedUp = useRef(false);

  // Start fetching Google's script the moment the visitor engages the form,
  // so the token is instant by the time they hit submit.
  const warmUpRecaptcha = () => {
    if (warmedUp.current) return;
    warmedUp.current = true;
    void loadRecaptcha();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const recaptchaToken = await getRecaptchaToken();

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      contactMethod: formData.get('contactMethod') as string || undefined,
      subject: formData.get('subject') as string || undefined,
      message: formData.get('message') as string,
      recaptchaToken,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Something went wrong.');
      }

      setStatus('success');
      form.reset();
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to send message. Please try again.'
      );
    }
  };

  if (status === 'success') {
    return (
      <div className={`${styles.message} ${styles.success}`} role="alert">
        Thank you! Your message has been sent. We&apos;ll get back to you within 24 hours.
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      onFocusCapture={warmUpRecaptcha}
      aria-label="Contact form"
    >
      {status === 'error' && (
        <div className={`${styles.message} ${styles.error}`} role="alert">
          {errorMessage}
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Name <span className={styles.required}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={styles.input}
            placeholder="Your full name"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            placeholder="you@company.com"
            required
          />
        </div>
      </div>

      {(showPhone || showContactMethod) && (
        <div className={styles.row}>
          {showPhone && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={styles.input}
                placeholder="+1 (000) 000-0000"
              />
            </div>
          )}
          {showContactMethod && (
            <div className={styles.field}>
              <span className={styles.label}>Preferred Contact Method</span>
              <div className={styles.radioGroup} role="radiogroup" aria-label="Contact method">
                <label className={styles.radioLabel}>
                  <input type="radio" name="contactMethod" value="email" defaultChecked />
                  Email
                </label>
                <label className={styles.radioLabel}>
                  <input type="radio" name="contactMethod" value="phone" />
                  Phone
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {showSubject && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="subject">
            Subject <span className={styles.required}>*</span>
          </label>
          <select id="subject" name="subject" className={styles.select} required defaultValue="">
            <option value="" disabled>
              Select a topic
            </option>
            <option value="Web Development">Web Development</option>
            <option value="Automation & AI Workflows">Automation & AI Workflows</option>
            <option value="Custom Internal Tools">Custom Internal Tools</option>
            <option value="Agency Partnership">Agency Partnership</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="message">
          Message <span className={styles.required}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          className={styles.textarea}
          placeholder={compact ? 'Tell us about your project...' : 'Tell us about your project, timeline, and any specific requirements...'}
          required
          rows={compact ? 4 : 6}
        />
      </div>

      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : submitLabel}
      </button>

      {RECAPTCHA_SITE_KEY && (
        // Required by Google's terms when the floating badge is hidden
        <p className={styles.recaptchaNotice}>
          Protected by reCAPTCHA -{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy
          </a>{' '}
          &middot;{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
            Terms
          </a>
        </p>
      )}
    </form>
  );
}
