'use client';

import type { FormEvent } from 'react';
import Cta from './Cta';
import { RECAPTCHA_ENABLED, field, useContactSubmit } from './useContactSubmit';
import forms from './forms.module.scss';

/**
 * Referral form (the current page's fields, kept): who you are + the agency
 * you're introducing. Posts to /api/contact with subject "Referral: <agency>".
 */
export default function ReferralSignup() {
  const { status, error, submit, warmUp } = useContactSubmit();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const data = new FormData(event.currentTarget);
    const refName = field(data, 'refName');
    const refCompany = field(data, 'refCompany');
    const yourCompany = field(data, 'yourCompany');
    const notes = field(data, 'refNotes');

    const message = [
      'Referral',
      `Referral's name: ${refName}`,
      `Referral's email: ${field(data, 'refEmail')}`,
      refCompany ? `Referral's company: ${refCompany}` : null,
      '',
      `Referred by: ${field(data, 'name')}${yourCompany ? ` (${yourCompany})` : ''}`,
      '',
      notes ? `Notes:\n${notes}` : 'No additional notes.',
    ]
      .filter((line): line is string => line !== null)
      .join('\n');

    await submit({
      name: field(data, 'name'),
      email: field(data, 'email'),
      subject: `Referral: ${refName}${refCompany ? ` (${refCompany})` : ''}`,
      message,
    });
  };

  if (status === 'success') {
    return (
      <div className={`${forms.status} ${forms.statusSuccess}`} role="alert">
        <strong className={forms.statusTitle}>Thank you for your referral!</strong>
        We&apos;ll reach out to them soon.
      </div>
    );
  }

  return (
    <form className={forms.form} onSubmit={onSubmit} onFocusCapture={warmUp} aria-label="Referral form">
      <fieldset className={forms.fieldset}>
        <legend className={forms.legend}>About you</legend>
        <div className={forms.row}>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="ref-your-name">
              Your name
            </label>
            <input id="ref-your-name" name="name" type="text" autoComplete="name" className={forms.input} placeholder="Your full name" required />
          </div>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="ref-your-email">
              Your email
            </label>
            <input
              id="ref-your-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className={forms.input}
              placeholder="you@company.com"
              required
            />
          </div>
        </div>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="ref-your-company">
            Company <span className={forms.optional}>(optional)</span>
          </label>
          <input id="ref-your-company" name="yourCompany" type="text" autoComplete="organization" className={forms.input} placeholder="Agency or company name" />
        </div>
      </fieldset>

      <fieldset className={forms.fieldset}>
        <legend className={forms.legend}>The agency you&apos;re introducing</legend>
        <div className={forms.row}>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="ref-name">
              Referral&apos;s name
            </label>
            <input id="ref-name" name="refName" type="text" className={forms.input} placeholder="Contact person or agency name" required />
          </div>
          <div className={forms.field}>
            <label className={forms.label} htmlFor="ref-email">
              Referral&apos;s email
            </label>
            <input id="ref-email" name="refEmail" type="email" inputMode="email" className={forms.input} placeholder="referral@agency.com" required />
          </div>
        </div>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="ref-company">
            Referral&apos;s company <span className={forms.optional}>(optional)</span>
          </label>
          <input id="ref-company" name="refCompany" type="text" className={forms.input} placeholder="Agency or company name" />
        </div>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="ref-notes">
            Additional notes <span className={forms.optional}>(optional)</span>
          </label>
          <textarea
            id="ref-notes"
            name="refNotes"
            className={forms.textarea}
            rows={4}
            placeholder="Tell us about their needs or any context that would help us reach out..."
          />
        </div>
      </fieldset>

      {status === 'error' ? (
        <p className={forms.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={forms.actions}>
        <Cta placement="referral_signup_submit" type="submit" size="medium" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Submit Referral'}
        </Cta>
      </div>

      {RECAPTCHA_ENABLED ? (
        <p className={forms.recaptcha}>
          Protected by reCAPTCHA –{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Privacy
          </a>{' '}
          ·{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
            Terms
          </a>
        </p>
      ) : null}
    </form>
  );
}
