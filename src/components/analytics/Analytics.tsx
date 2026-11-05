'use client';

import { useEffect, useRef } from 'react';

/**
 * Sends what the site does to Google Analytics 4 (Nov 5, 2026: "are you sure
 * analytics and tracking is all set up perfectly?"). The gtag bootstrap in the
 * root layout defines window.gtag as soon as the page is interactive; gtag.js
 * itself still loads lazily, and GA reads the queued commands when it arrives.
 *
 * Page views are GA's own: the property's enhanced measurement counts each
 * client-side navigation (checked on the live site, Nov 5, 2026), so this
 * component sends none, or every page would count twice.
 *
 * - cta_click for every element marked data-cta-placement (the site's asks),
 *   with the placement, the link and its text; the MagneticButton and the
 *   phone bar also announce `cta_click` on window, counted once.
 * - contact_click for phone and email links.
 * - generate_lead when a form is sent (a `lead` event on window from the
 *   forms, with the form's name only: never personal data).
 */

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void;

function send(name: string, params: Record<string, unknown>) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === 'function') gtag('event', name, params);
}

function linkText(el: Element): string {
  const text = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
  return text.slice(0, 100);
}

export default function Analytics() {
  // The last click this listener counted, so a window `cta_click` from the same click is not counted again.
  const lastCta = useRef<{ placement: string; at: number } | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const target = event.target as Element | null;
      if (!target) return;

      const contact = target.closest('a[href^="tel:"], a[href^="mailto:"]');
      if (contact) {
        const href = contact.getAttribute('href') ?? '';
        send('contact_click', { method: href.startsWith('tel:') ? 'phone' : 'email', link_text: linkText(contact) });
      }

      const cta = target.closest('[data-cta-placement]');
      if (cta) {
        const placement = cta.getAttribute('data-cta-placement') ?? '';
        const link = cta.closest('a') ?? cta.querySelector('a');
        send('cta_click', {
          placement,
          link_url: link?.getAttribute('href') ?? undefined,
          link_text: linkText(link ?? cta),
        });
        lastCta.current = { placement, at: Date.now() };
      }
    };

    const onCtaEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ placement?: string; href?: string; action?: string }>).detail ?? {};
      const placement = detail.placement ?? '';
      // The same click already counted by the listener above (an element marked data-cta-placement).
      if (lastCta.current && Date.now() - lastCta.current.at < 1000) return;
      send('cta_click', { placement, link_url: detail.href, action: detail.action });
    };

    const onLead = (event: Event) => {
      const form = (event as CustomEvent<{ form?: string }>).detail?.form ?? 'unknown';
      send('generate_lead', { form_name: form });
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('cta_click', onCtaEvent);
    window.addEventListener('lead', onLead);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('cta_click', onCtaEvent);
      window.removeEventListener('lead', onLead);
    };
  }, []);

  return null;
}
