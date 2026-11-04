'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { blurErrors, checkForm, normaliseUrl, summaryWords, typingErrors, type FieldRule } from '@/components/company/formErrors';
import { useAfterPress } from '@/components/company/useAfterPress';
import css from '@/components/company/CareersForm.module.scss';
import { useUrlParams } from './useUrlState';
import { field, useContactSubmit } from './useContactSubmit';
import type { BoardRole } from './CareersBoard';
import forms from './forms.module.scss';
import RecaptchaNotice from './RecaptchaNotice';
import Arrow from '@/components/ui/Arrow';

/**
 * Careers apply form: role (pre-selected from ?role=, which the board's
 * "Apply" links set), name, email, an optional link, a short note. With no
 * role chosen (a general application) the head, the form's name and the
 * note's label, hint and error speak to that case; the note is still sent
 * as `note`. Posts to
 * /api/contact with the subject "Application: <role>"; the API takes JSON, so
 * there is no upload. The button row holds the one action (the page's rail
 * offers email instead); a failed send offers email with the same subject.
 * The URL is the only record of the chosen role: the select writes ?role=
 * too, so a row's "Apply" always wins over an earlier pick.
 *
 * Accessibility: native labels; required fields say so in the label set-up
 * line, optional ones say "(optional)"; errors appear under their field,
 * linked with aria-describedby and aria-invalid; a failed submit announces a
 * summary and moves focus to the first problem; success takes focus. The
 * summary counts the fields still flagged, so it stays right as they are
 * fixed: it is announced once per refused send (role="alert"), then changes
 * quietly, because each field says for itself when it is fixed.
 *
 * One press sends after a refused send (the referral form's rule): each error
 * clears while the visitor types, as soon as its value is fixed, and the blur
 * check of the field left waits until the pointer lifts (useAfterPress). The
 * press that leaves the last field is the one that sends; an error line or
 * the summary removed mid-press would move "Send application" out from under
 * the pointer or finger and swallow it.
 */

export interface CareersApplyProps {
  roles: BoardRole[];
  contactEmail: string;
  roleFieldId?: string;
}

const GENERAL = 'general';

/** The note's words: for a listed role, and for a general application (no role chosen). */
const NOTE = {
  role: {
    label: 'Why this role fits you',
    hint: 'A few sentences on your experience and how you found us is plenty.',
    required: 'Tell us in a sentence or two why the role fits you.',
  },
  general: {
    label: 'About you and the role you want',
    hint: 'A few sentences on your experience, the role you want and how you found us is plenty.',
    required: 'Tell us in a sentence or two about you and the role you want.',
  },
} as const;

const BASE_RULES: Record<string, FieldRule> = {
  name: { required: 'Enter your name.' },
  email: { required: 'Enter your email address.', email: true },
  link: { url: true },
};

const RULES: Record<keyof typeof NOTE, Record<string, FieldRule>> = {
  role: { ...BASE_RULES, note: { required: NOTE.role.required } },
  general: { ...BASE_RULES, note: { required: NOTE.general.required } },
};

const ORDER = ['name', 'email', 'link', 'note'] as const;

export default function CareersApply({ roles, contactEmail, roleFieldId = 'apply-role' }: CareersApplyProps) {
  const [params, setParams] = useUrlParams();
  const { status, submit, warmUp } = useContactSubmit();
  const [errors, setErrors] = useState<Record<string, string>>({});
  // The last refused send: how many so far, and the errors it found (the
  // same object until a field changes, so the summary knows when to go quiet).
  const [refused, setRefused] = useState<{ count: number; errors: Record<string, string> } | null>(null);
  // Once a send has been tried, a field left empty is flagged on blur too.
  const [attempted, setAttempted] = useState(false);
  // The role the sent application was for (null: a general application).
  const [submittedRole, setSubmittedRole] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const afterPress = useAfterPress();

  const fromUrl = params.get('role');
  const selectedSlug = fromUrl && roles.some((role) => role.slug === fromUrl) ? fromUrl : GENERAL;
  const selected = roles.find((role) => role.slug === selectedSlug);
  const roleLabel = selected ? `${selected.title}, ${selected.country}` : 'General application';
  const kind = selected ? 'role' : 'general';
  const note = NOTE[kind];
  const rules = RULES[kind];

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
    // The submit button was disabled while sending, which drops focus to the
    // page; put it back on the button so a retry is one key away (the alert
    // below announces what happened).
    if (status === 'error') formRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus();
  }, [status]);

  // While typing, errors only ever clear: each one as soon as its value is
  // fixed. New ones wait for the blur or the next send.
  const onChange = (event: ChangeEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const rule = rules[target.name];
    if (!rule) return;
    const { name, value } = target;
    setErrors((prev) => typingErrors(prev, name, value, rule));
  };

  // Format problems are flagged when the field is left; a missing required
  // value once the field has been flagged or a send tried (or on submit).
  // Never mid-press: the check waits until the pointer lifts.
  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const rule = rules[target.name];
    if (!rule) return;
    const { name, value } = target;
    afterPress(() => setErrors((prev) => blurErrors(prev, name, value, rule, attempted)));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const data = new FormData(event.currentTarget);
    const found = checkForm(data, rules);
    setErrors(found);
    setAttempted(true);
    const problems = ORDER.filter((name) => found[name]);
    if (problems.length) {
      setRefused((prev) => ({ count: (prev?.count ?? 0) + 1, errors: found }));
      formRef.current?.querySelector<HTMLElement>(`[name="${problems[0]}"]`)?.focus();
      return;
    }
    setRefused(null);

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
    if (ok) setSubmittedRole(selected ? roleLabel : null);
  };

  if (status === 'success') {
    return (
      <div ref={successRef} className={`${forms.status} ${forms.statusSuccess} ${css.done}`} role="status" tabIndex={-1}>
        <strong className={forms.statusTitle}>Application received.</strong>
        <span>
          {submittedRole ? `Thanks for applying for ${submittedRole}.` : 'Thanks for applying to MAPL\u00a0TECH.'} We read every
          application and reply by email.
        </span>
      </div>
    );
  }

  // Shown after a refused send while any field is still flagged. It is the
  // alert only while the errors are the ones that send found (a new node per
  // refusal, so each is announced); once a field changes it is a plain line.
  const flagged = ORDER.filter((name) => errors[name]).length;
  const announce = refused?.errors === errors;

  const describedBy = (name: string, hint?: string) =>
    [hint, errors[name] ? `apply-${name}-error` : null].filter(Boolean).join(' ') || undefined;

  return (
    <form
      ref={formRef}
      className={`${forms.form} ${css.form}`}
      onSubmit={onSubmit}
      onChange={onChange}
      onBlur={onBlur}
      onFocusCapture={warmUp}
      noValidate
      // "Applying for Cloud / DevOps Engineer, Canada"; with no role chosen, just "General application".
      aria-labelledby={selected ? 'apply-form-label apply-form-role' : 'apply-form-role'}
      aria-describedby="apply-form-note"
    >
      <div className={css.head}>
        <p className={css.applying}>
          <span id="apply-form-label" className={css.applyingLabel}>
            {selected ? 'Applying for' : 'No listed role'}
          </span>{' '}
          <span id="apply-form-role" className={css.applyingRole}>
            {roleLabel}
          </span>
        </p>
        <p id="apply-form-note" className={css.note}>
          Every field is required unless it says optional.
        </p>
      </div>

      {refused && flagged ? (
        <p key={announce ? `refused-${refused.count}` : 'summary'} className={css.summary} role={announce ? 'alert' : undefined}>
          {summaryWords(flagged)}
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
          {note.label}
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
          {note.hint}
        </p>
        {/* The note's only check is that it is filled in, so its error follows the case even after the role changes. */}
        {errors.note ? (
          <p id="apply-note-error" className={forms.error}>
            {note.required}
          </p>
        ) : null}
      </div>

      {status === 'error' ? (
        <p className={css.failed} role="alert">
          That didn’t send. Try again, or email{' '}
          <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Application: ${roleLabel}`)}`}>{contactEmail}</a> with the
          same details.
        </p>
      ) : null}

      <div className={`${forms.actions} ${css.actions}`}>
        <button type="submit" className={css.submit} disabled={status === 'sending'} data-cta-placement="careers_apply_submit">
          {status === 'sending' ? 'Sending…' : 'Send application'}
          <span aria-hidden="true" className={css.submitArrow}>
            <Arrow />
          </span>
        </button>
      </div>

      <RecaptchaNotice className={forms.recaptcha} />
    </form>
  );
}
