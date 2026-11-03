'use client';

import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { checkField, checkForm, normaliseUrl, type FieldRule } from '@/components/company/formErrors';
import css from '@/components/company/CareersForm.module.scss';
import { useUrlParams } from './useUrlState';
import { field, useContactSubmit } from './useContactSubmit';
import type { BoardRole } from './CareersBoard';
import forms from './forms.module.scss';
import RecaptchaNotice from './RecaptchaNotice';

/**
 * Careers apply form: role (pre-selected from ?role=, which the board's
 * "Apply" links set), name, email, an optional link, a short note. Posts to
 * /api/contact with the subject "Application: <role>"; the API takes JSON, so
 * there is no upload. The button row holds the one action (the page's rail
 * offers email instead); a failed send offers email with the same subject.
 * The URL is the only record of the chosen role: the select writes ?role=
 * too, so a row's "Apply" always wins over an earlier pick.
 *
 * Accessibility: native labels; required fields say so in the label set-up
 * line, optional ones say "(optional)"; errors appear under their field,
 * linked with aria-describedby and aria-invalid; a failed submit announces a
 * summary and moves focus to the first problem; success takes focus.
 */

export interface CareersApplyProps {
  roles: BoardRole[];
  contactEmail: string;
  roleFieldId?: string;
}

const GENERAL = 'general';

const RULES: Record<string, FieldRule> = {
  name: { required: 'Enter your name.' },
  email: { required: 'Enter your email address.', email: true },
  link: { url: true },
  note: { required: 'Tell us in a sentence or two why the role fits you.' },
};

const ORDER = ['name', 'email', 'link', 'note'] as const;

export default function CareersApply({ roles, contactEmail, roleFieldId = 'apply-role' }: CareersApplyProps) {
  const [params, setParams] = useUrlParams();
  const { status, submit, warmUp } = useContactSubmit();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState('');
  const [submittedRole, setSubmittedRole] = useState('');
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const fromUrl = params.get('role');
  const selectedSlug = fromUrl && roles.some((role) => role.slug === fromUrl) ? fromUrl : GENERAL;
  const selected = roles.find((role) => role.slug === selectedSlug);
  const roleLabel = selected ? `${selected.title}, ${selected.country}` : 'General application';

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    // The submit button was disabled while sending, which drops focus to the
    // page; put it back on the button so a retry is one key away (the alert
    // below announces what happened).
    if (status === 'error') formRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus();
  }, [status]);

  // Format problems are flagged when the field is left; a missing required
  // value only once the field has already been flagged (or on submit).
  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const rule = RULES[target.name];
    if (!rule) return;
    const message = checkField(target.value, rule);
    setErrors((prev) => {
      const flagged = Boolean(prev[target.name]);
      const next = { ...prev };
      if (message && (target.value.trim() || flagged)) next[target.name] = message;
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

    const link = normaliseUrl(field(data, 'link'));
    const message = [
      `Role: ${roleLabel}`,
      selected ? `Location: ${selected.location} · ${selected.type}` : null,
      link ? `LinkedIn / portfolio: ${link}` : null,
      '',
      field(data, 'note'),
    ]
      .filter((line): line is string => line !== null)
      .join('\n');

    const ok = await submit({
      name: field(data, 'name'),
      email: field(data, 'email'),
      subject: `Application: ${roleLabel}`,
      message,
    });
    if (ok) setSubmittedRole(roleLabel);
  };

  if (status === 'success') {
    return (
      <div ref={successRef} className={`${forms.status} ${forms.statusSuccess} ${css.done}`} role="status" tabIndex={-1}>
        <strong className={forms.statusTitle}>Application received.</strong>
        <span>
          Thanks for applying for {submittedRole}. We read every application and reply by email.
        </span>
      </div>
    );
  }

  const describedBy = (name: string, hint?: string) =>
    [hint, errors[name] ? `apply-${name}-error` : null].filter(Boolean).join(' ') || undefined;

  return (
    <form
      ref={formRef}
      className={`${forms.form} ${css.form}`}
      onSubmit={onSubmit}
      onBlur={onBlur}
      onFocusCapture={warmUp}
      noValidate
      aria-labelledby="apply-form-title"
      aria-describedby="apply-form-note"
    >
      <div className={css.head}>
        <p id="apply-form-title" className={css.applying}>
          <span className={css.applyingLabel}>Applying for</span>{' '}
          <span className={css.applyingRole}>{roleLabel}</span>
        </p>
        <p id="apply-form-note" className={css.note}>
          Every field is required unless it says optional.
        </p>
      </div>

      {summary ? (
        <p className={css.summary} role="alert">
          {summary}
        </p>
      ) : null}

      <div className={forms.field}>
        <label className={forms.label} htmlFor={roleFieldId}>
          Role
        </label>
        <select
          id={roleFieldId}
          name="role"
          className={forms.select}
          value={selectedSlug}
          onChange={(event) => {
            const value = event.target.value;
            setParams((next) => (value === GENERAL ? next.delete('role') : next.set('role', value)));
          }}
        >
          {roles.map((role) => (
            <option key={role.slug} value={role.slug}>
              {role.title}, {role.country}
            </option>
          ))}
          <option value={GENERAL}>General application</option>
        </select>
      </div>

      <div className={forms.row}>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="apply-name">
            Name
          </label>
          <input
            id="apply-name"
            name="name"
            type="text"
            autoComplete="name"
            className={forms.input}
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy('name')}
          />
          {errors.name ? (
            <p id="apply-name-error" className={forms.error}>
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className={forms.field}>
          <label className={forms.label} htmlFor="apply-email">
            Email
          </label>
          <input
            id="apply-email"
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
            <p id="apply-email-error" className={forms.error}>
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className={forms.field}>
        <label className={forms.label} htmlFor="apply-link">
          Link to your work <span className={forms.optional}>(optional)</span>
        </label>
        <input
          id="apply-link"
          name="link"
          type="url"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          className={forms.input}
          aria-invalid={errors.link ? true : undefined}
          aria-describedby={describedBy('link', 'apply-link-hint')}
        />
        <p id="apply-link-hint" className={`${forms.hint} ${css.hint}`}>
          LinkedIn, GitHub or a portfolio.
        </p>
        {errors.link ? (
          <p id="apply-link-error" className={forms.error}>
            {errors.link}
          </p>
        ) : null}
      </div>

      <div className={forms.field}>
        <label className={forms.label} htmlFor="apply-note">
          Why this role fits you
        </label>
        <textarea
          id="apply-note"
          name="note"
          className={forms.textarea}
          rows={5}
          required
          aria-invalid={errors.note ? true : undefined}
          aria-describedby={describedBy('note', 'apply-note-hint')}
        />
        <p id="apply-note-hint" className={`${forms.hint} ${css.hint}`}>
          A few sentences on your experience and how you found us is plenty.
        </p>
        {errors.note ? (
          <p id="apply-note-error" className={forms.error}>
            {errors.note}
          </p>
        ) : null}
      </div>

      {status === 'error' ? (
        <p className={css.failed} role="alert">
          That didn&apos;t send. Try again, or email{' '}
          <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Application: ${roleLabel}`)}`}>{contactEmail}</a> with the
          same details.
        </p>
      ) : null}

      <div className={`${forms.actions} ${css.actions}`}>
        <button type="submit" className={css.submit} disabled={status === 'sending'} data-cta-placement="careers_apply_submit">
          {status === 'sending' ? 'Sending…' : 'Send application'}
          <span aria-hidden="true" className={css.submitArrow}>
            →
          </span>
        </button>
      </div>

      <RecaptchaNotice className={forms.recaptcha} />
    </form>
  );
}
