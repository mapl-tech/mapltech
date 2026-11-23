import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ESTIMATE_SENDER_NAME } from '@/lib/estimate';
import { stubKeys, stubServices } from '../../../../tests/stubs/services';
import { CONTACT_TO, DEFAULT_FROM, RESEND_URL, USER_AGENT, escapeHtml } from './email';
import { VISITOR_FROM } from './emailTemplates';
import { HUBSPOT_ACCOUNT_ID, HUBSPOT_FORMS, HUBSPOT_SUBMIT_URL, type HubSpotForm } from './hubspot';

/** The JSON route: HubSpot, then the inbox email and the visitor's confirmation (every outbound call stubbed). */
describe('POST /api/contact', () => {
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
      new NextRequest('http://localhost/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    );
  }

  const lead = { name: 'Chidi Okafor', email: 'Chidi@Example.com', message: 'A booking site.' };

  describe('the inbox email', () => {
    it('leads a regional inquiry’s subject with where it came from', async () => {
      const services = stubServices();
      expect((await post({ ...lead, form: 'regional_inquiry_nigeria', subject: 'Web Development', source: '/nigeria' })).status).toBe(200);
      const email = services.email();
      expect(email?.body.subject).toBe('Inquiry from /nigeria: Chidi Okafor');
      expect(email?.body.text).toContain('Source: mapltech.com/nigeria');
    });

    it('names a call request from bio.mapltech.com in its subject and its Source row, and replies to the visitor', async () => {
      const services = stubServices();
      const res = await post({ ...lead, form: 'bio_call_request', phone: '+234 803 123 4567', subject: 'A booking system · In 1 to 3 months', source: '/bio' });
      expect(res.status).toBe(200);
      const email = services.email();
      expect(email?.body).toMatchObject({
        from: DEFAULT_FROM,
        to: [CONTACT_TO],
        subject: 'Call request from bio.mapltech.com: Chidi Okafor',
        reply_to: 'Chidi@Example.com',
      });
      expect(email?.body.text).toContain('Source: bio.mapltech.com');
      expect(email?.body.text).toContain('Phone: +234 803 123 4567');
      expect(email?.body.text).toContain('Subject: A booking system · In 1 to 3 months');
      expect(email?.body.text).toContain('They were told we email them within 24 hours to set a time for the 20-minute call.');
      expect(email?.body.text).toContain('Saved in HubSpot: Marketing › Forms › bio.mapltech.com: Call request.');
      expect(email?.headers).toMatchObject({ Authorization: 'Bearer re_test_stub', 'User-Agent': USER_AGENT });
    });

    it('keeps the other forms’ subjects, and ignores a source it does not know', async () => {
      const services = stubServices();
      await post({ ...lead, form: 'referral', subject: 'Referral: Ada', source: '/elsewhere' });
      expect(services.email()?.body.subject).toBe('New Contact: Referral: Ada - from Chidi Okafor');
      expect(services.email()?.body.text).not.toContain('Source:');
    });

    it('shows what was typed, never runs it as markup', async () => {
      const services = stubServices();
      await post({ ...lead, name: '<img src=x onerror=alert(1)>', message: '<script>bad()</script>' });
      const html = services.email()?.body.html as string;
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img src=x');
      expect(html).toContain(escapeHtml('<script>bad()</script>'));
      expect(html).toContain(escapeHtml('<img src=x onerror=alert(1)>'));
    });
  });

  describe('the visitor’s confirmation', () => {
    it('goes to the visitor from MAPL TECH, replies reach the inbox, and it says what happens next', async () => {
      const services = stubServices();
      await post({ ...lead, form: 'project_brief', subject: 'Website', contactMethod: 'phone', phone: '+1 416 555 0100' });
      const confirmation = services.confirmation()?.body;
      expect(confirmation).toMatchObject({ from: VISITOR_FROM, to: ['Chidi@Example.com'], reply_to: CONTACT_TO, subject: 'We have your brief' });
      expect(confirmation.text).toContain('Thanks, Chidi. We have your brief.');
      expect(confirmation.text).toContain('1. We call you within 24 hours.');
      expect(confirmation.html).toContain('Thanks, Chidi. We have your brief.');
    });

    it('never repeats what the visitor typed, so the form cannot carry someone’s words to another inbox', async () => {
      const services = stubServices();
      await post({ ...lead, name: 'Win http://spam.example', subject: 'Cheap pills', message: 'Visit spam.example now' });
      const confirmation = services.confirmation()?.body;
      for (const part of [confirmation.html, confirmation.text, confirmation.subject]) {
        expect(part).not.toContain('spam.example');
        expect(part).not.toContain('Cheap pills');
      }
      expect(confirmation.text).toContain('Thanks, Win. We have your brief.');
    });

    it('is the estimate form’s own, with no name', async () => {
      const services = stubServices();
      await post({ form: 'estimate_email', name: ESTIMATE_SENDER_NAME, email: 'visitor@example.com', subject: 'Scope estimate: Website', message: 'MAPL TECH scope estimate' });
      const confirmation = services.confirmation()?.body;
      expect(confirmation.subject).toBe('We have your estimate request');
      expect(confirmation.text).toContain('We have your estimate request.');
      expect(confirmation.text).not.toContain('Thanks, Estimate');
    });

    it('waits for the inbox email when HubSpot missed the entry, and is not sent when nothing kept it', async () => {
      let services = stubServices({ hubspot: { status: 500 } });
      expect((await post(lead)).status).toBe(200);
      expect(services.emails().map((call) => call.body.to[0])).toEqual([CONTACT_TO, 'Chidi@Example.com']);

      services = stubServices({ hubspot: { status: 500 }, resend: { status: 500 } });
      expect((await post(lead)).status).toBe(500);
      expect(services.emails()).toHaveLength(1);
      expect(services.confirmation()).toBeNull();
    });

    it('a confirmation Resend refuses changes nothing for the visitor', async () => {
      const services = stubServices({ confirmation: { status: 422, body: { name: 'validation_error', message: 'Invalid `to` field.' } } });
      expect((await post(lead)).status).toBe(200);
      expect(services.email()).not.toBeNull();
    });
  });

  describe('HubSpot', () => {
    it('submits the entry to the form’s own form in HubSpot, then emails the inbox and the visitor', async () => {
      const services = stubServices();
      await post({ ...lead, form: 'bio_call_request', phone: '+234 803 123 4567', subject: 'A booking system', source: '/bio' });
      expect(services.calls().map((call) => `${call.method} ${call.url}`)).toEqual([
        `POST ${HUBSPOT_SUBMIT_URL}/${HUBSPOT_ACCOUNT_ID}/${HUBSPOT_FORMS.bio_call_request.id}`,
        `POST ${RESEND_URL}`,
        `POST ${RESEND_URL}`,
      ]);
      const hubspot = services.hubspot();
      expect(hubspot?.call.headers).toMatchObject({ Authorization: 'Bearer pat-test-stub' });
      expect(hubspot?.fields).toEqual({
        email: 'chidi@example.com',
        firstname: 'Chidi',
        lastname: 'Okafor',
        phone: '+234 803 123 4567',
        message: 'Source: bio.mapltech.com\nSubject: A booking system\nMessage: A booking site.',
      });
    });

    it('keeps every form’s entries apart: each goes to its own HubSpot form', async () => {
      const forms: HubSpotForm[] = ['project_brief', 'referral', 'estimate_email', 'regional_inquiry_nigeria', 'regional_inquiry_jamaica', 'bio_call_request'];
      for (const form of forms) {
        const services = stubServices();
        expect((await post({ ...lead, form })).status).toBe(200);
        expect(services.hubspot()?.formId).toBe(HUBSPOT_FORMS[form].id);
      }
    });

    it('files a send that names no form, or another route’s form, as a project brief', async () => {
      for (const form of [undefined, 'newsletter', 'careers_application', 'nonsense']) {
        const services = stubServices();
        await post({ ...lead, form });
        expect(services.hubspot()?.formId).toBe(HUBSPOT_FORMS.project_brief.id);
      }
    });

    it('gives the estimate email’s contact no name: the form’s fixed name is not the visitor’s', async () => {
      const services = stubServices();
      await post({
        form: 'estimate_email',
        name: ESTIMATE_SENDER_NAME,
        email: 'visitor@example.com',
        subject: 'Scope estimate: Website',
        message: 'MAPL TECH scope estimate',
        contactMethod: 'email',
      });
      const hubspot = services.hubspot();
      expect(hubspot?.formId).toBe(HUBSPOT_FORMS.estimate_email.id);
      expect(Object.keys(hubspot?.fields ?? {})).toEqual(['email', 'message']);
      expect(services.email()?.body.subject).toBe(`New Contact: Scope estimate: Website - from ${ESTIMATE_SENDER_NAME}`);
      expect(services.email()?.body.text).toContain('visitor@example.com asked for an estimate in writing');
      expect(services.email()?.body.text).not.toContain(`Name: ${ESTIMATE_SENDER_NAME}`);
    });

    it('still emails when HubSpot refuses, and the inbox email says to add the entry by hand', async () => {
      const services = stubServices({ hubspot: { status: 401, body: { status: 'error', message: 'Authentication credentials not found.' } } });
      expect((await post(lead)).status).toBe(200);
      // HubSpot's own full stop is dropped, so the line never reads "found.).".
      const line = 'Not saved in HubSpot: HubSpot refused the entry (401: Authentication credentials not found). Add this entry to HubSpot by hand.';
      expect(services.email()?.body.text).toContain(line);
      expect(services.email()?.body.html).toContain(escapeHtml(line));
    });

    it('without HUBSPOT_ACCESS_TOKEN, emails and says HubSpot is not set up', async () => {
      vi.stubEnv('HUBSPOT_ACCESS_TOKEN', '');
      const services = stubServices();
      expect((await post(lead)).status).toBe(200);
      expect(services.submissions()).toEqual([]);
      expect(services.email()?.body.text).toContain('Not saved in HubSpot: HUBSPOT_ACCESS_TOKEN is not set on this server.');
    });
  });

  describe('what the visitor is told', () => {
    it('it worked when HubSpot has the entry, even if the email failed', async () => {
      stubServices({ resend: { status: 403, body: { name: 'validation_error', message: 'The mapltech.com domain is not verified.' } } });
      expect((await post(lead)).status).toBe(200);
      expect(console.error).toHaveBeenCalledWith('Resend refused the email:', 403, 'validation_error', 'The mapltech.com domain is not verified.');
    });

    it('it failed only when neither HubSpot nor the email has it', async () => {
      stubServices({ resend: { status: 500 }, hubspot: { status: 500 } });
      const res = await post(lead);
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Failed to send message. Please try again.' });
    });

    it('a bot that fills the honeypot gets a success, and nothing is sent anywhere', async () => {
      const services = stubServices();
      expect((await post({ ...lead, website: 'spam.example' })).status).toBe(200);
      expect(services.fetch).not.toHaveBeenCalled();
    });

    it('a send without the required fields, or with an email that is not one, is refused and nothing is sent', async () => {
      const services = stubServices();
      expect((await post({ name: 'Chidi', email: '', message: 'x' })).status).toBe(400);
      expect((await post({ name: { a: 1 }, email: 'a@b.co', message: 'x' })).status).toBe(400);
      const bad = await post({ ...lead, email: 'chidi@example' });
      expect(bad.status).toBe(400);
      expect(await bad.json()).toEqual({ error: 'Enter an email address like name@example.com.' });
      expect(services.fetch).not.toHaveBeenCalled();
    });
  });
});
