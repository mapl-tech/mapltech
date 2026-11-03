'use client';

import { useSyncExternalStore } from 'react';

/**
 * The visitor's "Pause motion" choice (WCAG 2.2.2), shared by everything on
 * the page that moves on its own: the hero's scene and the client logo loop.
 * Pausing one pauses all, and the choice is remembered across visits and tabs.
 *
 * Server and hydration renders read "not paused", so SSR HTML never depends on
 * storage; the client re-renders once with the stored choice.
 */

const KEY = 'mapl:motion-paused';
const EVENT = 'mapl:motion-paused';

// Read once, then kept here: with blocked storage the choice still holds for this visit.
let paused: boolean | null = null;

function current(): boolean {
  if (paused === null) {
    try {
      paused = window.localStorage.getItem(KEY) === '1';
    } catch {
      paused = false;
    }
  }
  return paused;
}

export function setMotionPaused(next: boolean) {
  paused = next;
  try {
    window.localStorage.setItem(KEY, next ? '1' : '0');
  } catch {
    // Private mode or blocked storage: the choice holds until the page closes.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    paused = event.newValue === '1';
    onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribe, current, () => false);
}
