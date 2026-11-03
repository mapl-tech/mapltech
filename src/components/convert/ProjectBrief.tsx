'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { useSearchString } from './useUrlState';
import { GENERIC_ERROR, isEmail, useContactSubmit } from './useContactSubmit';
import {
  KIND_OPTIONS,
  briefLines,
  composeBrief,
  estimateLinkFor,
  isBriefKind,
  kindLabel,
  readPrefill,
  sizeOptions,
  sizeQuestion,
  type BriefAnswers,
  type BriefKind,
  type BriefLine,
  type ChoiceOption,
  type ReplyMethod,
} from './brief';
import styles from './ProjectBrief.module.scss';
import RecaptchaNotice from './RecaptchaNotice';
import Arrow from '@/components/ui/Arrow';

/**
 * The contact brief: one question at a time, in one form. Since the Nov 2026
 * award pass it is set in ink on the paper sheet of /contact-us: a quiet step
 * count over a progress track with one part per question, the open question
 * in display type (the loudest thing in the form), answers as 60px+ rows, and
 * a drawn tick on "Brief sent.".
 *
 * 1 What are we building? (each answer shows its public floor price)
 * 2 How big is it? (sizes with the tier and price they map to; skipped for
 *   "Not sure yet", whose path then counts and draws three steps, not four)
 * 3 What should we know? (optional free text)
 * 4 Where should we reply? (name, email, optional company, email or a call)
 *
 * - Answered questions fold into rows you can reopen ("Change"), so nothing
 *   has to be remembered between steps; the segmented progress bar starts on
 *   step one, partly filled, and fills further once the step is answered.
 * - A pointer pick advances by itself after a short beat, long enough to see
 *   the answer take (the hint under the first question says so, WCAG 3.2.2);
 *   keyboard users choose with the arrow keys and continue with Enter or the
 *   button, so arrowing never jumps away. Each new step moves focus to its
 *   question, which announces it. The choices of steps 1 and 2 are marked
 *   required for assistive tech (the form validates itself: noValidate).
 * - Links from the estimator (?svc=&size.<svc>=...), the pricing bundles
 *   (?bundle=) and the service and case pages (?svc= alone) prefill the first
 *   answers, echoed back with where they came from: "your estimate" only when
 *   the link carried one, "the pricing page" for a bundle, otherwise "the page
 *   you came from".
 * - Errors sit under the field they belong to, in words that say how to fix
 *   them; the first invalid field takes focus. Inputs are 17px (no iOS zoom),
 *   targets at least 48px.
 * - Sending uses the shared useContactSubmit (reCAPTCHA v3 loads on first
 *   focus, /api/contact payload unchanged). If sending fails, the answers stay
 *   and the brief can go out by email instead, already written.
 */

type Step = 1 | 2 | 3 | 4;
type FieldName = 'kind' | 'size' | 'name' | 'email' | 'phone';

/** The unsent brief, kept per tab (sessionStorage) so a detour does not lose it. */
const DRAFT_KEY = 'mapl:brief-draft';
interface Draft {
  kind: BriefKind | null;
  size: string | null;
  step: Step | null;
  details: string;
  name: string;
  email: string;
  company: string;
  reply: ReplyMethod;
  phone: string;
}

const STEP_NAMES = ['What', 'Size', 'Details', 'Reply'] as const;
// The radio's fill (200ms) and the row's ring finish, then a beat to read them.
const ADVANCE_DELAY = 320;
const FOLD_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

const MESSAGES: Record<FieldName, string> = {
  kind: 'Choose what you are building, or pick “Not sure yet”.',
  size: 'Choose the closest size, or “Not sure yet”. You can explain in the next step.',
  name: 'Enter your name so we know who to reply to.',
  email: 'Enter an email address, like name@agency.com.',
  phone: 'Enter a phone number, or choose to hear back by email.',
};

function emailError(value: string): string | undefined {
  if (!value.trim()) return 'Enter your email address so we can reply.';
  return isEmail(value.trim()) ? undefined : MESSAGES.email;
}

export default function ProjectBrief({
  reassure,
  after,
}: {
  /** One sourced line added to the reply line beside "Send the brief" (the page's NDA promise). */
  reassure?: string;
  /**
   * One plain line under the button saying what happens once the brief is
   * sent, shown below 1024px only: there the page's own "What happens next"
   * comes after the whole form instead of beside it.
   */
  after?: string;
} = {}) {
  const search = useSearchString();
  const prefill = useMemo(() => readPrefill(search), [search]);
  const { status, error, submit, warmUp } = useContactSubmit();

  const [kindChoice, setKindChoice] = useState<BriefKind | null>(null);
  const [sizeChoice, setSizeChoice] = useState<string | null>(null);
  const [openStep, setOpenStep] = useState<Step | null>(null);
  const [details, setDetails] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [reply, setReply] = useState<ReplyMethod>('email');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [sent, setSent] = useState<{ lines: BriefLine[]; reply: ReplyMethod; email: string; phone: string; href: string } | null>(null);

  // The draft survives following a link away and coming back: kept in this
  // tab's sessionStorage (never sent anywhere), restored on return, cleared
  // once the brief is sent. A link that pre-picks a different service wins
  // over the draft's own answers; the typed fields come back either way.
  const draftReady = useRef(false);
  useEffect(() => {
    let draft: Partial<Draft> | null = null;
    try {
      draft = JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) ?? 'null');
    } catch {
      draft = null;
    }
    const frame = requestAnimationFrame(() => {
      if (draft) {
        const linked = readPrefill(window.location.search);
        if (!linked || linked.kind === draft.kind) {
          if (typeof draft.kind === 'string' && isBriefKind(draft.kind)) setKindChoice(draft.kind);
          if (typeof draft.size === 'string') setSizeChoice(draft.size);
          if (draft.step === 1 || draft.step === 2 || draft.step === 3 || draft.step === 4) setOpenStep(draft.step);
        }
        if (typeof draft.details === 'string') setDetails(draft.details);
        if (typeof draft.name === 'string') setName(draft.name);
        if (typeof draft.email === 'string') setEmail(draft.email);
        if (typeof draft.company === 'string') setCompany(draft.company);
        if (draft.reply === 'email' || draft.reply === 'phone') setReply(draft.reply);
        if (typeof draft.phone === 'string') setPhone(draft.phone);
      }
      draftReady.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (sent || !draftReady.current) return;
    const draft: Draft = { kind: kindChoice, size: sizeChoice, step: openStep, details, name, email, company, reply, phone };
    const empty = !kindChoice && !sizeChoice && !details && !name && !email && !company && !phone;
    try {
      if (empty) window.sessionStorage.removeItem(DRAFT_KEY);
      else window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage blocked: the brief still works, it just is not kept.
    }
  }, [kindChoice, sizeChoice, openStep, details, name, email, company, reply, phone, sent]);

  // Answers: the visitor's choice wins; otherwise the prefill from the link they followed.
  const kind: BriefKind | null = kindChoice ?? prefill?.kind ?? null;
  const prefillSize = prefill && prefill.kind === kind ? (prefill.size ?? null) : null;
  const size = sizeChoice ?? prefillSize;
  const needsSize = kind !== null && kind !== 'unsure';
  const defaultStep: Step = !prefill ? 1 : prefill.kind === 'unsure' || prefill.size ? 3 : 2;
  const step: Step = openStep ?? defaultStep;
  // The questions this answer's path asks: "Not sure yet" skips the size, so
  // the count and the bar show three steps, never a ticked one that was not asked.
  const path: readonly Step[] = kind === 'unsure' ? [1, 3, 4] : [1, 2, 3, 4];
  const position = path.filter((at) => at <= step).length;
  const sizes = sizeOptions(kind);
  const fromPrefill = Boolean(prefill) && kindChoice === null;
  // Say only what the link carried: an estimate (a size), a bundle, or just the service line.
  const prefillFrom =
    prefill?.source === 'estimate' ? 'your estimate' : prefill?.source === 'bundle' ? 'the pricing page' : 'the page you came from';

  const answers: BriefAnswers = {
    kind,
    size,
    details,
    name: name.trim(),
    email: email.trim(),
    company: company.trim(),
    reply,
    phone: phone.trim(),
  };

  // Focus follows the step the visitor opened, and the first invalid field on a failed send.
  const focusStep = useRef(false);
  const focusField = useRef<string | null>(null);
  const advanceTimer = useRef<number | undefined>(undefined);
  const questionRefs = useRef<Partial<Record<Step, HTMLElement | null>>>({});
  const doneRef = useRef<HTMLHeadingElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  // Where the answer was on screen when its step closed: the new row slides up from there.
  const foldFrom = useRef<{ step: Step; top: number } | null>(null);

  useEffect(() => {
    const fold = foldFrom.current;
    foldFrom.current = null;
    if (fold && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const row = formRef.current?.querySelector<HTMLElement>(`[data-row="${fold.step}"]`);
      const dy = row ? fold.top - row.getBoundingClientRect().top : 0;
      if (row && Math.abs(dy) > 2) {
        row.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], {
          duration: 420,
          easing: FOLD_EASE,
        });
      }
    }
    if (!focusStep.current) return;
    focusStep.current = false;
    questionRefs.current[step]?.focus();
  }, [step]);

  useEffect(() => {
    if (!focusField.current) return;
    document.getElementById(focusField.current)?.focus();
    focusField.current = null;
  }, [errors]);

  useEffect(() => {
    if (sent) doneRef.current?.focus();
  }, [sent]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const goTo = (next: Step) => {
    window.clearTimeout(advanceTimer.current);
    // Moving forward: remember where the answer sits, so its folded row can arrive from there.
    if (next > step) {
      const open = formRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`);
      const answer =
        open?.querySelector<HTMLElement>('input:checked')?.closest<HTMLElement>('label') ??
        open?.querySelector<HTMLElement>('textarea') ??
        open;
      if (answer) foldFrom.current = { step, top: answer.getBoundingClientRect().top };
    }
    focusStep.current = true;
    setOpenStep(next);
  };

  const commit = (from: Step) => {
    if (from === 1) {
      if (!kind) return setErrors({ kind: MESSAGES.kind });
      setErrors({});
      return goTo(kind === 'unsure' ? 3 : 2);
    }
    if (from === 2) {
      if (needsSize && !size) return setErrors({ size: MESSAGES.size });
      setErrors({});
      return goTo(3);
    }
    if (from === 3) return goTo(4);
  };

  /** A real pointer pick (click detail > 0) moves on by itself; keyboard selection never does. */
  const pointerPick = (event: MouseEvent<HTMLLabelElement>, next: Step) => {
    if (event.detail === 0) return;
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => goTo(next), ADVANCE_DELAY);
  };

  const chooseKind = (value: string) => {
    if (!isBriefKind(value)) return;
    if (value !== kind) setSizeChoice(null);
    setKindChoice(value);
    setErrors({});
  };

  const chooseSize = (value: string) => {
    setSizeChoice(value);
    setErrors({});
  };

  const replyErrors = (): Partial<Record<FieldName, string>> => {
    const found: Partial<Record<FieldName, string>> = {};
    if (!name.trim()) found.name = MESSAGES.name;
    const mail = emailError(email);
    if (mail) found.email = mail;
    if (reply === 'phone' && phone.replace(/\D/g, '').length < 7) found.phone = MESSAGES.phone;
    return found;
  };

  // Errors clear as soon as the value is fixed (while typing). A malformed email
  // or phone is flagged on blur, but never while a pointer is pressed: adding a
  // line under the field mid-click would move the next target away from the
  // pointer and swallow the click, so that check waits for the pointer to lift.
  const pointerDown = useRef(false);
  const pendingBlur = useRef<(() => void) | null>(null);

  useEffect(() => {
    const down = () => {
      pointerDown.current = true;
    };
    const up = () => {
      window.setTimeout(() => {
        pointerDown.current = false;
        const run = pendingBlur.current;
        pendingBlur.current = null;
        run?.();
      }, 0);
    };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('pointerup', up, true);
    document.addEventListener('pointercancel', up, true);
    return () => {
      document.removeEventListener('pointerdown', down, true);
      document.removeEventListener('pointerup', up, true);
      document.removeEventListener('pointercancel', up, true);
    };
  }, []);

  const fixed = (field: 'name' | 'email' | 'phone', value: string) => {
    if (!errors[field]) return;
    const ok =
      field === 'name' ? value.trim().length > 0 : field === 'email' ? !emailError(value) : value.replace(/\D/g, '').length >= 7;
    if (ok) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onBlur = (field: 'email' | 'phone') => (event: FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value.trim()) return;
    const check = () =>
      setErrors((current) => ({
        ...current,
        [field]: field === 'email' ? emailError(value) : value.replace(/\D/g, '').length < 7 ? MESSAGES.phone : undefined,
      }));
    if (pointerDown.current) pendingBlur.current = check;
    else check();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < 4) return commit(step);
    if (status === 'sending') return;
    const found = replyErrors();
    if (Object.keys(found).length) {
      focusField.current = found.name ? 'brief-name' : found.email ? 'brief-email' : 'brief-phone';
      return setErrors(found);
    }
    setErrors({});
    const { subject, message } = composeBrief(answers, prefill);
    const ok = await submit({
      name: answers.name,
      email: answers.email,
      phone: reply === 'phone' ? answers.phone : undefined,
      contactMethod: reply,
      subject,
      message,
    });
    if (ok) {
      try {
        window.sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // Nothing was kept.
      }
      setSent({
        lines: briefLines(answers, prefill),
        reply,
        email: answers.email,
        phone: answers.phone,
        href: estimateLinkFor(answers),
      });
    }
  };

  if (sent) {
    // The same <form> element stays mounted around the confirmation (React keeps
    // the node), so the mobile action bar still treats the brief as an on-screen
    // form and does not offer "Back to the brief" over "Brief sent.".
    return (
      <form ref={formRef} className={styles.brief} onSubmit={(event) => event.preventDefault()} noValidate>
        <div className={styles.done}>
          <svg className={styles.doneMark} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle className={styles.doneRing} cx="32" cy="32" r="30" pathLength={1} />
            <path className={styles.doneTick} d="M20 33.5 28.5 42 45 24" pathLength={1} />
          </svg>
          <h2 ref={doneRef} tabIndex={-1} className={styles.doneTitle}>
            Brief sent.
          </h2>
          <p className={styles.doneText}>
            It is in our inbox at {siteConfig.email}. We will reply{' '}
            {sent.reply === 'phone' ? (
              <>
                with a call to <strong>{sent.phone}</strong>
              </>
            ) : (
              <>
                by email to <strong>{sent.email}</strong>
              </>
            )}
            .
          </p>
          <dl className={styles.doneList}>
            {sent.lines.map((line) => (
              <div key={line.label}>
                <dt>{line.label}</dt>
                <dd>{line.value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.doneNext}>
            While you wait:{' '}
            <Link href={sent.href} data-cta-placement="contact_brief_sent_estimate">
              Price your project
            </Link>{' '}
            or <Link href="/our-work">see the work</Link>.
          </p>
        </div>
      </form>
    );
  }

  // Answered steps above the open one fold into rows.
  const rows: { step: Step; question: string; value: string }[] = [];
  if (step > 1 && kind) rows.push({ step: 1, question: 'What are we building?', value: kindLabel(kind) });
  if (step > 2 && needsSize) {
    const picked = sizes.find((option) => option.key === size);
    rows.push({
      step: 2,
      question: sizeQuestion(kind),
      value: picked ? [picked.label, picked.price?.replace(/^From/, 'from')].filter(Boolean).join(', ') : 'Not sure yet',
    });
  }
  if (step > 3) {
    const text = details.trim();
    rows.push({ step: 3, question: 'What should we know?', value: text ? (text.length > 90 ? `${text.slice(0, 88)}…` : text) : 'Nothing added' });
  }

  const answered = step === 1 ? kind !== null : step === 2 ? size !== null : step === 3 ? details.trim().length > 0 : false;

  /** If sending fails, the same brief opens in the visitor's mail app, already written. */
  const mailFallback = () => {
    const { subject, message } = composeBrief(answers, prefill);
    return `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  };

  const setQuestionRef = (at: Step) => (el: HTMLElement | null) => {
    questionRefs.current[at] = el;
  };

  return (
    <form
      ref={formRef}
      className={styles.brief}
      onSubmit={onSubmit}
      onFocusCapture={warmUp}
      noValidate
      aria-labelledby="brief-title"
    >
      <div className={styles.head}>
        <h2 id="brief-title" className={styles.title}>
          Your brief
        </h2>
        {/* Visual only: the progress list below carries "step 2 of 4" for assistive
            tech. A label beside "Your brief", never louder than the question. */}
        <p className={styles.count} aria-hidden="true">
          Step {position} of {path.length}
        </p>
      </div>

      <ol className={styles.progress} aria-label={`Progress: step ${position} of ${path.length}`}>
        {path.map((at) => {
          const label = STEP_NAMES[at - 1];
          const state = at < step ? 'done' : at === step ? 'current' : 'todo';
          return (
            <li
              key={label}
              className={styles.segment}
              data-state={state}
              data-answered={state === 'current' && answered ? '' : undefined}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className={styles.track} aria-hidden="true">
                <span className={styles.fill} />
              </span>
              <span className={styles.segmentLabel}>
                {label}
                <span className="visually-hidden">
                  {state === 'done' ? ', done' : state === 'current' ? ', current step' : ', to do'}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {fromPrefill && step >= defaultStep && rows.length ? (
        <p className={styles.prefill}>Filled in from {prefillFrom}. Change anything that is not right.</p>
      ) : null}

      {rows.length ? (
        <ul className={styles.answers} aria-label="Your answers so far">
          {rows.map((row) => (
            <li key={row.step} className={styles.answer} data-row={row.step}>
              <span className={styles.answerTick} aria-hidden="true" />
              <span className={styles.answerText}>
                <span className={styles.answerQuestion}>{row.question}</span>
                <span className={styles.answerValue}>{row.value}</span>
              </span>
              <button type="button" className={styles.change} onClick={() => goTo(row.step)}>
                Change<span className="visually-hidden">: {row.question}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* ---------------------------------------------------------- step 1 */}
      {/* The hint (and the error, when there is one) describes the group once, not every option. */}
      <fieldset
        className={styles.step}
        hidden={step !== 1}
        data-step="1"
        aria-describedby={errors.kind ? 'brief-kind-hint brief-kind-error' : 'brief-kind-hint'}
      >
        <legend ref={setQuestionRef(1)} tabIndex={-1} className={styles.question}>
          What are we building?
        </legend>
        <p id="brief-kind-hint" className={styles.hint}>
          Pick one to move on. You can change it before you send.
        </p>
        <Options
          name="kind"
          options={KIND_OPTIONS}
          value={kind}
          onChange={chooseKind}
          onPick={(event, option) => pointerPick(event, option.key === 'unsure' ? 3 : 2)}
          required
        />
        {errors.kind ? <FieldError id="brief-kind-error" message={errors.kind} alert /> : null}
      </fieldset>

      {/* ---------------------------------------------------------- step 2 */}
      <fieldset
        className={styles.step}
        hidden={step !== 2}
        data-step="2"
        aria-describedby={errors.size ? 'brief-size-hint brief-size-error' : 'brief-size-hint'}
      >
        <legend ref={setQuestionRef(2)} tabIndex={-1} className={styles.question}>
          {sizeQuestion(kind)}
        </legend>
        <p id="brief-size-hint" className={styles.hint}>
          {kind === 'partner'
            ? 'Each partnership shows its public monthly price. Pick one to move on.'
            : 'Each size shows its public price. Pick one to move on.'}
        </p>
        <Options
          name="size"
          options={sizes}
          value={size}
          onChange={chooseSize}
          onPick={(event) => pointerPick(event, 3)}
          required={needsSize}
        />
        {errors.size ? <FieldError id="brief-size-error" message={errors.size} alert /> : null}
      </fieldset>

      {/* ---------------------------------------------------------- step 3 */}
      <div className={styles.step} hidden={step !== 3} data-step="3" role="group" aria-labelledby="brief-details-label">
        <label
          ref={setQuestionRef(3)}
          tabIndex={-1}
          id="brief-details-label"
          htmlFor="brief-details"
          className={styles.question}
        >
          What should we know?
        </label>
        <p id="brief-details-hint" className={styles.hint}>
          Optional. {kind === 'unsure' ? 'What are you trying to get done?' : 'The goal, what exists today and any deadline.'} A
          few lines is enough.
        </p>
        <textarea
          id="brief-details"
          name="details"
          rows={5}
          className={styles.textarea}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          aria-describedby="brief-details-hint"
        />
      </div>

      {/* ---------------------------------------------------------- step 4 */}
      <fieldset className={styles.step} hidden={step !== 4} data-step="4">
        <legend ref={setQuestionRef(4)} tabIndex={-1} className={styles.question}>
          Where should we reply?
        </legend>
        <div className={styles.fields}>
          <Field
            id="brief-name"
            label="Your name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              fixed('name', event.target.value);
            }}
            error={errors.name}
            required
          />
          <Field
            id="brief-email"
            label="Email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              fixed('email', event.target.value);
            }}
            onBlur={onBlur('email')}
            error={errors.email}
            note={
              <>
                We use your email to contact you about your brief. We never sell it.{' '}
                <Link href="/privacy">Privacy policy</Link>
              </>
            }
            required
          />
          <Field
            id="brief-company"
            label="Agency or company"
            optional
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
          <fieldset className={styles.method}>
            <legend className={styles.label}>How should we reply?</legend>
            <div className={styles.segmented}>
              {(['email', 'phone'] as const).map((method) => (
                <label key={method} className={styles.methodOption}>
                  <input
                    type="radio"
                    name="contactMethod"
                    value={method}
                    checked={reply === method}
                    onChange={() => setReply(method)}
                    className={`${styles.radio} ${styles.methodRadio}`}
                  />
                  <span>{method === 'email' ? 'Email me' : 'Call me'}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div hidden={reply !== 'phone'}>
            <Field
              id="brief-phone"
              label="Phone number"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                fixed('phone', event.target.value);
              }}
              onBlur={onBlur('phone')}
              error={errors.phone}
              required={reply === 'phone'}
            />
          </div>
        </div>
      </fieldset>

      {status === 'error' ? (
        <div className={styles.failed} role="alert">
          <p className={styles.failedTitle}>That did not send.</p>
          <p className={styles.failedText}>
            {error && error !== GENERIC_ERROR ? `${error} ` : ''}Your answers are still here, so you can try again, or{' '}
            <a href={mailFallback()}>email the brief instead</a> (it opens already written).
          </p>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.submit}
          aria-disabled={status === 'sending' ? true : undefined}
          data-cta-placement={step < 4 ? `contact_brief_step${step}` : 'contact_brief_send'}
        >
          {step < 4 ? 'Continue' : status === 'sending' ? 'Sending…' : 'Send the brief'}
          {status === 'sending' && step === 4 ? null : (
            <span className={styles.arrow} aria-hidden="true">
              <Arrow />
            </span>
          )}
        </button>
        {step === 4 ? (
          <p className={styles.trust}>
            We reply by email or a call, whichever you chose.{reassure ? ` ${reassure}` : null}
          </p>
        ) : (
          <p className={styles.trust}>Nothing is sent until the last step.</p>
        )}
        {after ? <p className={styles.after}>{after}</p> : null}
      </div>

      {/* The badge is hidden site-wide (globals.scss), so Google's notice is shown in its own words. */}
      <RecaptchaNotice className={styles.recaptcha} />
    </form>
  );
}

// ---------------------------------------------------------------- parts

function Options({
  name,
  options,
  value,
  onChange,
  onPick,
  required = false,
}: {
  name: string;
  options: readonly ChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
  onPick: (event: MouseEvent<HTMLLabelElement>, option: ChoiceOption) => void;
  /** Announced as required (the brief checks the answer itself on Continue). */
  required?: boolean;
}) {
  return (
    <div className={styles.options}>
      {options.map((option, index) => (
        <label
          key={option.key}
          className={styles.option}
          style={{ '--i': index } as CSSProperties}
          onClick={(event) => onPick(event, option)}
        >
          <input
            type="radio"
            name={name}
            value={option.key}
            checked={value === option.key}
            onChange={() => onChange(option.key)}
            required={required}
            className={styles.radio}
          />
          <span className={styles.optionText}>
            <span className={styles.optionLabel}>{option.label}</span>
            {option.detail ? <span className={styles.optionDetail}>{option.detail}</span> : null}
          </span>
          {option.price ? <span className={styles.optionPrice}>{option.price}</span> : null}
        </label>
      ))}
    </div>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  /** A plain line under the field (after its error), read with it as its description. */
  note?: ReactNode;
}

function Field({ id, label, optional, error, note, required, ...input }: FieldProps) {
  const describedBy = [error ? `${id}-error` : null, note ? `${id}-note` : null].filter(Boolean).join(' ');
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional ? <span className={styles.optional}> (optional)</span> : null}
      </label>
      <input
        id={id}
        className={styles.input}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...input}
      />
      {error ? <FieldError id={`${id}-error`} message={error} /> : null}
      {note ? (
        <p id={`${id}-note`} className={styles.fieldNote}>
          {note}
        </p>
      ) : null}
    </div>
  );
}

function FieldError({ id, message, alert = false }: { id: string; message: string; alert?: boolean }) {
  return (
    <p id={id} className={styles.error} role={alert ? 'alert' : undefined}>
      <span className={styles.errorIcon} aria-hidden="true">
        !
      </span>
      {message}
    </p>
  );
}

