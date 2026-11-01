import { SERVICE_META, type EstimateService } from '@/lib/estimate';

/** The four service lines, in site order. */
export const SERVICE_KEYS = ['web', 'automation', 'tools', 'cloud'] as const satisfies readonly EstimateService[];

/** Canonical service names (SERVICE_META labels): never typed by hand. */
export const SERVICE_NAMES: readonly string[] = SERVICE_KEYS.map((key) => SERVICE_META[key].label);

/** "A, B, C and D". */
export function joinList(items: readonly string[]): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** "Web Development, Automation & AI, Custom Internal Tools and Cloud Engineering". */
export const SERVICE_LIST = joinList(SERVICE_NAMES);
