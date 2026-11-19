'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react';
import Image from 'next/image';
import Arrow from '@/components/ui/Arrow';
import Recaptcha from '@/components/convert/Recaptcha';
import { GENERIC_ERROR, useContactSubmit } from '@/components/convert/useContactSubmit';
import {
  QUESTIONS,
  answerError,
  answerLabel,
  composeLead,
  firstName,
  firstUnanswered,
  questionTitle,
  readUtm,
  type Answers,
  type Question,
} from './questions';
import { OPEN_EVENT, readAttribution, readDraft, readWatch, track, writeAttribution, writeDraft, type OpenDetail } from './events';
import { BOOKING_URL, CTA_LABEL } from './vsl';
import styles from './CallForm.module.scss';

/**
 * The call request, one question a screen, in the style of the Typeform
 * Leshan pointed to (hiddengem.media): the logo top left, Close top right, a
 * progress line along the top, the question numbered, a large field, OK
 * (or Enter), and up/down arrows bottom right. Built here rather than
 * embedded, so it loads nothing from another company, matches the site and
 * sends through the site's own /api/contact (SMTP2GO, the honeypot and
 * reCAPTCHA when its keys are set), tagged "bio.mapltech.com".
 *
 * - A native <dialog> (showModal): the page behind is inert, Escape closes,
 *   and focus returns to the button that opened it.
 * - Choices answer with one tap (or the letter key, as on Typeform) and move
 *   on; arrow keys only select, so a keyboard user confirms with Enter.
 * - Answers are kept for the tab (sessionStorage), so closing it, or
 *   following a case study and coming back, never loses them.
 * - The last screen restates every answer with an Edit link before sending.
 */

const LETTERS = 'ABCDEFGHIJ';
const REVIEW = QUESTIONS.length;
const ADVANCE_MS = 260;

interface Draft {
  answers: Answers;
  step: number;
}

type Direction = 'forward' | 'back';

export default function CallForm() {
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const advanceTimer = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<Direction>('forward');
  const [answers, setAnswers] = useState<Answers>({});
  const answersRef = useRef<Answers>({});
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const { status, error: sendError, submit, reset, captcha } = useContactSubmit('bio_call_request');
  const done = status === 'success';

  const question: Question | undefined = QUESTIONS[step];
  const titleId = `${uid}-title`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;
  const formId = `${uid}-form`;
  const autoId = `${uid}-auto`;

  // Where the visitor came from: the first page view of the session wins.
  useEffect(() => {
    if (readAttribution()) return;
    const { origin, pathname, search } = window.location;
    const utm = readUtm(search);
    const query = utm ? `?${new URLSearchParams(utm as Record<string, string>).toString()}` : '';
    let referrer: string | undefined;
    try {
      if (document.referrer) {
        const ref = new URL(document.referrer);
        if (ref.host !== window.location.host) referrer = `${ref.origin}${ref.pathname}`;
      }
    } catch {
      referrer = undefined;
    }
    writeAttribution({ landing: `${origin}${pathname}${query}`, referrer, utm });
  }, []);

  const setAll = useCallback((next: Answers) => {
    answersRef.current = next;
    setAnswers(next);
  }, []);

  const show = useCallback(
    (placement: string) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      let resumed = false;
      if (status !== 'success') {
        const draft = readDraft<Draft>();
        if (draft?.answers) {
          setAll(draft.answers);
          const unanswered = firstUnanswered(draft.answers);
          const step = Math.max(0, Math.min(draft.step ?? 0, REVIEW));
          // Back where they left off, but never past a question that still needs an answer.
          setStep(unanswered === -1 ? step : Math.min(step, unanswered));
          resumed = Object.keys(draft.answers).length > 0;
        }
      } else {
        reset();
        setAll({});
        setStep(0);
      }
      setError('');
      setEditing(false);
      setDirection('forward');
      dialog.showModal();
      setOpen(true);
      track('call_form_open', { placement, resumed });
    },
    [reset, setAll, status],
  );

  // Every "Book my call" button on the page, and a link to bio.mapltech.com/#book.
  useEffect(() => {
    const onOpen = (event: Event) => show((event as CustomEvent<OpenDetail>).detail?.placement ?? 'unknown');
    window.addEventListener(OPEN_EVENT, onOpen);
    // A link to bio.mapltech.com/#book opens the form once the page is ready.
    const frame = window.location.hash === '#book' ? window.requestAnimationFrame(() => show('link')) : undefined;
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [show]);

  // Keep the unsent answers for the tab.
  useEffect(() => {
    if (!open || done) return;
    writeDraft({ answers, step } satisfies Draft);
  }, [answers, step, open, done]);

  // Focus the step: the field for a typed answer, the chosen (or first) option, else the heading.
  useEffect(() => {
    if (!open) return;
    const body = bodyRef.current;
    if (!body) return;
    // On a touch screen a choice step focuses its question, not the first answer, so no
    // answer wears a focus ring that reads as already chosen.
    const touch = window.matchMedia('(pointer: coarse)').matches;
    const frame = window.requestAnimationFrame(() => {
      const target =
        body.querySelector<HTMLElement>('[data-autofocus]') ??
        (touch ? null : body.querySelector<HTMLElement>('input[type="radio"]:checked')) ??
        (touch ? null : body.querySelector<HTMLElement>('input[type="radio"]')) ??
        body.querySelector<HTMLElement>('[data-heading]');
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, step, done]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const close = useCallback(() => {
    window.clearTimeout(advanceTimer.current);
    dialogRef.current?.close();
  }, []);

  const onDialogClose = () => {
    setOpen(false);
    track('call_form_close', { step: done ? 'sent' : question?.id ?? 'review' });
    openerRef.current?.focus({ preventScroll: true });
  };

  const goTo = useCallback((next: number, dir: Direction) => {
    window.clearTimeout(advanceTimer.current);
    setDirection(dir);
    setError('');
    setStep(Math.max(0, Math.min(next, REVIEW)));
  }, []);

  /** Checks the current answer; moves on when it can be sent. */
  const advance = useCallback(
    (from: number) => {
      const q = QUESTIONS[from];
      if (!q) return;
      const problem = answerError(q, answersRef.current[q.id]);
      if (problem) {
        setError(problem);
        track('call_form_error', { question: q.id });
        bodyRef.current?.querySelector<HTMLElement>('[data-autofocus], input[type="radio"]')?.focus();
        return;
      }
      track('call_form_step', { question: q.id, number: from + 1 });
      if (editing) {
        setEditing(false);
        goTo(REVIEW, 'forward');
      } else {
        goTo(from + 1, 'forward');
      }
    },
    [editing, goTo],
  );

  const setAnswer = (id: Question['id'], value: string) => {
    setAll({ ...answersRef.current, [id]: value });
    if (error) setError('');
  };

  const choose = (q: Question, value: string, andAdvance: boolean) => {
    setAnswer(q.id, value);
    if (!andAdvance) return;
    window.clearTimeout(advanceTimer.current);
    const from = step;
    advanceTimer.current = window.setTimeout(() => advance(from), ADVANCE_MS);
  };

  const onStepSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step < REVIEW) advance(step);
    else void send();
  };

  const send = async () => {
    const missing = firstUnanswered(answersRef.current);
    if (missing !== -1) {
      goTo(missing, 'back');
      setError(answerError(QUESTIONS[missing], answersRef.current[QUESTIONS[missing].id]));
      return;
    }
    if (status === 'sending') return;
    const honeypot = (dialogRef.current?.querySelector<HTMLInputElement>('input[name="website"]')?.value ?? '').trim();
    const lead = composeLead(answersRef.current, readAttribution(), readWatch());
    const sent = await submit({ ...lead, source: '/bio', ...(honeypot ? { website: honeypot } : {}) } as Parameters<typeof submit>[0]);
    if (sent) {
      writeDraft(null);
      track('call_form_sent', {
        building: answersRef.current.build,
        deadline: answersRef.current.deadline,
        budget: answersRef.current.budget,
      });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!question || event.altKey || event.ctrlKey || event.metaKey) return;
    // Typeform's letter keys on a choice question.
    if (question.kind === 'choice' && event.key.length === 1) {
      const index = LETTERS.indexOf(event.key.toUpperCase());
      if (index >= 0 && index < question.choices.length) {
        event.preventDefault();
        choose(question, question.choices[index].value, true);
      }
    }
  };

  const onTextareaKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter moves on, Shift + Enter starts a new line (never mid-composition, for IME input).
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) close();
  };

  const progress = done ? 1 : step / REVIEW;
  const value = question ? (answers[question.id] ?? '') : '';
  const describedBy = [question?.hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;
  // Choices say beforehand that a tap moves on (WCAG 3.2.2); the arrow keys only select.
  const choiceDescribedBy = [describedBy, autoId].filter(Boolean).join(' ');
  const optionalEmpty = Boolean(question && !question.required && !value.trim());
  const first = firstName(answers.name);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onDialogClose}
      onClick={onBackdrop}
      data-call-form=""
    >
      <div className={styles.panel} onKeyDown={onKeyDown}>
        <div className={styles.progress} aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>

        <header className={styles.top}>
          <Image src="/images/mapl-tech-logo.svg" alt="MAPL TECH" width={110} height={24} className={styles.logo} />
          <button type="button" className={styles.close} onClick={close}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="visually-hidden">Close</span>
          </button>
        </header>

        <div className={styles.body} ref={bodyRef}>
          {open ? (
            <form
              id={formId}
              key={done ? 'done' : step}
              className={styles.step}
              data-direction={direction}
              onSubmit={onStepSubmit}
              noValidate
            >
              {done ? (
                <div className={styles.done}>
                  <span className={styles.doneMark} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="28" height="28" focusable="false">
                      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h2 id={titleId} className={styles.title} tabIndex={-1} data-heading="">
                    Thanks{first ? `, ${first}` : ''}. Your call request is in.
                  </h2>
                  <p className={styles.lead}>
                    We’ll email <strong>{answers.email}</strong> within 24 hours to set a time for your 20-minute call. After the
                    call, you get one fixed price and an agreed launch date.
                  </p>
                  <div className={styles.actions}>
                    {BOOKING_URL ? (
                      <a
                        className={styles.send}
                        href={BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cta-placement="bio_form_done_schedule"
                      >
                        Pick a time now
                        <span className="visually-hidden"> (opens in a new tab)</span>
                        <span aria-hidden="true" className={styles.sendArrow}>
                          <Arrow />
                        </span>
                      </a>
                    ) : null}
                    <button type="button" className={styles.ok} onClick={close}>
                      Done
                    </button>
                    <a className={styles.textLink} href="https://mapltech.com/our-work" data-cta-placement="bio_form_done_work">
                      See our work while you wait
                    </a>
                  </div>
                </div>
              ) : question ? (
                <>
                  <h2 id={titleId} className={styles.title} tabIndex={-1} data-heading="">
                    <span className="visually-hidden">
                      Question {step + 1} of {QUESTIONS.length}:{' '}
                    </span>
                    <span className={styles.number} aria-hidden="true">
                      {step + 1}
                      <Arrow />
                    </span>
                    {questionTitle(question, answers)}
                    {question.required ? (
                      <span className={styles.required} aria-hidden="true">
                        *
                      </span>
                    ) : null}
                  </h2>
                  {question.hint ? (
                    <p id={hintId} className={styles.hint}>
                      {question.hint}
                    </p>
                  ) : null}

                  {question.kind === 'choice' ? (
                    <div
                      className={styles.choices}
                      role="radiogroup"
                      aria-labelledby={titleId}
                      aria-describedby={choiceDescribedBy}
                      aria-required="true"
                      aria-invalid={error ? true : undefined}
                    >
                      <span id={autoId} className="visually-hidden">
                        Clicking or tapping an answer moves to the next question. With the keyboard, choose with the arrow keys
                        and press Enter.
                      </span>
                      {question.choices.map((choice, i) => {
                        const checked = value === choice.value;
                        return (
                          <label
                            key={choice.value}
                            className={styles.choice}
                            data-checked={checked ? '' : undefined}
                            // A real click or tap (detail > 0) answers and moves on; the click
                            // an arrow key sends to the radio (detail 0) only selects.
                            onClick={(event) => {
                              if (event.detail > 0) choose(question, choice.value, true);
                            }}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={choice.value}
                              checked={checked}
                              onChange={() => choose(question, choice.value, false)}
                              className={styles.radio}
                            />
                            <span className={styles.key} aria-hidden="true">
                              {LETTERS[i]}
                            </span>
                            <span className={styles.choiceLabel}>{choice.label}</span>
                            <svg className={styles.tick} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </label>
                        );
                      })}
                    </div>
                  ) : question.kind === 'long' ? (
                    <textarea
                      className={`${styles.field} ${styles.area}`}
                      aria-labelledby={titleId}
                      aria-describedby={describedBy}
                      aria-required={question.required}
                      aria-invalid={error ? true : undefined}
                      placeholder={question.placeholder}
                      maxLength={question.maxLength}
                      autoComplete={question.autoComplete}
                      enterKeyHint="next"
                      rows={2}
                      value={value}
                      onChange={(event) => setAnswer(question.id, event.target.value)}
                      onKeyDown={onTextareaKey}
                      data-autofocus=""
                    />
                  ) : (
                    <input
                      className={styles.field}
                      type={question.kind === 'email' ? 'email' : question.kind === 'tel' ? 'tel' : 'text'}
                      inputMode={question.kind === 'email' ? 'email' : question.kind === 'tel' ? 'tel' : 'text'}
                      aria-labelledby={titleId}
                      aria-describedby={describedBy}
                      aria-required={question.required}
                      aria-invalid={error ? true : undefined}
                      placeholder={question.placeholder}
                      maxLength={question.maxLength}
                      autoComplete={question.autoComplete}
                      autoCapitalize={question.kind === 'text' ? 'words' : 'off'}
                      autoCorrect="off"
                      spellCheck={question.kind === 'text' ? undefined : false}
                      enterKeyHint={step === REVIEW - 1 ? 'done' : 'next'}
                      value={value}
                      onChange={(event) => setAnswer(question.id, event.target.value)}
                      data-autofocus=""
                    />
                  )}

                  <p id={errorId} className={styles.error} role="alert">
                    {error ? (
                      <>
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        {error}
                      </>
                    ) : null}
                  </p>

                  <div className={styles.actions}>
                    <button type="submit" className={styles.ok}>
                      {editing ? 'Save' : optionalEmpty ? 'Skip' : 'OK'}
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                        <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {question.kind === 'choice' ? null : (
                      <span className={styles.enterHint} aria-hidden="true">
                        press <strong>Enter</strong> ↵
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 id={titleId} className={styles.title} tabIndex={-1} data-heading="">
                    Ready to book your call{first ? `, ${first}` : ''}?
                  </h2>
                  <p className={styles.hint}>Check your answers. You can change any of them.</p>
                  <dl className={styles.review}>
                    {QUESTIONS.map((q, i) => (
                      <div key={q.id} className={styles.reviewRow}>
                        <dt>{q.label}</dt>
                        <dd>
                          <span className={styles.reviewValue}>{answerLabel(q, answers[q.id]) || 'Not given'}</span>
                          <button
                            type="button"
                            className={styles.edit}
                            onClick={() => {
                              setEditing(true);
                              goTo(i, 'back');
                            }}
                          >
                            Edit<span className="visually-hidden"> {q.label.toLowerCase()}</span>
                          </button>
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className={styles.honeypot} aria-hidden="true">
                    <label>
                      Website
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>

                  {status === 'error' ? (
                    <p className={styles.failed} role="alert">
                      We couldn’t send your answers.{' '}
                      {sendError && sendError !== GENERIC_ERROR ? `${sendError} ` : 'Check your connection and press Book my call again. '}
                      They’re still here. Or email{' '}
                      <a href="mailto:contact@mapltech.com?subject=Call%20request%20from%20bio.mapltech.com">contact@mapltech.com</a>.
                    </p>
                  ) : null}

                  <Recaptcha control={captcha} theme="dark" />

                  <p className={styles.nextStep}>
                    {BOOKING_URL
                      ? 'Next, you pick a time for the 20-minute call.'
                      : 'We’ll email you within 24 hours to set the time for your 20-minute call.'}
                  </p>
                  <p className={styles.privacy}>
                    We use your answers only to reply to you, and we never sell them.{' '}
                    <a href="https://mapltech.com/privacy">Privacy policy</a>
                  </p>
                </>
              )}
            </form>
          ) : null}
        </div>

        {!done && step === REVIEW ? (
          // The send button sits in the bottom bar, in reach however long the review is.
          <div className={`${styles.nav} ${styles.sendBar}`}>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navSingle}`}
              onClick={() => goTo(step - 1, 'back')}
              aria-label="Previous question"
            >
              <Arrow direction="up" />
            </button>
            <button
              type="submit"
              form={formId}
              className={styles.send}
              aria-disabled={status === 'sending' ? true : undefined}
              data-cta-placement="bio_form_send"
            >
              {status === 'sending' ? 'Sending…' : CTA_LABEL}
              <span aria-hidden="true" className={styles.sendArrow}>
                <Arrow />
              </span>
            </button>
          </div>
        ) : !done ? (
          <nav className={styles.nav} aria-label="Questions">
            <span className={styles.counter} aria-hidden="true">
              {step + 1} of {QUESTIONS.length}
            </span>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => goTo(step - 1, 'back')}
              disabled={step === 0}
              aria-label="Previous question"
            >
              <Arrow direction="up" />
            </button>
            <button type="button" className={styles.navButton} onClick={() => advance(step)} aria-label="Next question">
              <Arrow direction="down" />
            </button>
          </nav>
        ) : null}
      </div>
    </dialog>
  );
}
