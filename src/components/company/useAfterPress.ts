'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Runs a field's blur check once the press that moved focus away is over
 * (the brief's and the referral form's rule, for the careers forms). Focus
 * leaves a field as a press goes down; an error line added or removed under
 * it right then would move the next target, most often the send button, out
 * from under the pointer or finger, and the press would be swallowed. So
 * while a pointer is down the check waits for it to lift and runs after the
 * press's click has landed. A tap's blur comes in the middle of its own
 * click, after the finger has lifted, so with no pointer down the check
 * still waits one task.
 */
export function useAfterPress(): (check: () => void) => void {
  const pointerDown = useRef(false);
  const pending = useRef<(() => void)[]>([]);

  useEffect(() => {
    const down = () => {
      pointerDown.current = true;
    };
    const up = () => {
      window.setTimeout(() => {
        pointerDown.current = false;
        const run = pending.current;
        pending.current = [];
        for (const check of run) check();
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

  return useCallback((check: () => void) => {
    if (pointerDown.current) pending.current.push(check);
    else window.setTimeout(check, 0);
  }, []);
}
