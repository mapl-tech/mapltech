'use client';

import { useState, type FormEvent } from 'react';
import Cta from './Cta';
import { useUrlParams } from './useUrlState';
import { RECAPTCHA_ENABLED, field, useContactSubmit } from './useContactSubmit';
import type { BoardRole } from './CareersBoard';
import forms from './forms.module.scss';

/**
 * Careers apply form: role (prefilled from ?role=), name, email, LinkedIn or
 * portfolio URL, note. Posts to /api/contact with subject "Application: <role>".
 * No file upload: the API takes JSON only.
 */

export interface CareersApplyProps {
  roles: BoardRole[];
  contactEmail: string;
  roleFieldId?: string;
}

const GENERAL = 'general';

export default function CareersApply({ roles, contactEmail, roleFieldId = 'apply-role' }: CareersApplyProps) {
  const [params] = useUrlParams();
  const { status, error, submit, warmUp } = useContactSubmit();
  const [roleChoice, setRoleChoice] = useState<string | null>(null);
  const [submittedRole, setSubmittedRole] = useState('');

  const fromUrl = params.get('role');
  const selectedSlug = roleChoice ?? (fromUrl && roles.some((role) => role.slug === fromUrl) ? fromUrl : GENERAL);
  const selected = roles.find((role) => role.slug === selectedSlug);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const data = new FormData(event.currentTarget);
    const roleLabel = selected ? `${selected.title} (${selected.country})` : 'General application';
    const link = field(data, 'link');
    const note = field(data, 'note');
    const message = [
      `Role: ${roleLabel}`,
      selected ? `Location: ${selected.location} · ${selected.type}` : null,
      link ? `LinkedIn / portfolio: ${link}` : null,
      '',
      note,
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
      <div className={`${forms.status} ${forms.statusSuccess}`} role="status">
        <strong className={forms.statusTitle}>Application received for {submittedRole}.</strong>
        We read every application and reply by email.
      </div>
    );
  }

  return (
    <form className={forms.form} onSubmit={onSubmit} onFocusCapture={warmUp} aria-label="Application form">
      <div className={forms.field}>
        <label className={forms.label} htmlFor={roleFieldId}>
          Role
        </label>
        <select
          id={roleFieldId}
          name="role"
          className={forms.select}
          value={selectedSlug}
          onChange={(event) => setRoleChoice(event.target.value)}
        >
          {roles.map((role) => (
            <option key={role.slug} value={role.slug}>
              {role.title} — {role.country} ({role.location})
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
          <input id="apply-name" name="name" type="text" autoComplete="name" className={forms.input} placeholder="Your full name" required />
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
            className={forms.input}
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div className={forms.field}>
        <label className={forms.label} htmlFor="apply-link">
          LinkedIn or portfolio URL <span className={forms.optional}>(optional)</span>
        </label>
        <input
          id="apply-link"
          name="link"
          type="url"
          inputMode="url"
          autoComplete="url"
          className={forms.input}
          placeholder="https://linkedin.com/in/you"
        />
      </div>

      <div className={forms.field}>
        <label className={forms.label} htmlFor="apply-note">
          Why you&apos;d be a great fit
        </label>
        <textarea
          id="apply-note"
          name="note"
          className={forms.textarea}
          rows={5}
          placeholder="How you found MAPL TECH, your qualifications and relevant experience, and why you'd be a great fit for the role."
          required
        />
      </div>

      {status === 'error' ? (
        <p className={forms.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={forms.actions}>
        <Cta placement="careers_apply_submit" type="submit" size="medium" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Send Application'}
        </Cta>
        <a className={forms.textButton} href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Application: ${selected ? `${selected.title} (${selected.country})` : 'General'}`)}`}>
          Prefer email? Apply by email
        </a>
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
