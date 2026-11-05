'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { blurErrors, checkForm, summaryWords, typingErrors, type FieldRule } from '@/components/company/formErrors';
import { useAfterPress } from '@/components/company/useAfterPress';
import css from '@/components/company/CareersForm.module.scss';
import { GENERIC_ERROR, field, useContactSubmit } from './useContactSubmit';
import FieldError from './FieldError';
import FileField from './FileField';
import Recaptcha from './Recaptcha';
import forms from './forms.module.scss';

/**
 * "Don't see your fit?": three fields for people with no listed role yet,
 * and a resume if they have one to hand. Posts multipart to /api/apply as
 * the talent list. Same error pattern as the apply form: messages under the
 * field with the "!" disc, a summary on a refused send with focus on the
 * first problem (it counts the fields still flagged, announced once per
 * refused send), a refusal the server ties to a field goes under it, and
 * the success message takes focus. And the same one-press rule: errors clear
 * while the visitor types, and a blur check waits until the pointer lifts.
 *
 * The resume is optional here: the list is a low-effort way to be kept in
 * mind before a matching role exists. Asking for a file would turn people
 * away at that step; offering the slot lets those who have one share it, so
 * there is something to match against when a role opens.
 *
 * Bots that fill the hidden "website" field get the same confirmation and
 * nothing is sent. With a site key set, the "I'm not a robot" box sits just
 * before the button.
 */

const RULES: Record<string, FieldRule> = {
  name: { required: 'Enter your name.' },
  email: { required: 'Enter your email address.', email: true },
  about: { required: 'Tell us in a sentence what you do best.' },
};

const ORDER = ['name', 'email', 'about', 'resume'] as const;
type FieldKey = (typeof ORDER)[number];
const isFieldKey = (name: string | undefined): name is FieldKey => (ORDER as readonly string[]).includes(name ?? '');
const RESUME_ID = 'talent-resume';
const fieldId = (name: FieldKey) => (name === 'resume' ? RESUME_ID : `talent-${name}`);

export default function TalentListForm({ contactEmail }: { contactEmail?: string }) {
  const { status, error: sendError, errorField, submitForm, captcha } = useContactSubmit('talent_list');
  const [errors, setErrors] = useState<Record<string, string>>({});
  // The last refused send (as in CareersApply): its number and the errors it found.
  const [refused, setRefused] = useState<{ count: number; errors: Record<string, string> } | null>(null);
  // Once a send has been tried, a field left empty is flagged on blur too.
  const [attempted, setAttempted] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [sent, setSent] = useState<{ file: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const afterPress = useAfterPress();
  const done = Boolean(sent) && (status === 'success' || status === 'idle');

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  // A refusal the server tied to a field: its words go under that field, and focus goes to it.
  useEffect(() => {
    if (status !== 'error' || !isFieldKey(errorField)) return;
    const frame = requestAnimationFrame(() => {
      setErrors((prev) => ({ ...prev, [errorField]: sendError }));
      document.getElementById(fieldId(errorField))?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [status, errorField, sendError]);

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

  const chooseResume = (file: File | null) => {
    setResume(file);
    setErrors((prev) => {
      if (!prev.resume) return prev;
      const next = { ...prev };
      delete next.resume;
      return next;
    });
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
      document.getElementById(fieldId(problems[0]))?.focus();
      return;
    }
    setRefused(null);

    // Honeypot: bots get the same confirmation and nothing is sent.
    if (field(data, 'website')) {
      setSent({ file: resume?.name ?? '' });
      return;
    }

    const body = new FormData();
    body.set('form', 'talent');
    body.set('name', field(data, 'name'));
    body.set('email', field(data, 'email'));
    body.set('about', field(data, 'about'));
    if (resume) body.set('resume', resume, resume.name);
    if (await submitForm(body)) setSent({ file: resume?.name ?? '' });
  };

  if (done && sent) {
    return (
      <div ref={successRef} className={`${forms.status} ${forms.statusSuccess} ${css.done}`} role="status" tabIndex={-1}>
        <strong className={forms.statusTitle}>You’re on the list.</strong>
        <span>
          We’ll be in touch when a matching role opens{sent.file ? `, with your resume, ${sent.file}, to hand` : ''}.
        </span>
      </div>
    );
  }

  const describedBy = (name: string) => (errors[name] ? `talent-${name}-error` : undefined);
  // The alert only while the errors are the refused send's own; then a plain line.
  const flagged = ORDER.filter((name) => errors[name]).length;
  const announce = refused?.errors === errors;
  const failed = status === 'error' && !isFieldKey(errorField);

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
        Every field is required unless it says optional.
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
          {errors.name ? <FieldError id="talent-name-error">{errors.name}</FieldError> : null}
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
            autoCapitalize="off"
            spellCheck={false}
            className={forms.input}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('email')}
          />
          {errors.email ? <FieldError id="talent-email-error">{errors.email}</FieldError> : null}
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
        {errors.about ? <FieldError id="talent-about-error">{errors.about}</FieldError> : null}
      </div>

      <FileField id={RESUME_ID} label="Resume" file={resume} onChange={chooseResume} error={errors.resume} />

      <div className={forms.honeypot} aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {failed ? (
        <p className={css.failed} role="alert">
          That didn’t send. {sendError && sendError !== GENERIC_ERROR ? `${sendError} ` : ''}Try again
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
          <FieldError id={errorId} alert>
            {message}
          </FieldError>
        )}
      />

      <div className={`${forms.actions} ${css.actions}`}>
        <button
          type="submit"
          className={`${css.submit} ${css.submitQuiet}`}
          aria-disabled={status === 'sending' ? true : undefined}
          data-cta-placement="careers_talent_submit"
        >
          {status === 'sending' ? 'Sending…' : 'Join the talent list'}
        </button>
      </div>
    </form>
  );
}
