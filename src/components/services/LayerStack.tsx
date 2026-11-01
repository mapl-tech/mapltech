import type { CSSProperties } from 'react';
import Link from 'next/link';
import type { EstimateService } from '@/lib/estimate';
import { LAYER_VIEWS } from './serviceContent';
import styles from './LayerStack.module.scss';

/**
 * The services family's signature: the four layers of one build as a live
 * system diagram. Four product panels (a website, an automation flow, an
 * internal tool, cloud infrastructure) stacked in depth, and one red request
 * path that runs from the visitor through every layer. On a service page its
 * own panel is lit and pulled forward.
 *
 * It is real navigation: every panel is a link carrying its name and its
 * public "from" price in HTML. The index links to its own bands, service
 * pages link to each other, the current page is `aria-current="page"`. The
 * path, window chrome and glyphs are decoration, hidden from assistive tech.
 * CSS only: the request runs once on load, and not at all under reduced motion.
 */
export default function LayerStack({
  current,
  linkTo = 'page',
  label,
  className,
}: {
  /** The lit panel (service pages). Omit on the index. */
  current?: EstimateService;
  /** Panels link to the service pages, or to the index's own bands. */
  linkTo?: 'page' | 'anchor';
  /** Accessible name of the navigation landmark. */
  label: string;
  className?: string;
}) {
  return (
    <nav className={`${styles.system} ${className ?? ''}`.trim()} aria-label={label}>
      <div className={styles.card}>
        <p className={styles.head} aria-hidden="true">
          <span className={styles.headPath}>Request path</span>
          <span>One team, four layers</span>
        </p>
        <ol className={styles.stack} role="list">
          {LAYER_VIEWS.map((layer, i) => {
            const isCurrent = layer.service === current;
            return (
              <li
                key={layer.service}
                className={styles.layer}
                data-current={isCurrent ? '' : undefined}
                style={{ '--i': i } as CSSProperties}
              >
                <span className={styles.frame} aria-hidden="true" />
                <span className={styles.hop} aria-hidden="true" />
                <Link
                  href={linkTo === 'anchor' ? `#layer-${layer.service}` : layer.path}
                  className={styles.window}
                  aria-current={isCurrent ? 'page' : undefined}
                  data-cta-placement={`services_stack_${layer.service}`}
                >
                  <span className={styles.bar}>
                    <span className={styles.dots} aria-hidden="true" />
                    <span className={styles.role}>
                      {layer.role}
                      <span className="visually-hidden">: </span>
                    </span>
                  </span>
                  <Glyph service={layer.service} />
                  <span className={styles.name}>
                    {layer.name}
                    <span className="visually-hidden">, </span>
                  </span>
                  <span className={styles.price}>{layer.fromLabel}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
      <span className={styles.structure} aria-hidden="true" />
    </nav>
  );
}

/** One hairline glyph per layer: a page, a flow, a table, a pair of servers. Icons, not screenshots. */
function Glyph({ service }: { service: EstimateService }) {
  const common = {
    className: styles.glyph,
    viewBox: '0 0 44 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  };
  switch (service) {
    case 'web':
      return (
        <svg {...common}>
          <rect x="1" y="1" width="42" height="30" rx="4" />
          <path d="M1 8h42M7 14h20M7 19h14" />
          <rect x="7" y="23" width="11" height="4" rx="2" />
        </svg>
      );
    case 'automation':
      return (
        <svg {...common}>
          <circle cx="7" cy="16" r="4" />
          <circle cx="22" cy="7" r="4" />
          <circle cx="22" cy="25" r="4" />
          <circle cx="37" cy="16" r="4" />
          <path d="M10.5 14l8-5M10.5 18l8 5M25.5 9l8 5M25.5 23l8-5" />
        </svg>
      );
    case 'tools':
      return (
        <svg {...common}>
          <rect x="1" y="1" width="42" height="30" rx="4" />
          <path d="M1 10h42M1 18h42M1 25h42M15 10v21" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="3" y="2" width="38" height="12" rx="3" />
          <rect x="3" y="18" width="38" height="12" rx="3" />
          <path d="M16 8h18M16 24h18" />
          <circle cx="9" cy="8" r="1.4" />
          <circle cx="9" cy="24" r="1.4" />
        </svg>
      );
  }
}
