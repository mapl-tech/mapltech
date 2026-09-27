'use client';

import type { FormEvent } from 'react';
import Cta from './Cta';
import { field, useContactSubmit } from './useContactSubmit';
import forms from './forms.module.scss';

/** "Don't see your fit?" — keeps passive candidates. Posts to /api/contact as "Talent list". */
export default function TalentListForm() {
  const { status, error, submit, warmUp } = useContactSubmit();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const data = new FormData(event.currentTarget);
    await submit({
      name: field(data, 'name'),
      email: field(data, 'email'),
      subject: 'Talent list',
      message: `Talent list sign-up\n\nWhat they do best:\n${field(data, 'about')}`,
    });
  };

  if (status === 'success') {
    return (
      <div className={`${forms.status} ${forms.statusSuccess}`} role="status">
        <strong className={forms.statusTitle}>Thanks, you&apos;re on the list.</strong>
        We&apos;ll be in touch when a matching role opens.
      </div>
    );
  }

  return (
    <form className={forms.form} onSubmit={onSubmit} onFocusCapture={warmUp} aria-label="Talent list">
      <div className={forms.row}>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="talent-name">
            Name
          </label>
          <input id="talent-name" name="name" type="text" autoComplete="name" className={forms.input} placeholder="Your full name" required />
        </div>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="talent-email">
            Email
          </label>
          <input
            id="talent-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={forms.input}
            placeholder="you@example.com"
            required
          />
        </div>
      </div>
      <div className={forms.field}>
        <label className={forms.label} htmlFor="talent-about">
          What you do best
        </label>
        <textarea
          id="talent-about"
          name="about"
          className={forms.textarea}
          rows={3}
          placeholder="Tell us what you do best and how you'd make our agency partners better."
          required
        />
      </div>
      {status === 'error' ? (
        <p className={forms.error} role="alert">
          {error}
        </p>
      ) : null}
      <div className={forms.actions}>
        <Cta placement="careers_talent_submit" type="submit" variant="secondary" size="medium" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Join the talent list'}
        </Cta>
      </div>
    </form>
  );
}
