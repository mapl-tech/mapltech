'use client';

import type { Attribution, VideoWatch } from './questions';

/**
 * What the bio page's client parts share: one event opens the call request
 * from any button, analytics go to GA4 through the gtag the root layout
 * defines, and two small session records (where the visitor came from, how
 * much of the video they watched) ride along with the request. Storage can
 * be blocked (private windows, strict settings): every read and write is
 * guarded, and the page works without it.
 */

export const OPEN_EVENT = 'bio:open-call-form';

export interface OpenDetail {
  /** Which button opened it (analytics). */
  placement: string;
  /**
   * The button itself, where focus goes back when the form closes. Safari does
   * not focus a button on click or tap, so the focused element cannot say.
   */
  opener?: HTMLElement;
}

export function openCallForm(placement: string, opener?: HTMLElement): void {
  window.dispatchEvent(new CustomEvent<OpenDetail>(OPEN_EVENT, { detail: { placement, opener } }));
}

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void;

/** One GA4 event. Never personal data: answers, names and emails stay out. */
export function track(name: string, params: Record<string, unknown> = {}): void {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === 'function') gtag('event', name, { page_location_group: 'bio', ...params });
}

function read<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked or full: the form still sends, without the extra context.
  }
}

const ATTRIBUTION_KEY = 'mapltech:bio:attribution:v1';
const WATCH_KEY = 'mapltech:bio:watch:v1';
export const DRAFT_KEY = 'mapltech:bio:draft:v1';

export const readAttribution = () => read<Attribution>(ATTRIBUTION_KEY);
export const writeAttribution = (value: Attribution) => write(ATTRIBUTION_KEY, value);

export const readWatch = () => read<VideoWatch>(WATCH_KEY);
export function writeWatch(value: VideoWatch): void {
  const before = readWatch();
  // Keep the furthest point and whether the sound was ever on, across replays.
  write(WATCH_KEY, {
    furthest: Math.max(before?.furthest ?? 0, value.furthest),
    withSound: Boolean(before?.withSound || value.withSound),
  });
}

export const readDraft = <T>() => read<T>(DRAFT_KEY);
export const writeDraft = (value: unknown) => write(DRAFT_KEY, value);
