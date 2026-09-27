/**
 * Types + the filter-key guard shared by the server data module and the
 * client island. No config imports, so the island's bundle stays small.
 */
import type { EstimateService } from '@/lib/estimate';

export type WorkFilterKey = 'all' | EstimateService;

export const FILTER_KEYS: readonly WorkFilterKey[] = ['all', 'web', 'automation', 'tools', 'cloud'];

export function isWorkFilterKey(value: unknown): value is WorkFilterKey {
  return typeof value === 'string' && (FILTER_KEYS as readonly string[]).includes(value);
}

/** Serialisable row for the client island (no functions, no config objects). */
export interface WorkEntry {
  slug: string;
  path: string;
  /** 1-based display number. */
  index: number;
  title: string;
  description: string;
  category: string;
  service: EstimateService;
  /** Short line label from the estimator meta, e.g. "Automation & AI". */
  serviceLabel: string;
  year?: string;
  image: string;
  /** Live client URL when one is published. */
  url?: string;
  /** Hostname of `url`, e.g. "lrostaffing.com". */
  host?: string;
  isLab: boolean;
  tags: string[];
}

export interface WorkFilter {
  key: WorkFilterKey;
  label: string;
  count: number;
}

export interface WorkflowStep {
  id: string;
  title: string;
  text: string;
}
