'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent } from 'react';
import { blurErrors, checkForm, summaryWords, typingErrors, type FieldRule } from '@/components/company/formErrors';
import { useAfterPress } from '@/components/company/useAfterPress';
import css from '@/components/company/CareersForm.module.scss';
import { ESTIMATE_SERVICES, SERVICE_META } from '@/lib/estimate';
import Arrow from '@/components/ui/Arrow';
import FieldError from './FieldError';
import Recaptcha from './Recaptcha';
import { GENERIC_ERROR, field, useContactSubmit } from './useContactSubmit';
import forms from './forms.module.scss';

/**
 * The inquiry form at the end of /nigeria and /jamaica: the page's last ask,
 * answered on the page instead of sending the reader to another one. Five
 * fields in the order they are cheapest to give: name, email, the company
 * (optional), what they need (a choice, "Not sure yet" chosen), then the
 * message. Posts JSON to /api/contact like the brief, with `source` set to
 * the page ("/nigeria"), so the email's subject reads "Inquiry from
 * /nigeria: <name>" and the owner can tell where it came from. A send the
 * server accepts fires `lead` as regional_inquiry_<region>.
 *
 * The careers forms' pattern throughout: visible labels, errors under their
 * field with the "!" disc (on blur, cleared as soon as fixed, never
 * mid-press), a summary and focus on the first problem after a refused send,
 * a honeypot, the "I'm not a robot" box before the button when a key is set,
 * a button that stays focusable while sending, and a confirmation that takes
 * focus and says what happens next with published facts only: a reply within
 * 24 hours, a 20-minute call, a fixed quote.
 */

export type InquiryRegion = 'nigeria' | 'jamaica';

const RULES: Record<string, FieldRule> = {
  name: { required: 'Enter your name so we know who to reply to.' },
  email: { required: 'Enter your email address so we can reply.', email: true },
  message: { required: 'Tell us in a line or two what you need.' },
};

const ORDER = ['name', 'email', 'message'] as const;
const UNSURE = 'Not sure yet';

export default function RegionalInquiry({
  region,
  country,
  contactEmail,
}: {
  region: InquiryRegion;
  /** "Nigeria": in the email, and in the mail-app fallback's subject. */
  country: string;
  contactEmail: string;
}) {
  const id = (name: string) => `${region}-inquiry-${name}`;
  const source = `/${region}`;
  const { status, error: sendError, submit, captcha } = useContactSubmit(`regional_inquiry_${region}`);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refused, setRefused] = useState<{ count: number; errors: Record<string, string> } | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [sent, setSent] = useState<{ email: string; need: string } | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const afterPress = useAfterPress();
  const done = Boolean(sent) && (status === 'success' || status === 'idle');

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  const onChange = (event: ChangeEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const rule = RULES[target.name];
    if (!rule) return;
    const { name, value } = target;
    setErrors((prev) => typingErrors(prev, name, value, rule));
  };

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
      document.getElementById(id(problems[0]))?.focus();
      return;
    }
    setRefused(null);

    const email = field(data, 'email');
    const service = ESTIMATE_SERVICES.find((key) => key === field(data, 'need'));
    const need = service ? SERVICE_META[service].label : UNSURE;
    if (field(data, 'website')) {
      setSent({ email, need });
      return;
    }
    const company = field(data, 'company');
    const ok = await submit({
      name: field(data, 'name'),
      email,
      subject: need,
      source,
      message: [`What they need: ${need}`, company ? `Company: ${company}` : null, `Country: ${country}`, '', field(data, 'message')]
        .filter((line): line is string => line !== null)
        .join('\n'),
    });
    if (ok) setSent({ email, need });
  };

  if (done && sent) {
    return (
      <div ref={successRef} className={`${forms.status} ${forms.statusSuccess} ${css.done}`} role="status" tabIndex={-1}>
        <strong className={forms.statusTitle}>Inquiry sent.</strong>
        <span>
          We reply within 24 hours, to <strong>{sent.email}</strong>. Then we talk for 20&nbsp;minutes, agree the scope with you,
          and send a fixed quote{sent.need === UNSURE ? '' : ` for ${sent.need}`}.
        </span>
      </div>
    );
  }

  const describedBy = (name: string, hint?: string) => [hint, errors[name] ? `${id(name)}-error` : null].filter(Boolean).join(' ') || undefined;
  const flagged = ORDER.filter((name) => errors[name]).length;
  const announce = refused?.errors === errors;

  return (
    <form
      className={`${forms.form} ${css.form}`}
      onSubmit={onSubmit}
      onChange={onChange}
      onBlur={onBlur}
      noValidate
      aria-labelledby={id('title')}
      aria-describedby={id('note')}
    >
      <div className={css.head}>
        <h3 id={id('title')} className={`${css.applyingRole} ${forms.formTitle}`}>
          Send an inquiry
        </h3>
        <p id={id('note')} className={css.note}>
          Every field is required unless it says optional.
        </p>
      </div>

      {refused && flagged ? (
        <p key={announce ? `refused-${refused.count}` : 'summary'} className={css.summary} role={announce ? 'alert' : undefined}>
          {summaryWords(flagged)}
        </p>
      ) : null}

      <div className={forms.row}>
        <div className={forms.field}>
          <label className={forms.label} htmlFor={id('name')}>
            Your name
          </label>
          <input
            id={id('name')}
            name="name"
            type="text"
            autoComplete="name"
            className={forms.input}
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy('name')}
          />
          {errors.name ? <FieldError id={`${id('name')}-error`}>{errors.name}</FieldError> : null}
        </div>
        <div className={forms.field}>
          <label className={forms.label} htmlFor={id('email')}>
            Email
          </label>
          <input
            id={id('email')}
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
          {errors.email ? <FieldError id={`${id('email')}-error`}>{errors.email}</FieldError> : null}
        </div>
      </div>

      <div className={forms.row}>
        <div className={forms.field}>
          <label className={forms.label} htmlFor={id('company')}>
            Company <span className={forms.optional}>(optional)</span>
          </label>
          <input id={id('company')} name="company" type="text" autoComplete="organization" className={forms.input} />
        </div>
        <div className={forms.field}>
          <label className={forms.label} htmlFor={id('need')}>
            What do you need?
          </label>
          <select id={id('need')} name="need" className={forms.select} defaultValue="">
            <option value="">{UNSURE}</option>
            {ESTIMATE_SERVICES.map((service) => (
              <option key={service} value={service}>
                {SERVICE_META[service].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={forms.field}>
        <label className={forms.label} htmlFor={id('message')}>
          Your message
        </label>
        <textarea
          id={id('message')}
          name="message"
          rows={5}
          className={forms.textarea}
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy('message', id('message-hint'))}
        />
        <p id={id('message-hint')} className={`${forms.hint} ${css.hint}`}>
          The goal, what exists today and any deadline. A few lines is enough.
        </p>
        {errors.message ? <FieldError id={`${id('message')}-error`}>{errors.message}</FieldError> : null}
      </div>

      <div className={forms.honeypot} aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === 'error' ? (
        <p className={css.failed} role="alert">
          That didn’t send. {sendError && sendError !== GENERIC_ERROR ? `${sendError} ` : ''}Your answers are still here, so you can try
          again, or email{' '}
          <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Inquiry from ${source}`)}`}>{contactEmail}</a>.
        </p>
      ) : null}

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
          className={css.submit}
          aria-disabled={status === 'sending' ? true : undefined}
          data-cta-placement={`${region}_inquiry_submit`}
        >
          {status === 'sending' ? 'Sending…' : 'Send inquiry'}
          <span aria-hidden="true" className={css.submitArrow}>
            <Arrow />
          </span>
        </button>
      </div>
    </form>
  );
}
