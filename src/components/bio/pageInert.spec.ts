import { describe, expect, it } from 'vitest';
import { RECAPTCHA_FRAME, imageCheckUp, inertOutside, isRecaptchaLayer, type InertTarget } from './pageInert';

/**
 * A stand-in for a child of <body>: its tag, its attributes and whether it
 * holds one of Google's reCAPTCHA frames. matches() understands the selector
 * lists pageInert uses (tag names and [attribute] selectors).
 */
class Node implements InertTarget {
  attrs = new Map<string, string>();
  style: { visibility?: string } = {};

  constructor(
    readonly tag: string,
    attrs: Record<string, string> = {},
    readonly holdsRecaptcha = false,
  ) {
    for (const [k, v] of Object.entries(attrs)) this.attrs.set(k, v);
  }

  matches(selector: string): boolean {
    return selector.split(',').some((part) => {
      const s = part.trim();
      const attr = /^\[([\w-]+)\]$/.exec(s);
      return attr ? this.attrs.has(attr[1]) : s === this.tag;
    });
  }

  querySelector(selector: string): unknown {
    return selector === RECAPTCHA_FRAME && this.holdsRecaptcha ? {} : null;
  }

  setAttribute(name: string, value: string): void {
    this.attrs.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attrs.delete(name);
  }

  get inert(): boolean {
    return this.attrs.has('inert');
  }
}

/** The bio page's <body> while the call request is open, in document order. */
function page() {
  const skip = new Node('a');
  const header = new Node('header');
  const main = new Node('main');
  const footer = new Node('footer');
  // Hidden at the top of the page: inert by its own choice (StickyBar.tsx).
  const stickyBar = new Node('div', { inert: '', 'data-own-inert': '' });
  const dialog = new Node('dialog', { open: '' });
  const script = new Node('script');
  const announcer = new Node('next-route-announcer');
  // Google's image check from an earlier opening of the form.
  const recaptcha = new Node('div', {}, true);
  return { skip, header, main, footer, stickyBar, dialog, script, announcer, recaptcha, all: [skip, header, main, footer, stickyBar, dialog, script, announcer, recaptcha] };
}

describe('the page behind the open call request', () => {
  it('goes inert: everything but the form, Google’s image check, and what owns or already has its inert', () => {
    const p = page();
    inertOutside(p.dialog, p.all);
    expect([p.skip, p.header, p.main, p.footer, p.announcer].every((n) => n.inert)).toBe(true);
    expect(p.dialog.inert).toBe(false);
    expect(p.recaptcha.inert).toBe(false);
    expect(p.script.inert).toBe(false);
    expect(p.stickyBar.inert).toBe(true); // untouched: it was inert already, by its own choice
  });

  it('never touches an element that owns its inert attribute, even when that element is not inert', () => {
    const p = page();
    p.stickyBar.removeAttribute('inert'); // the bar is showing
    const restore = inertOutside(p.dialog, p.all);
    expect(p.stickyBar.inert).toBe(false);
    p.stickyBar.setAttribute('inert', ''); // the bar hides itself while the form is open
    restore();
    expect(p.stickyBar.inert).toBe(true); // closing the form does not hand a hidden bar its tab stop back
  });

  it('gives back exactly what it changed, and nothing else', () => {
    const p = page();
    const before = p.all.map((n) => n.inert);
    const restore = inertOutside(p.dialog, p.all);
    restore();
    expect(p.all.map((n) => n.inert)).toEqual(before);
  });

  it('leaves Google’s image check alone when it arrives after the form opened', () => {
    const p = page();
    const restore = inertOutside(p.dialog, p.all);
    const late = new Node('div', {}, true);
    restore();
    expect(late.inert).toBe(false);
    expect(isRecaptchaLayer(late)).toBe(true);
  });
});

describe('Google’s image check, up or not', () => {
  it('is up only when one of Google’s layers is set visible', () => {
    const p = page();
    expect(imageCheckUp(p.all)).toBe(false);
    p.recaptcha.style.visibility = 'visible';
    expect(imageCheckUp(p.all)).toBe(true);
    p.recaptcha.style.visibility = 'hidden';
    expect(imageCheckUp(p.all)).toBe(false);
  });

  it('ignores a visible element that is not Google’s', () => {
    const p = page();
    p.main.style.visibility = 'visible';
    expect(imageCheckUp(p.all)).toBe(false);
  });
});
