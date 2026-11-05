'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { blurErrors, checkForm, summaryWords, typingErrors, type FieldRule } from '@/components/company/formErrors';
import { useAfterPress } from '@/components/company/useAfterPress';
import css from '@/components/company/CareersForm.module.scss';
import { field, useContactSubmit } from './useContactSubmit';
import Recaptcha from './Recaptcha';
import forms from './forms.module.scss';

/**
 * "Don't see your fit?": three fields for people with no listed role yet.
 * Posts to /api/contact as "Talent list". Same error pattern as the apply
 * form: messages under the field, a summary on a failed submit with focus on
 * the first problem (it counts the fields still flagged, announced once per
 * refused send), and the success message takes focus. And the same one-press
 * rule: errors clear while the visitor types, and a blur check waits until
 * the pointer lifts, so the press that leaves the last field sends. With a
 * site key set, the "I'm not a robot" box (dark) sits just before the button.
 */

const RULES: Record<string, FieldRule> = {
  name: { required: 'Enter your name.' },
  email: { required: 'Enter your email address.', email: true },
  about: { required: 'Tell us in a sentence what you do best.' },
};

const ORDER = ['name', 'email', 'about'] as const;

export default function TalentListForm({ contactEmail }: { contactEmail?: string }) {
  const { status, submit, captcha } = useContactSubmit('talent_list');
  const [errors, setErrors] = useState<Record<string, string>>({});
  // The last refused send (as in CareersApply): its number and the errors it found.
  const [refused, setRefused] = useState<{ count: number; errors: Record<string, string> } | null>(null);
  // Once a send has been tried, a field left empty is flagged on blur too.
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const afterPress = useAfterPress();

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    // Sending disabled the button and dropped focus; return it for a retry.
    if (status === 'error') formRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus();
  }, [status]);

  // While typing, errors only ever clear (as in CareersApply).
  const onChange = (event: ChangeEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const rule = RULES[target.name];
    if (!rule) return;
    const { name, value } = target;
    setErrors((prev) => typingErrors(prev, name, value, rule));
  };

  // The field left is checked once the pointer lifts, never mid-press.
  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const rule = RULES[target.name];
    if (!rule) return;
    const { name, value } = target;
    afterPress(() => setErrors((prev) => blurErrors(prev, name, value, rule, attempted)));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const data = new FormData(event.currentTarget);
    const found = checkForm(data, RULES);
    setErrors(found);
    setAttempted(true);
    const problems = ORDER.filter((name) => found[name]);
    if (problems.length) {
      setRefused((prev) => ({ count: (prev?.count ?? 0) + 1, errors: found }));
      formRef.current?.querySelector<HTMLElement>(`[name="${problems[0]}"]`)?.focus();
      return;
    }
    setRefused(null);
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
        <strong className={forms.statusTitle}>You’re on the list.</strong>
        <span>We’ll be in touch when a matching role opens.</span>
      </div>
    );
  }

  const describedBy = (name: string) => (errors[name] ? `talent-${name}-error` : undefined);
  // The alert only while the errors are the refused send's own; then a plain line.
  const flagged = ORDER.filter((name) => errors[name]).length;
  const announce = refused?.errors === errors;

  return (
    <form
      ref={formRef}
      className={`${forms.form} ${css.form}`}
      onSubmit={onSubmit}
      onChange={onChange}
      onBlur={onBlur}
      noValidate
      aria-label="Join the talent list"
      aria-describedby="talent-form-note"
    >
      <p id="talent-form-note" className={css.note}>
        All three fields are required.
      </p>

      {refused && flagged ? (
        <p key={announce ? `refused-${refused.count}` : 'summary'} className={css.summary} role={announce ? 'alert' : undefined}>
          {summaryWords(flagged)}
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
          That didn’t send. Try again
          {contactEmail ? (
            <>
              , or email <a href={`mailto:${contactEmail}?subject=${encodeURIComponent('Talent list')}`}>{contactEmail}</a>
            </>
          ) : null}
          .
        </p>
      ) : null}

      {/* After the last field, before the button. */}
      <Recaptcha
        control={captcha}
        theme="dark"
        renderError={(errorId, message) => (
          <p id={errorId} className={forms.error} role="alert">
            {message}
          </p>
        )}
      />

      <div className={`${forms.actions} ${css.actions}`}>
        <button
          type="submit"
          className={`${css.submit} ${css.submitQuiet}`}
          disabled={status === 'sending'}
          data-cta-placement="careers_talent_submit"
        >
          {status === 'sending' ? 'Sending…' : 'Join the talent list'}
        </button>
      </div>
    </form>
  );
}
