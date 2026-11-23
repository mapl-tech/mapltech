import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stubKeys, stubServices } from '../../../../tests/stubs/services';
import { CONTACT_TO } from '../contact/email';
import { HUBSPOT_FORMS } from '../contact/hubspot';

describe('POST /api/newsletter', () => {
  beforeEach(() => {
    stubKeys();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function post(body: unknown) {
    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');
    return POST(
      new NextRequest('http://localhost/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
      }),
    );
  }

  it('submits the address alone to the newsletter’s own HubSpot form, then emails contact@ with the address escaped', async () => {
    const services = stubServices();
    const res = await post({ email: " O'Brien&Co@Example.com " });
    expect(res.status).toBe(200);
    expect(services.submissions()).toHaveLength(1);
    expect(services.hubspot()?.formId).toBe(HUBSPOT_FORMS.newsletter.id);
    expect(services.hubspot()?.fields).toEqual({ email: "o'brien&co@example.com" });
    const email = services.email()?.body;
    expect(email).toMatchObject({ to: [CONTACT_TO], subject: "New Newsletter Subscriber: O'Brien&Co@Example.com", reply_to: "O'Brien&Co@Example.com" });
    expect(email.html).toContain('O&#39;Brien&amp;Co@Example.com');
    expect(email.html).not.toContain("O'Brien&Co");
  });

  it('confirms to the subscriber, says how to leave the list, and gives mail apps an unsubscribe header', async () => {
    const services = stubServices();
    await post({ email: 'reader@example.com' });
    const confirmation = services.confirmation()?.body;
    expect(confirmation).toMatchObject({ to: ['reader@example.com'], reply_to: CONTACT_TO, subject: 'You’re subscribed to the MAPL TECH newsletter' });
    expect(confirmation.headers).toEqual({ 'List-Unsubscribe': '<mailto:contact@mapltech.com?subject=unsubscribe>' });
    expect(confirmation.text).toContain('The next issue goes to reader@example.com.');
    expect(confirmation.text).toContain('Changed your mind? Reply with “unsubscribe” and we’ll take you off the list.');
  });

  it('refuses an address that is not one, and sends nothing', async () => {
    const services = stubServices();
    expect((await post({ email: 'not-an-email' })).status).toBe(400);
    expect((await post({})).status).toBe(400);
    expect(services.fetch).not.toHaveBeenCalled();
  });

  it('succeeds when either HubSpot or the email has the sign-up, and fails when neither does', async () => {
    const services = stubServices({ hubspot: { status: 401, body: { status: 'error', message: 'Authentication credentials not found.' } } });
    expect((await post({ email: 'a@example.com' })).status).toBe(200);
    expect(services.email()?.body.text).toContain('Not saved in HubSpot');

    stubServices({ resend: { status: 500 } });
    expect((await post({ email: 'a@example.com' })).status).toBe(200);

    stubServices({ resend: { status: 500 }, hubspot: { status: 500 } });
    const res = await post({ email: 'a@example.com' });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Failed to subscribe. Please try again.' });
  });

  it('answers a body that is not JSON with the failure', async () => {
    stubServices();
    expect((await post('not json')).status).toBe(500);
  });
});
