import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stubServices } from '../../../../tests/stubs/services';
import { CONTACT_TO, DEFAULT_FROM, RESEND_URL, USER_AGENT, sendEmail, sendEntryEmails } from './email';

const KEY = 're_test_stub';
const email = { subject: 'New Contact:\r\nBcc: someone@example.com', html: '<p>Hi</p>', text: 'Hi', replyTo: 'ada@example.com' };

beforeEach(() => {
  vi.stubEnv('RESEND_FROM', '');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('sendEmail (Resend)', () => {
  it('posts to Resend with the key, a User-Agent, one-line headers and the visitor as Reply-To', async () => {
    const services = stubServices();
    expect(await sendEmail(email, KEY)).toBe(true);
    const sent = services.email();
    expect(sent?.url).toBe(RESEND_URL);
    expect(sent?.headers).toEqual({ Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', 'User-Agent': USER_AGENT });
    expect(sent?.body).toEqual({
      from: DEFAULT_FROM,
      to: [CONTACT_TO],
      subject: 'New Contact: Bcc: someone@example.com',
      html: '<p>Hi</p>',
      text: 'Hi',
      reply_to: 'ada@example.com',
    });
  });

  it('attaches files in Resend’s shape', async () => {
    const services = stubServices();
    await sendEmail({ ...email, attachments: [{ filename: 'cv.pdf', content: 'JVBERi0=', mimetype: 'application/pdf' }] }, KEY);
    expect(services.email()?.body.attachments).toEqual([{ filename: 'cv.pdf', content: 'JVBERi0=', content_type: 'application/pdf' }]);
  });

  it('sends from RESEND_FROM when it is set', async () => {
    vi.stubEnv('RESEND_FROM', 'Forms <forms@mapltech.com>');
    const services = stubServices();
    await sendEmail(email, KEY);
    expect(services.email()?.body.from).toBe('Forms <forms@mapltech.com>');
  });

  it('sends from the email’s own From line, to its own address, with its own headers when it names them', async () => {
    const services = stubServices();
    await sendEmail({ ...email, to: 'ada@example.com', from: 'MAPL TECH <contact@mapltech.com>', headers: { 'List-Unsubscribe': '<mailto:x@example.com>' } }, KEY);
    expect(services.emails()[0]?.body).toMatchObject({
      from: 'MAPL TECH <contact@mapltech.com>',
      to: ['ada@example.com'],
      headers: { 'List-Unsubscribe': '<mailto:x@example.com>' },
    });
  });

  it('fails without a key, and calls nobody', async () => {
    const services = stubServices();
    expect(await sendEmail(email, '')).toBe(false);
    expect(services.fetch).not.toHaveBeenCalled();
  });

  it('fails, logging Resend’s words, when Resend refuses or cannot be reached', async () => {
    stubServices({ resend: { status: 422, body: { name: 'validation_error', message: 'Invalid `reply_to` field.' } } });
    expect(await sendEmail(email, KEY)).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Resend refused the email:', 422, 'validation_error', 'Invalid `reply_to` field.');

    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('fetch failed'))));
    expect(await sendEmail(email, KEY)).toBe(false);
  });
});

describe('sendEntryEmails', () => {
  const confirmation = { ...email, to: 'ada@example.com', from: 'MAPL TECH <contact@mapltech.com>' };
  beforeEach(() => vi.stubEnv('RESEND_API_KEY', KEY));

  it('sends both at once when the entry is kept without the email', async () => {
    const services = stubServices();
    expect(await sendEntryEmails(email, confirmation, true)).toBe(true);
    expect(services.emails().map((call) => call.body.to[0])).toEqual([CONTACT_TO, 'ada@example.com']);
  });

  it('otherwise confirms only after the inbox email went', async () => {
    let services = stubServices({ resend: { status: 500 } });
    expect(await sendEntryEmails(email, confirmation, false)).toBe(false);
    expect(services.emails()).toHaveLength(1);

    services = stubServices();
    expect(await sendEntryEmails(email, confirmation, false)).toBe(true);
    expect(services.emails().map((call) => call.body.to[0])).toEqual([CONTACT_TO, 'ada@example.com']);
  });

  it('answers for the inbox email alone: a refused confirmation changes nothing', async () => {
    stubServices({ confirmation: { status: 422 } });
    expect(await sendEntryEmails(email, confirmation, false)).toBe(true);

    stubServices({ resend: { status: 500 }, confirmation: { status: 200 } });
    expect(await sendEntryEmails(email, confirmation, true)).toBe(false);
  });
});
