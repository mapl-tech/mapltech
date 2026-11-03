import type { BlogCategory } from '@/data/blog-posts';
import { SERVICE_META, type EstimateService } from '@/lib/estimate';
import { getServiceLine, startingPrice, type ServiceSlug } from '@/lib/schema';
import { categoryService } from '@/components/convert/blog-utils';

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

/**
 * The name a blog topic is shown under: the canonical service name when the
 * category is one of the four service lines ("Internal Tools" reads "Custom
 * Internal Tools"), the category itself otherwise ("Industry"). Topic slugs
 * and URLs keep coming from the category (topicSlug), so links do not change.
 * Server-side only: the archive island receives the finished labels.
 */
export function topicLabel(category: BlogCategory): string {
  const service = categoryService(category);
  return service ? SERVICE_META[service].label : category;
}

/** A service line's public "from" price, "$5,000" (site.ts `pricing` via schema.ts). */
export function serviceFrom(service: EstimateService): string | undefined {
  return startingPrice(getServiceLine(SERVICE_META[service].slug as ServiceSlug));
}

export interface ServiceLink {
  /** Canonical service name. */
  name: string;
  /** The service page. */
  href: string;
  /** Public "from" price, "$5,000". */
  from: string;
}

/**
 * The four service lines in site order, each with its page and public "from"
 * price: the blog archive's line for the views without a service of their own
 * (All, Industry). Server-side only, like topicLabel().
 */
export function serviceLinks(): ServiceLink[] {
  return SERVICE_KEYS.flatMap((key) => {
    const from = serviceFrom(key);
    return from ? [{ name: SERVICE_META[key].label, href: SERVICE_META[key].path, from }] : [];
  });
}
