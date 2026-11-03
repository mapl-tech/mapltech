import Link from 'next/link';
import ed from './Company.module.scss';

export interface HeroAction {
  label: string;
  href: string;
  /** `<page>_<slot>`, stamped as data-cta-placement. */
  placement: string;
  /**
   * What the phone action bar offers instead of repeating this action, where
   * the page has moved on from it (careers: "Apply", to the form).
   */
  bar?: { label: string; href: string };
}

function ActionLink({ action, className, hero }: { action: HeroAction; className: string; hero?: boolean }) {
  const content = (
    <>
      {action.label}
      {hero ? (
        <span aria-hidden="true" className={ed.arrow}>
          →
        </span>
      ) : null}
    </>
  );
  const props = {
    className,
    'data-cta-placement': action.placement,
    'data-hero-cta': hero ? '' : undefined,
    'data-bar-label': hero ? action.bar?.label : undefined,
    'data-bar-href': hero ? action.bar?.href : undefined,
  };
  // Same-page fragments stay plain anchors: SmoothScroll lands them below the
  // header and moves focus. Routes go through next/link.
  return action.href.startsWith('#') ? (
    <a href={action.href} {...props}>
      {content}
    </a>
  ) : (
    <Link href={action.href} {...props}>
      {content}
    </Link>
  );
}

/**
 * The two hero actions handed to PageHeader: one filled ask, marked
 * `data-hero-cta` (the phone action bar repeats its label and target, or the
 * primary's `bar` override, and the header button quiets while it is on
 * screen), and one quiet text link.
 */
export default function HeroActions({ primary, secondary }: { primary: HeroAction; secondary?: HeroAction }) {
  return (
    <>
      <ActionLink action={primary} className={ed.primary} hero />
      {secondary ? <ActionLink action={secondary} className={ed.secondary} /> : null}
    </>
  );
}
