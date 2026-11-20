/**
 * The page behind the open call request, out of reach. CallForm opens its
 * <dialog> with show(), not showModal(): a modal dialog sits in the top layer
 * and makes everything outside it inert, and Google appends its reCAPTCHA
 * image check to <body>, outside the dialog, so a visitor Google challenged
 * could neither see nor answer it, and could never send (measured Nov 20,
 * 2026). What the modal did for the page is done here instead.
 *
 * Works on the few element methods it needs (InertTarget), so pageInert.spec.ts
 * can check the rules in plain Node.
 */

/** The parts of an element used here: a DOM Element in the page, a stand-in in tests. */
export interface InertTarget {
  matches(selector: string): boolean;
  querySelector(selector: string): unknown;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

/** One of Google's reCAPTCHA frames: the checkbox, or the image check Google appends to <body>. */
export const RECAPTCHA_FRAME = 'iframe[src*="/recaptcha/"]';

/**
 * Never made inert here: what is not drawn, what is inert already (left as it
 * is, and so never "given back"), and an element that owns its inert attribute
 * (data-own-inert: the phone's sticky bar, hidden while the form is open).
 */
const LEAVE = 'script, style, link, template, [inert], [data-own-inert]';

/** A child of <body> holding one of Google's reCAPTCHA frames. */
export const isRecaptchaLayer = (el: Pick<InertTarget, 'querySelector'>): boolean => el.querySelector(RECAPTCHA_FRAME) !== null;

/**
 * Makes every element of `siblings` inert except `keep` (the open dialog),
 * Google's reCAPTCHA layers and the elements LEAVE names. Returns the function
 * that gives back exactly what it changed, and nothing else.
 */
export function inertOutside<T extends InertTarget>(keep: T, siblings: Iterable<T>): () => void {
  const changed: T[] = [];
  for (const el of siblings) {
    if (el === keep || el.matches(LEAVE) || isRecaptchaLayer(el)) continue;
    el.setAttribute('inert', '');
    changed.push(el);
  }
  return () => {
    for (const el of changed) el.removeAttribute('inert');
  };
}

/**
 * Whether Google's image check is up: one of its layers among `siblings` is
 * set visible (Google sets the inline style at once and fades it, so the
 * inline value, not the computed one, says what it is turning into).
 */
export function imageCheckUp(siblings: Iterable<InertTarget & { style?: { visibility?: string } }>): boolean {
  for (const el of siblings) {
    if (isRecaptchaLayer(el) && el.style?.visibility === 'visible') return true;
  }
  return false;
}
