'use client';

import Arrow from '@/components/ui/Arrow';
import { openCallForm } from './events';
import { CTA_LABEL } from './vsl';

/**
 * Every "Book my call" on the page: opens the call request (CallForm) and
 * says so to assistive tech (aria-haspopup). `placement` names the button in
 * analytics (cta_click, via data-cta-placement, and call_form_open).
 */
export default function BookButton({
  placement,
  className,
  arrowClassName,
}: {
  placement: string;
  className?: string;
  arrowClassName?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      data-cta-placement={placement}
      onClick={(event) => openCallForm(placement, event.currentTarget)}
    >
      {CTA_LABEL}
      <span aria-hidden="true" className={arrowClassName}>
        <Arrow />
      </span>
    </button>
  );
}
