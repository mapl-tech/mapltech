'use client';

import type { FormEvent } from 'react';
import Recaptcha from '@/components/convert/Recaptcha';
import { useContactSubmit } from '@/components/convert/useContactSubmit';
import styles from './ContactForm.module.scss';

// Not rendered anywhere today. It sends through the shared useContactSubmit,
// so it gets the same reCAPTCHA v2 checkbox as the live forms (only when
// NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set; Google's script loads on the first
// focus or press in the form) and fires the same `lead` event on success.

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
  submitLabel = 'Send message',
  compact = false,
}: ContactFormProps) {
  const { status, error: errorMessage, submit, captcha } = useContactSubmit('contact_form');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const ok = await submit({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || undefined,
      contactMethod: (formData.get('contactMethod') as string) || undefined,
      subject: (formData.get('subject') as string) || undefined,
      message: formData.get('message') as string,
    });
    if (ok) form.reset();
  };

  if (status === 'success') {
    return (
      <div className={`${styles.message} ${styles.success}`} role="alert">
        Thank you. Your message has been sent. We will reply within 24 hours.
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
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
              <span className={styles.label}>Preferred contact method</span>
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
          placeholder={compact ? 'Tell us about your project…' : 'Tell us about your project, your timeline and anything we should know…'}
          required
          rows={compact ? 4 : 6}
        />
      </div>

      {/* After the last field, before the button. */}
      <Recaptcha control={captcha} theme="dark" />

      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : submitLabel}
      </button>
    </form>
  );
}
