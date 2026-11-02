import Link from 'next/link';
import ed from './Company.module.scss';

export interface HeroAction {
  label: string;
  href: string;
  /** `<page>_<slot>`, stamped as data-cta-placement. */
  placement: string;
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
 * `data-hero-cta` (the phone action bar repeats its label and target, and the
 * header button quiets while it is on screen), and one quiet text link.
 */
export default function HeroActions({ primary, secondary }: { primary: HeroAction; secondary?: HeroAction }) {
  return (
    <>
      <ActionLink action={primary} className={ed.primary} hero />
      {secondary ? <ActionLink action={secondary} className={ed.secondary} /> : null}
    </>
  );
}
