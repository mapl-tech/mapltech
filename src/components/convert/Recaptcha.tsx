'use client';

import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useAfterPress } from '@/components/company/useAfterPress';
import {
  CAPTCHA_MESSAGES,
  RECAPTCHA_ENABLED,
  RECAPTCHA_SITE_KEY,
  WIDGET_SIZE,
  loadRecaptcha,
  type RecaptchaApi,
  type WidgetSize,
  type WidgetTheme,
} from './recaptchaLoader';
import styles from './Recaptcha.module.scss';

/**
 * The "I'm not a robot" checkbox, one per form, placed just before the send
 * button (after the last field, so it is next in the Tab order).
 *
 * - Off without a site key: renders nothing, and `check()` lets every send
 *   through without a token, so the forms work as they did.
 * - Lazy: Google's script is requested on the visitor's first focus or press
 *   inside this form, never on load (recaptchaLoader.ts loads it once per page).
 *   The box opens then, with a loading line, and the widget renders into it
 *   once the script is ready and the box is on screen (the brief renders it
 *   on its last step).
 * - Never mid-press: the box opening, and its error line coming or going, wait
 *   for the pointer to lift (useAfterPress), as every field error on the site
 *   does, so a press on the send button below is never moved out from under
 *   the pointer and swallowed.
 * - Fits a phone: "compact" (164 px) when the form is narrower than the
 *   normal 304 px widget when it renders; a normal widget that later finds
 *   itself narrower (a rotated phone) is scaled down to fit.
 * - Theme: "light" on the paper sheet, "dark" on the dark cards.
 * - Errors: a send without a tick, or a tick that expired, says so under
 *   the widget, in the form's own error style (renderError), as an alert,
 *   and the group points at it with aria-describedby. A new refusal remounts
 *   the line, so the same words are announced again.
 * - Never a dead end: if the script cannot load (blocked, offline) the box
 *   stays closed, and if the widget reports an error (no connection, or a
 *   key Google refuses: it then says so inside the widget) the box can no
 *   longer be ticked; either way the form sends without a token. With the
 *   secret set the server refuses that send, and the form shows its own
 *   failure with its email fallback. The server is the gate, not this.
 */

type Phase = 'idle' | 'loading' | 'ready' | 'failed';

interface WidgetState {
  phase: Phase;
  api: RecaptchaApi | null;
  id: number | null;
  token: string;
  /** The widget reported an error (error-callback) and no tick has come since. */
  broken: boolean;
}

interface CaptchaNotice {
  message: string;
  /** Counts refusals, so a repeated message is a new node and is announced again. */
  n: number;
}

export type CaptchaCheck = { ok: true; token: string | undefined } | { ok: false };

export interface RecaptchaControl {
  enabled: boolean;
  notice: CaptchaNotice | null;
  /**
   * At send time: the token to send (undefined when reCAPTCHA is off or could
   * not load), or `ok: false` when the box is not ticked, which also shows
   * the message under the widget. Nothing should be sent then.
   */
  check: () => CaptchaCheck;
  /** After every send that reached the server: a token works once, so the box is cleared. */
  reset: () => void;
  /** Shared with <Recaptcha>. */
  stateRef: RefObject<WidgetState>;
  show: (message: string) => void;
}

export function useRecaptcha(): RecaptchaControl {
  const stateRef = useRef<WidgetState>({ phase: 'idle', api: null, id: null, token: '', broken: false });
  const [notice, setNotice] = useState<CaptchaNotice | null>(null);

  const show = useCallback((message: string) => {
    setNotice((current) => (message ? { message, n: (current?.n ?? 0) + 1 } : null));
  }, []);

  const check = useCallback((): CaptchaCheck => {
    if (!RECAPTCHA_ENABLED) return { ok: true, token: undefined };
    const state = stateRef.current;
    if (state.token) return { ok: true, token: state.token };
    // The check never loaded, or cannot be ticked: send anyway and let the server decide.
    if (state.phase === 'failed' || state.broken) return { ok: true, token: undefined };
    show(CAPTCHA_MESSAGES.missing);
    return { ok: false };
  }, [show]);

  const reset = useCallback(() => {
    const state = stateRef.current;
    state.token = '';
    if (state.api && state.id !== null) {
      try {
        state.api.reset(state.id);
      } catch {
        // The widget is already gone (the form gave way to its confirmation).
      }
    }
    setNotice(null);
  }, []);

  return useMemo(
    () => ({ enabled: RECAPTCHA_ENABLED, notice, check, reset, stateRef, show }),
    [notice, check, reset, show],
  );
}

interface RecaptchaProps {
  control: RecaptchaControl;
  /** "light" on the paper sheet, "dark" on the dark cards. */
  theme?: WidgetTheme;
  /** Kept in the form but not shown (the brief's steps before the last). */
  hidden?: boolean;
  className?: string;
  /** The form's own error line, given the id the widget's group points at. Keep role="alert". */
  renderError?: (id: string, message: string) => ReactNode;
}

export default function Recaptcha(props: RecaptchaProps) {
  return RECAPTCHA_ENABLED ? <RecaptchaWidget {...props} /> : null;
}

function defaultError(id: string, message: string) {
  return (
    <p id={id} className={styles.error} role="alert">
      {message}
    </p>
  );
}

function RecaptchaWidget({ control, theme = 'dark', hidden = false, className, renderError = defaultError }: RecaptchaProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const afterPress = useAfterPress();
  const { notice, stateRef, show } = control;

  // First focus or press inside this form: fetch the script now; open the box once the press is over.
  useEffect(() => {
    const form = boxRef.current?.closest('form');
    if (!form) return;
    const state = stateRef.current;
    let live = true;
    const move = (next: Phase, from?: Phase) =>
      afterPress(() => {
        if (!live || (from && state.phase !== from)) return;
        state.phase = next;
        setPhase(next);
      });
    const start = () => {
      form.removeEventListener('focusin', start, true);
      form.removeEventListener('pointerdown', start, true);
      move('loading', 'idle');
      loadRecaptcha().then(
        (api) => {
          state.api = api;
          move('ready');
        },
        () => {
          move('failed');
          // No box to tick any more, so no message asking for one.
          afterPress(() => show(''));
        },
      );
    };
    form.addEventListener('focusin', start, true);
    form.addEventListener('pointerdown', start, true);
    return () => {
      live = false;
      form.removeEventListener('focusin', start, true);
      form.removeEventListener('pointerdown', start, true);
      state.phase = 'idle';
      state.token = '';
      state.broken = false;
    };
  }, [afterPress, stateRef, show]);

  // Size the box to the room the form gives it, and render the widget once it is ready and shown.
  useEffect(() => {
    if (phase !== 'loading' && phase !== 'ready') return;
    const frame = frameRef.current;
    const slot = slotRef.current;
    if (!frame || !slot) return;
    const state = stateRef.current;
    let host: HTMLDivElement | null = null;
    let size: WidgetSize | null = null;

    const fit = (width: number) => {
      if (!width) return; // not shown yet
      if (!host) size = width < WIDGET_SIZE.normal.width ? 'compact' : 'normal';
      if (!size) return;
      frame.dataset.size = size;
      const scale = Math.min(1, width / WIDGET_SIZE[size].width);
      if (scale < 1) frame.style.setProperty('--captcha-scale', scale.toFixed(4));
      else frame.style.removeProperty('--captcha-scale');
      if (phase !== 'ready' || !state.api || host) return;
      host = document.createElement('div');
      slot.appendChild(host);
      try {
        state.id = state.api.render(host, {
          sitekey: RECAPTCHA_SITE_KEY,
          theme,
          size,
          callback: (token) => {
            state.token = token;
            state.broken = false;
            afterPress(() => show(''));
          },
          'expired-callback': () => {
            state.token = '';
            afterPress(() => show(CAPTCHA_MESSAGES.expired));
          },
          // The widget shows its own words for this; the next send goes without a token.
          'error-callback': () => {
            state.token = '';
            state.broken = true;
            afterPress(() => show(''));
          },
        });
      } catch {
        // Could not render (a bad key or a broken script): send without it, as if it never loaded.
        state.phase = 'failed';
        afterPress(() => {
          setPhase('failed');
          show('');
        });
      }
    };

    const observer = new ResizeObserver((entries) => fit(entries[0]?.contentRect.width ?? 0));
    observer.observe(frame);
    return () => {
      observer.disconnect();
      if (host) {
        host.remove();
        state.id = null;
        state.token = '';
        state.broken = false;
      }
    };
  }, [phase, theme, stateRef, show, afterPress]);

  const open = phase === 'loading' || phase === 'ready';

  return (
    <div
      ref={boxRef}
      className={[styles.box, className].filter(Boolean).join(' ')}
      hidden={hidden || (!open && !notice)}
      role={open ? 'group' : undefined}
      aria-label={open ? 'Spam check' : undefined}
      aria-describedby={notice ? errorId : undefined}
      data-captcha=""
    >
      <div ref={frameRef} className={styles.frame} hidden={!open}>
        {/* Google's widget goes in here; React renders nothing inside it. */}
        <div ref={slotRef} className={styles.slot} />
        {phase === 'loading' ? (
          <p className={styles.loading} aria-hidden="true">
            Loading the “I’m not a robot” check…
          </p>
        ) : null}
      </div>
      {notice ? <Fragment key={notice.n}>{renderError(errorId, notice.message)}</Fragment> : null}
    </div>
  );
}
