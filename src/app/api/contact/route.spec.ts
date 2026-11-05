import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SMTP2GO_URL, escapeHtml } from './email';

/** The JSON route's email: subjects, the regional tag, escaping and the honeypot (fetch stubbed). */
describe('POST /api/contact email', () => {
  beforeEach(() => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
    vi.stubEnv('SMTP2GO_API_KEY', 'stub');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function stub() {
    const fn = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => Response.json({ data: { succeeded: 1 } }));
    vi.stubGlobal('fetch', fn);
    return fn;
  }
  const sentBody = (fetch: ReturnType<typeof stub>) => JSON.parse(String(fetch.mock.calls[0][1]?.body));

  async function post(body: unknown) {
    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');
    return POST(
      new NextRequest('http://localhost/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    );
  }

  const lead = { name: 'Chidi Okafor', email: 'chidi@example.com', message: 'A booking site.' };

  it('leads a regional inquiry’s subject with where it came from', async () => {
    const fetch = stub();
    expect((await post({ ...lead, subject: 'Web Development', source: '/nigeria' })).status).toBe(200);
    const body = sentBody(fetch);
    expect(fetch.mock.calls[0][0]).toBe(SMTP2GO_URL);
    expect(body.subject).toBe('Inquiry from /nigeria: Chidi Okafor');
    expect(body.text_body).toContain('Source: mapltech.com/nigeria');
  });

  it('keeps the other forms’ subjects, and ignores a source it does not know', async () => {
    const fetch = stub();
    await post({ ...lead, subject: 'Referral: Ada', source: '/elsewhere' });
    expect(sentBody(fetch).subject).toBe('New Contact: Referral: Ada - from Chidi Okafor');
    expect(sentBody(fetch).text_body).not.toContain('Source:');
  });

  it('shows what was typed in the email, never runs it as markup', async () => {
    const fetch = stub();
    await post({ ...lead, name: '<img src=x onerror=alert(1)>', message: '<script>bad()</script>' });
    const html = sentBody(fetch).html_body as string;
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain(escapeHtml('<script>bad()</script>'));
  });

  it('gives a bot that fills the honeypot a success and sends nothing', async () => {
    const fetch = stub();
    expect((await post({ ...lead, website: 'spam.example' })).status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses a send without the required fields, and sends nothing', async () => {
    const fetch = stub();
    expect((await post({ name: 'Chidi', email: '', message: 'x' })).status).toBe(400);
    expect((await post({ name: { a: 1 }, email: 'a@b.co', message: 'x' })).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
});
