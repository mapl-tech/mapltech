/**
 * The service a visitor picked in the referral calculator, shared with the
 * referral form so it can echo the choice back (commitment and consistency):
 * the form's "What do they need?" field starts from it until the visitor
 * changes it. Null until the calculator is actually used, so nothing is ever
 * pre-chosen for someone who did not choose it.
 */
import { useSyncExternalStore } from 'react';
import type { EstimateService } from '@/lib/estimate';

let choice: EstimateService | null = null;
const listeners = new Set<() => void>();

export function setReferralChoice(next: EstimateService): void {
  if (choice === next) return;
  choice = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useReferralChoice(): EstimateService | null {
  return useSyncExternalStore(
    subscribe,
    () => choice,
    () => null,
  );
}
