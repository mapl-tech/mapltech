import type { LeadForm } from '@/components/convert/lead';
import { USER_AGENT } from './email';

/**
 * Every form entry also goes to HubSpot, as a submission to that form's own
 * form there (Marketing > Forms). So each form's entries stay separate: HubSpot
 * lists every form's submissions on their own, and a contact's timeline names
 * the form each entry came through.
 *
 * HubSpot makes the contact from the submission, or updates the one with that
 * email, with the name and phone as typed. Every other answer goes in the
 * submission's Message field. The forms set no lifecycle stage: on MAPL TECH's
 * HubSpot plan the Forms API refuses one (Nov 23 2026), so a new contact gets
 * HubSpot's default and an existing one keeps its own.
 *
 * HUBSPOT_ACCESS_TOKEN is a HubSpot service key (Settings > Integrations >
 * Service Keys) with the `forms` scope. scripts/hubspot-forms.mjs made the
 * forms in HubSpot and printed HUBSPOT_FORMS.
 *
 * It never throws. A failure comes back as `problem`, and the inbox email says
 * so (emailTemplates.ts), so the team knows to add the entry by hand.
 */

/** HubSpot's endpoint for a form submission sent with a key. */
export const HUBSPOT_SUBMIT_URL = 'https://api.hsforms.com/submissions/v3/integration/secure/submit';

/** MAPL TECH's HubSpot account. */
export const HUBSPOT_ACCOUNT_ID = '343942649';

/** The site's forms that send to HubSpot: every form lead.ts names, except the unused contact_form. */
export type HubSpotForm = Exclude<LeadForm, 'contact_form'>;

/** Each form's own form in HubSpot: its ID, and its name in Marketing > Forms. */
export const HUBSPOT_FORMS: Record<HubSpotForm, { id: string; name: string }> = {
  project_brief: { id: 'e2080ddc-20dc-4197-af82-a0582663b972', name: 'Website: Project brief' },
  referral: { id: '590003b0-fd8b-467f-bc00-3ff944ae4bc5', name: 'Website: Referral' },
  estimate_email: { id: 'cd067349-c563-4945-b805-7bf065e04f35', name: 'Website: Estimate email' },
  regional_inquiry_nigeria: { id: '3df8b14d-3fb8-4693-a631-4434e6eb997d', name: 'Website: Nigeria inquiry' },
  regional_inquiry_jamaica: { id: '1d406c8c-a5ce-4af9-adcb-210dfcb1b74e', name: 'Website: Jamaica inquiry' },
  bio_call_request: { id: '6804778c-e961-49bb-bfb4-61a41a373058', name: 'bio.mapltech.com: Call request' },
  careers_application: { id: '7b8530cc-b548-47bc-954d-3a1121e1e7af', name: 'Careers: Job application' },
  talent_list: { id: 'd04f3260-db12-4e87-8a24-2703c562810b', name: 'Careers: Talent list' },
  newsletter: { id: 'a5e459e9-898d-42de-a1a8-903030acbcd1', name: 'Website: Newsletter' },
};

/** HubSpot's ID for contacts: every field a submission sends is a contact property. */
const CONTACT = '0-1';

/** The time HubSpot has to take an entry. The email waits for it, and the function has to answer the form. */
const TIMEOUT_MS = 4000;

export interface CrmEntry {
  form: HubSpotForm;
  email: string;
  /** The name as typed: the first word is the first name and the rest is the last name. */
  name?: string;
  phone?: string;
  /** The entry's answers, as the email lists them. */
  rows: { label: string; value: string }[];
}

export type CrmResult = { ok: true } | { ok: false; problem: string };

/** The answers with a field of their own in HubSpot, so the message leaves them out. */
const OWN_FIELDS = new Set(['Name', 'Email', 'Phone']);

/**
 * The submission's Message field: every other answer, one per line. A
 * multi-line answer starts under its label, after a blank line.
 */
export function messageText(rows: CrmEntry['rows']): string {
  return rows
    .filter(({ label }) => !OWN_FIELDS.has(label))
    .map(({ label, value }) => (value.includes('\n') ? `\n${label}:\n${value}` : `${label}: ${value}`))
    .join('\n')
    .trim();
}

/** The submission's fields: the email lowercased, the name split, the phone and the message. Empty ones are left out. */
export function submissionFields({ email, name, phone, rows }: Omit<CrmEntry, 'form'>): { objectTypeId: string; name: string; value: string }[] {
  const [firstname = '', ...rest] = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const values: Record<string, string> = {
    email: email.trim().toLowerCase(),
    firstname,
    lastname: rest.join(' '),
    phone: phone?.trim() ?? '',
    message: messageText(rows),
  };
  return Object.entries(values)
    .filter(([, value]) => value)
    .map(([field, value]) => ({ objectTypeId: CONTACT, name: field, value }));
}

interface Refusal {
  message?: unknown;
  errors?: { message?: unknown }[];
}

/** HubSpot's words for a refusal (the first error it lists), short enough for a log line and the email. */
function refusal(status: number, answer: Refusal): string {
  const first = Array.isArray(answer.errors) ? answer.errors[0]?.message : undefined;
  const words = (typeof first === 'string' ? first : typeof answer.message === 'string' ? answer.message : '').trim().replace(/\.+$/, '');
  return `HubSpot refused the entry (${status}${words ? `: ${words.slice(0, 160)}` : ''})`;
}

/** Sends one entry to its form's own form in HubSpot. */
export async function recordInHubSpot(entry: CrmEntry, token: string | undefined = process.env.HUBSPOT_ACCESS_TOKEN): Promise<CrmResult> {
  if (!token) {
    console.error('HubSpot: HUBSPOT_ACCESS_TOKEN is not set, so the entry was not saved.');
    return { ok: false, problem: 'HUBSPOT_ACCESS_TOKEN is not set on this server' };
  }
  try {
    const res = await fetch(`${HUBSPOT_SUBMIT_URL}/${HUBSPOT_ACCOUNT_ID}/${HUBSPOT_FORMS[entry.form].id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
      body: JSON.stringify({ fields: submissionFields(entry) }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return { ok: true };
    const problem = refusal(res.status, (await res.json().catch(() => ({}))) as Refusal);
    console.error(problem);
    return { ok: false, problem };
  } catch (err) {
    console.error('HubSpot unreachable:', err);
    return { ok: false, problem: 'HubSpot did not answer' };
  }
}
