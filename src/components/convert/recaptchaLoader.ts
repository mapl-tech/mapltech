/**
 * Google reCAPTCHA v2 ("I'm not a robot" checkbox), explicit render. Shared by
 * every form that posts to /api/contact. Nothing here runs until a visitor
 * interacts with a form (see Recaptcha.tsx): the script is never requested on
 * page load, so Lighthouse (which does not interact) never sees Google's
 * script or cookies. One script per page however many forms render a widget.
 *
 * With no NEXT_PUBLIC_RECAPTCHA_SITE_KEY (inlined at build time) the whole
 * thing is off: no widget, no script, the forms send without a token.
 */

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';
export const RECAPTCHA_ENABLED = RECAPTCHA_SITE_KEY !== '';

/** The widget's own box sizes, from Google: "normal" 304 x 78, "compact" 164 x 144. */
export const WIDGET_SIZE = {
  normal: { width: 304, height: 78 },
  compact: { width: 164, height: 144 },
} as const;

export type WidgetSize = keyof typeof WIDGET_SIZE;
export type WidgetTheme = 'light' | 'dark';

/** The words the forms show under the widget. */
export const CAPTCHA_MESSAGES = {
  missing: 'Tick “I’m not a robot”, then send again.',
  expired: 'The “I’m not a robot” check timed out. Tick it again, then send.',
} as const;

export interface RecaptchaRenderParams {
  sitekey: string;
  theme?: WidgetTheme;
  size?: WidgetSize;
  tabindex?: number;
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
}

export interface RecaptchaApi {
  render: (container: HTMLElement, params: RecaptchaRenderParams) => number;
  reset: (widgetId?: number) => void;
  getResponse: (widgetId?: number) => string;
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

const ONLOAD = '__maplRecaptchaReady';
// English to match the page (lang="en") and the messages above, which name the box's label.
const SCRIPT_SRC = `https://www.google.com/recaptcha/api.js?onload=${ONLOAD}&render=explicit&hl=en`;
// api.js loads a second script before it calls back; if that one is blocked the
// callback never comes, and the form must not wait on it for ever.
const LOAD_TIMEOUT = 12000;

let loader: Promise<RecaptchaApi> | null = null;

/**
 * Loads Google's script once per page and resolves with the API when it is
 * ready to render. Rejects if it cannot load (blocked, offline, timed out); the
 * forms then send without a token and the server decides.
 */
export function loadRecaptcha(): Promise<RecaptchaApi> {
  if (loader) return loader;
  loader = new Promise<RecaptchaApi>((resolve, reject) => {
    const scope = window as unknown as Record<string, unknown>;
    if (window.grecaptcha?.render) {
      resolve(window.grecaptcha);
      return;
    }
    const timer = window.setTimeout(() => reject(new Error('reCAPTCHA timed out')), LOAD_TIMEOUT);
    scope[ONLOAD] = () => {
      window.clearTimeout(timer);
      delete scope[ONLOAD];
      if (window.grecaptcha?.render) resolve(window.grecaptcha);
      else reject(new Error('reCAPTCHA did not start'));
    };
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error('reCAPTCHA did not load'));
    };
    document.head.appendChild(script);
  });
  return loader;
}
