import { vi } from 'vitest';
import { CONTACT_TO, RESEND_URL } from '@/app/api/contact/email';
import { HUBSPOT_SUBMIT_URL } from '@/app/api/contact/hubspot';
import { SITEVERIFY_URL } from '@/app/api/contact/verifyRecaptcha';

/**
 * A stand-in for everything the form routes call: Google's siteverify,
 * Resend and HubSpot. Each answer can be set per test. Nothing leaves the
 * machine; a call to anything else fails the way a network error would.
 */

interface Reply {
  status: number;
  body?: unknown;
}

export interface Services {
  recaptcha?: { success: boolean; 'error-codes'?: string[] };
  /** Resend, for every email: 200 by default. */
  resend?: Reply;
  /** Resend, for the visitor's confirmation only: `resend` by default. */
  confirmation?: Reply;
  /** HubSpot's form submission: 200 by default. */
  hubspot?: Reply;
}

export interface SentCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- the JSON each service was sent
}

export function stubServices(services: Services = {}) {
  const reply = ({ status, body }: Reply) => Response.json(body ?? {}, { status });
  const fetch = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async (url, init) => {
    const method = init?.method ?? 'GET';
    if (url === SITEVERIFY_URL) return Response.json(services.recaptcha ?? { success: true });
    if (url === RESEND_URL) {
      const toInbox = (JSON.parse(String(init?.body ?? '{}')) as { to?: string[] }).to?.[0] === CONTACT_TO;
      return reply((toInbox ? undefined : services.confirmation) ?? services.resend ?? { status: 200, body: { id: 'email-1' } });
    }
    if (url.startsWith(`${HUBSPOT_SUBMIT_URL}/`) && method === 'POST') {
      return reply(services.hubspot ?? { status: 200, body: { inlineMessage: 'Thanks for submitting the form.' } });
    }
    throw new TypeError(`fetch failed: nothing answers ${method} ${url} in this test`);
  });
  vi.stubGlobal('fetch', fetch);

  const calls = (): SentCall[] =>
    fetch.mock.calls.map(([url, init]) => ({
      url,
      method: init?.method ?? 'GET',
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: typeof init?.body === 'string' && init.body.startsWith('{') ? JSON.parse(init.body) : init?.body,
    }));
  const submissions = () => calls().filter((call) => call.url.startsWith(`${HUBSPOT_SUBMIT_URL}/`));
  const emails = () => calls().filter((call) => call.url === RESEND_URL);

  return {
    fetch,
    calls,
    /** Every email Resend was sent, in order. */
    emails,
    /** The entry's email to the inbox, or null when none went. */
    email: () => emails().find((call) => call.body.to?.[0] === CONTACT_TO) ?? null,
    /** The visitor's confirmation, or null when none went. */
    confirmation: () => emails().find((call) => call.body.to?.[0] !== CONTACT_TO) ?? null,
    /** Every HubSpot submission, in order. */
    submissions,
    /** The first HubSpot submission: the HubSpot form it went to, and its fields as name → value. Null when there was none. */
    hubspot: () => {
      const [call] = submissions();
      if (!call) return null;
      const fields = call.body.fields as { name: string; value: string }[];
      return { formId: call.url.split('/').pop(), fields: Object.fromEntries(fields.map(({ name, value }) => [name, value])), call };
    },
  };
}

/** The keys the routes read, set to stand-ins; reCAPTCHA off unless a test turns it on. */
export function stubKeys() {
  vi.stubEnv('RESEND_API_KEY', 're_test_stub');
  vi.stubEnv('RESEND_FROM', '');
  vi.stubEnv('HUBSPOT_ACCESS_TOKEN', 'pat-test-stub');
  vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
}
