'use client';

import { useSyncExternalStore } from 'react';

/**
 * Media-query subscriptions without setState-in-effect.
 *
 * Server and hydration renders return `serverValue`, so SSR HTML never depends
 * on device capability; the client re-renders once with the real match.
 */

const lists = new Map<string, MediaQueryList>();
const subscribers = new Map<string, (onChange: () => void) => () => void>();

function getList(query: string): MediaQueryList {
  let list = lists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    lists.set(query, list);
  }
  return list;
}

function getSubscribe(query: string) {
  let subscribe = subscribers.get(query);
  if (!subscribe) {
    subscribe = (onChange) => {
      const list = getList(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    };
    subscribers.set(query, subscribe);
  }
  return subscribe;
}

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    getSubscribe(query),
    () => getList(query).matches,
    () => serverValue,
  );
}

export const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** True on mouse/trackpad devices that can hover. False on SSR and touch. */
export function useFinePointer(): boolean {
  return useMediaQuery(FINE_POINTER_QUERY);
}

/** True when the OS asks for reduced motion. False on SSR. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}

const subscribeNoop = () => () => {};

/** False during SSR and the hydration render, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
