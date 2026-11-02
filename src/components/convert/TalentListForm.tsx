'use client';

import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { checkField, checkForm, type FieldRule } from '@/components/company/formErrors';
import css from '@/components/company/CareersForm.module.scss';
import Cta from './Cta';
import { field, useContactSubmit } from './useContactSubmit';
import forms from './forms.module.scss';

/**
 * "Don't see your fit?": three fields for people with no listed role yet.
 * Posts to /api/contact as "Talent list". Same error pattern as the apply
 * form: messages under the field, a summary on a failed submit with focus on
 * the first problem, and the success message takes focus.
 */

const RULES: Record<string, FieldRule> = {
  name: { required: 'Enter your name.' },
  email: { required: 'Enter your email address.', email: true },
  about: { required: 'Tell us in a sentence what you do best.' },
};

const ORDER = ['name', 'email', 'about'] as const;

export default function TalentListForm({ contactEmail }: { contactEmail?: string }) {
  const { status, submit, warmUp } = useContactSubmit();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    // Sending disabled the button and dropped focus; return it for a retry.
    if (status === 'error') formRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus();
  }, [status]);

  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const rule = RULES[target.name];
    if (!rule) return;
    const message = checkField(target.value, rule);
    setErrors((prev) => {
      const next = { ...prev };
      if (message && (target.value.trim() || prev[target.name])) next[target.name] = message;
      else delete next[target.name];
      return next;
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const data = new FormData(event.currentTarget);
    const found = checkForm(data, RULES);
    setErrors(found);
    const problems = ORDER.filter((name) => found[name]);
    if (problems.length) {
      setSummary(`${problems.length === 1 ? 'One field needs' : `${problems.length} fields need`} attention before this can send.`);
      formRef.current?.querySelector<HTMLElement>(`[name="${problems[0]}"]`)?.focus();
      return;
    }
    setSummary('');
    await submit({
      name: field(data, 'name'),
      email: field(data, 'email'),
      subject: 'Talent list',
      message: `Talent list sign-up\n\nWhat they do best:\n${field(data, 'about')}`,
    });
  };

  if (status === 'success') {
    return (
      <div ref={successRef} className={`${forms.status} ${forms.statusSuccess} ${css.done}`} role="status" tabIndex={-1}>
        <strong className={forms.statusTitle}>You&apos;re on the list.</strong>
        <span>We&apos;ll be in touch when a matching role opens.</span>
      </div>
    );
  }

  const describedBy = (name: string) => (errors[name] ? `talent-${name}-error` : undefined);

  return (
    <form
      ref={formRef}
      className={`${forms.form} ${css.form}`}
      onSubmit={onSubmit}
      onBlur={onBlur}
      onFocusCapture={warmUp}
      noValidate
      aria-label="Join the talent list"
      aria-describedby="talent-form-note"
    >
      <p id="talent-form-note" className={css.note}>
        All three fields are required.
      </p>

      {summary ? (
        <p className={css.summary} role="alert">
          {summary}
        </p>
      ) : null}

      <div className={forms.row}>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="talent-name">
            Name
          </label>
          <input
            id="talent-name"
            name="name"
            type="text"
            autoComplete="name"
            className={forms.input}
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy('name')}
          />
          {errors.name ? (
            <p id="talent-name-error" className={forms.error}>
              {errors.name}
            </p>
          ) : null}
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
            spellCheck={false}
            className={forms.input}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('email')}
          />
          {errors.email ? (
            <p id="talent-email-error" className={forms.error}>
              {errors.email}
            </p>
          ) : null}
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
          required
          aria-invalid={errors.about ? true : undefined}
          aria-describedby={describedBy('about')}
        />
        {errors.about ? (
          <p id="talent-about-error" className={forms.error}>
            {errors.about}
          </p>
        ) : null}
      </div>

      {status === 'error' ? (
        <p className={css.failed} role="alert">
          That didn&apos;t send. Try again
          {contactEmail ? (
            <>
              , or email <a href={`mailto:${contactEmail}?subject=${encodeURIComponent('Talent list')}`}>{contactEmail}</a>
            </>
          ) : null}
          .
        </p>
      ) : null}

      <div className={`${forms.actions} ${css.actions}`}>
        <Cta
          placement="careers_talent_submit"
          type="submit"
          variant="secondary"
          size="medium"
          disabled={status === 'sending'}
          wrapperClassName={css.submit}
        >
          {status === 'sending' ? 'Sending…' : 'Join the talent list'}
        </Cta>
      </div>
    </form>
  );
}
