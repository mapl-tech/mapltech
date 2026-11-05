/**
 * One browser event per successful send, for analytics: the listener in
 * src/components/analytics/ forwards it to Google Analytics as generate_lead.
 * Fired only once the server has answered OK; never on a refused check, a
 * reCAPTCHA refusal, a server error or a honeypot catch. The detail names the
 * form and nothing else: no names, emails or messages.
 */

export type LeadForm =
  | 'project_brief'
  | 'referral'
  | 'careers_application'
  | 'talent_list'
  | 'estimate_email'
  | 'contact_form'
  | 'newsletter'
  | 'regional_inquiry_nigeria'
  | 'regional_inquiry_jamaica';

export interface LeadDetail {
  form: LeadForm;
}

export function announceLead(form: LeadForm): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<LeadDetail>('lead', { detail: { form } }));
}
