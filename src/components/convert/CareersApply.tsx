'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { blurErrors, checkForm, normaliseUrl, summaryWords, typingErrors, type FieldRule } from '@/components/company/formErrors';
import { useAfterPress } from '@/components/company/useAfterPress';
import css from '@/components/company/CareersForm.module.scss';
import { useUrlParams } from './useUrlState';
import { GENERIC_ERROR, field, useContactSubmit } from './useContactSubmit';
import type { BoardRole } from './CareersBoard';
import FieldError from './FieldError';
import FileField from './FileField';
import { RESUME_MESSAGES } from './resume';
import forms from './forms.module.scss';
import Recaptcha from './Recaptcha';
import Arrow from '@/components/ui/Arrow';

/**
 * Careers apply form: role (pre-selected from ?role=, which the board's
 * "Apply" links set), name, email, the resume (required), an optional link,
 * a short note. With no role chosen (a general application) the head, the
 * form's name and the note's label, hint and error speak to that case.
 * Posts multipart to /api/apply (useContactSubmit's `submitForm`) so the
 * resume goes with it, as an attachment on the email; the server checks the
 * file by its bytes before anything is sent. A failed send offers email with
 * the same subject. The URL is the only record of the chosen role: the
 * select writes ?role= too, so a row's "Apply" always wins over an earlier
 * pick.
 *
 * The resume is required here: an application is a request to be considered
 * for a role, and the resume is what that is judged on (the note says why
 * this role; the resume says what you have done). The talent list keeps it
 * optional.
 *
 * Accessibility: visible labels; required fields say so in the set-up line,
 * optional ones say "(optional)"; errors appear under their field with the
 * "!" disc (FieldError), linked with aria-describedby and aria-invalid; a
 * refused send announces a summary and moves focus to the first problem; a
 * refusal from the server that names a field (a resume it would not take)
 * goes under that field the same way; success takes focus. The summary
 * counts the fields still flagged, so it stays right as they are fixed. The
 * button stays focusable while sending (aria-disabled), so focus never drops.
 *
 * One press sends after a refused send (the referral form's rule): each error
 * clears while the visitor types, as soon as its value is fixed, and the blur
 * check of the field left waits until the pointer lifts (useAfterPress).
 *
 * Bots that fill the hidden "website" field get the same confirmation and
 * nothing is sent (the server checks it too). With a site key set, the "I'm
 * not a robot" box sits just before "Send application".
 */

export interface CareersApplyProps {
  roles: BoardRole[];
  contactEmail: string;
  roleFieldId?: string;
}

const GENERAL = 'general';
const RESUME_ID = 'apply-resume';

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

const ORDER = ['name', 'email', 'resume', 'link', 'note'] as const;
type FieldKey = (typeof ORDER)[number];
const isFieldKey = (name: string | undefined): name is FieldKey => (ORDER as readonly string[]).includes(name ?? '');

/** Where focus goes for a field's error. */
const fieldId = (name: FieldKey) => (name === 'resume' ? RESUME_ID : `apply-${name}`);

export default function CareersApply({ roles, contactEmail, roleFieldId = 'apply-role' }: CareersApplyProps) {
  const [params, setParams] = useUrlParams();
  const { status, error: sendError, errorField, submitForm, captcha } = useContactSubmit('careers_application');
  const [errors, setErrors] = useState<Record<string, string>>({});
  // The last refused send: how many so far, and the errors it found (the
  // same object until a field changes, so the summary knows when to go quiet).
  const [refused, setRefused] = useState<{ count: number; errors: Record<string, string> } | null>(null);
  // Once a send has been tried, a field left empty is flagged on blur too.
  const [attempted, setAttempted] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  // What the confirmation reads back: the role (null: a general application) and the file.
  const [sent, setSent] = useState<{ role: string | null; file: string } | null>(null);
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
  const done = Boolean(sent) && (status === 'success' || status === 'idle');

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

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

  const chooseResume = (file: File | null) => {
    setResume(file);
    // A chosen file fixes the field; removing it flags it again only once a send was tried.
    setErrors((prev) => {
      const next = { ...prev };
      delete next.resume;
      return file || !attempted ? next : { ...next, resume: RESUME_MESSAGES.required };
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const data = new FormData(event.currentTarget);
    const found = checkForm(data, rules);
    if (!resume) found.resume = RESUME_MESSAGES.required;
    setErrors(found);
    setAttempted(true);
    const problems = ORDER.filter((name) => found[name]);
    if (problems.length) {
      setRefused((prev) => ({ count: (prev?.count ?? 0) + 1, errors: found }));
      document.getElementById(fieldId(problems[0]))?.focus();
      return;
    }
    setRefused(null);

    // Honeypot: bots get the same confirmation and nothing is sent.
    if (field(data, 'website')) {
      setSent({ role: selected ? roleLabel : null, file: resume?.name ?? '' });
      return;
    }

    const body = new FormData();
    body.set('form', 'application');
    body.set('role', roleLabel);
    if (selected) body.set('location', `${selected.location} · ${selected.type}`);
    body.set('name', field(data, 'name'));
    body.set('email', field(data, 'email'));
    body.set('link', normaliseUrl(field(data, 'link')));
    body.set('note', field(data, 'note'));
    if (resume) body.set('resume', resume, resume.name);

    const ok = await submitForm(body);
    if (ok) setSent({ role: selected ? roleLabel : null, file: resume?.name ?? '' });
  };

  // A refusal the server tied to a field: its words go under that field, and focus goes to it.
  useEffect(() => {
    if (status !== 'error' || !isFieldKey(errorField)) return;
    const frame = requestAnimationFrame(() => {
      setErrors((prev) => ({ ...prev, [errorField]: sendError }));
      document.getElementById(fieldId(errorField))?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [status, errorField, sendError]);

  if (done && sent) {
    return (
      <div ref={successRef} className={`${forms.status} ${forms.statusSuccess} ${css.done}`} role="status" tabIndex={-1}>
        <strong className={forms.statusTitle}>Application received.</strong>
        <span>
          {sent.role ? `Thanks for applying for ${sent.role}.` : 'Thanks for applying to MAPL TECH.'}
          {sent.file ? ` Your resume, ${sent.file}, came with it.` : ''} We read every application and reply by email.
        </span>
      </div>
    );
  }

  // Shown after a refused send while any field is still flagged. It is the
  // alert only while the errors are the ones that send found (a new node per
  // refusal, so each is announced); once a field changes it is a plain line.
  const flagged = ORDER.filter((name) => errors[name]).length;
  const announce = refused?.errors === errors;
  const failed = status === 'error' && !isFieldKey(errorField);

  const describedBy = (name: string, hint?: string) =>
    [hint, errors[name] ? `apply-${name}-error` : null].filter(Boolean).join(' ') || undefined;

  return (
    <form
      ref={formRef}
      className={`${forms.form} ${css.form}`}
      onSubmit={onSubmit}
      onChange={onChange}
      onBlur={onBlur}
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
          {errors.name ? <FieldError id="apply-name-error">{errors.name}</FieldError> : null}
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
            autoCapitalize="off"
            spellCheck={false}
            className={forms.input}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('email')}
          />
          {errors.email ? <FieldError id="apply-email-error">{errors.email}</FieldError> : null}
        </div>
      </div>

      <FileField id={RESUME_ID} label="Resume" required file={resume} onChange={chooseResume} error={errors.resume} />

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
          autoCapitalize="off"
          spellCheck={false}
          className={forms.input}
          aria-invalid={errors.link ? true : undefined}
          aria-describedby={describedBy('link', 'apply-link-hint')}
        />
        <p id="apply-link-hint" className={`${forms.hint} ${css.hint}`}>
          LinkedIn, GitHub or a portfolio.
        </p>
        {errors.link ? <FieldError id="apply-link-error">{errors.link}</FieldError> : null}
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
        {errors.note ? <FieldError id="apply-note-error">{note.required}</FieldError> : null}
      </div>

      <div className={forms.honeypot} aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {failed ? (
        <p className={css.failed} role="alert">
          That didn’t send. {sendError && sendError !== GENERIC_ERROR ? `${sendError} ` : ''}Try again, or email{' '}
          <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Job application: ${roleLabel}`)}`}>{contactEmail}</a> with the
          same details and your resume attached.
        </p>
      ) : null}

      {/* After the last field, before the button. */}
      <Recaptcha
        control={captcha}
        theme="dark"
        renderError={(errorId, message) => (
          <FieldError id={errorId} alert>
            {message}
          </FieldError>
        )}
      />

      <div className={`${forms.actions} ${css.actions}`}>
        {/* aria-disabled while sending, as on the brief: a disabled button would drop keyboard focus. */}
        <button
          type="submit"
          className={css.submit}
          aria-disabled={status === 'sending' ? true : undefined}
          data-cta-placement="careers_apply_submit"
        >
          {status === 'sending' ? 'Sending…' : 'Send application'}
          <span aria-hidden="true" className={css.submitArrow}>
            <Arrow />
          </span>
        </button>
      </div>
    </form>
  );
}
