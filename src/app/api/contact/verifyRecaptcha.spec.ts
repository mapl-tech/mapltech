import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RECAPTCHA_ERRORS, SITEVERIFY_URL, verifyRecaptcha } from './verifyRecaptcha';

const SECRET = 'test-secret';

/** A stubbed fetch that answers siteverify with `body` (and `status`). */
function siteverify(body: unknown, status = 200) {
  const fn = vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('verifyRecaptcha', () => {
  it('passes without a secret, token or not, and never calls Google', async () => {
    const fetch = siteverify({ success: false });
    expect(await verifyRecaptcha(undefined, undefined)).toBe('ok');
    expect(await verifyRecaptcha('anything', '')).toBe('ok');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('reads the secret from RECAPTCHA_SECRET_KEY by default', async () => {
    siteverify({ success: true });
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
    expect(await verifyRecaptcha(undefined)).toBe('ok');
    vi.stubEnv('RECAPTCHA_SECRET_KEY', SECRET);
    expect(await verifyRecaptcha(undefined)).toBe('missing');
  });

  it('refuses a missing, empty or non-string token without calling Google', async () => {
    const fetch = siteverify({ success: true });
    expect(await verifyRecaptcha(undefined, SECRET)).toBe('missing');
    expect(await verifyRecaptcha('', SECRET)).toBe('missing');
    expect(await verifyRecaptcha('   ', SECRET)).toBe('missing');
    expect(await verifyRecaptcha(42, SECRET)).toBe('missing');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses a token Google does not accept (success: false)', async () => {
    siteverify({ success: false, 'error-codes': ['timeout-or-duplicate'] });
    expect(await verifyRecaptcha('token', SECRET)).toBe('rejected');
  });

  it('refuses an answer without success: true (no score is read for v2)', async () => {
    siteverify({ score: 0.9, action: 'contact' });
    expect(await verifyRecaptcha('token', SECRET)).toBe('rejected');
  });

  it('passes a token Google accepts, posting the secret and the token as a form', async () => {
    const fetch = siteverify({ success: true, hostname: 'mapltech.com' });
    expect(await verifyRecaptcha('the-token', SECRET)).toBe('ok');
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(SITEVERIFY_URL);
    expect(init.method).toBe('POST');
    const sent = new URLSearchParams(String(init.body));
    expect(sent.get('secret')).toBe(SECRET);
    expect(sent.get('response')).toBe('the-token');
  });

  it('passes when Google cannot be reached or errors, so an outage never blocks a lead', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('fetch failed'))));
    expect(await verifyRecaptcha('token', SECRET)).toBe('ok');
    siteverify({ error: 'unavailable' }, 503);
    expect(await verifyRecaptcha('token', SECRET)).toBe('ok');
  });

  it('passes, and logs, when Google does not recognise our secret', async () => {
    siteverify({ success: false, 'error-codes': ['invalid-input-secret'] });
    expect(await verifyRecaptcha('token', SECRET)).toBe('ok');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('POST /api/contact', () => {
  const lead = { name: 'Test Person', email: 'test@example.com', message: 'Hello' };

  async function post(body: unknown) {
    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');
    return POST(
      new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
  }

  it('refuses a send without a token once the secret is set, and sends no email', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', SECRET);
    const fetch = siteverify({ success: true });
    const res = await post(lead);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: RECAPTCHA_ERRORS.missing });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses a token Google rejects, and sends no email', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', SECRET);
    const fetch = siteverify({ success: false, 'error-codes': ['invalid-input-response'] });
    const res = await post({ ...lead, recaptchaToken: 'forged' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: RECAPTCHA_ERRORS.rejected });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(String((fetch.mock.calls[0] as unknown as [string])[0])).toBe(SITEVERIFY_URL);
  });

  it('sends the email once Google accepts the token', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', SECRET);
    vi.stubEnv('SMTP2GO_API_KEY', 'stub');
    const fetch = vi.fn(async (url: string) =>
      Response.json(url === SITEVERIFY_URL ? { success: true } : { data: { succeeded: 1 } }),
    );
    vi.stubGlobal('fetch', fetch);
    const res = await post({ ...lead, recaptchaToken: 'good' });
    expect(res.status).toBe(200);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([SITEVERIFY_URL, 'https://api.smtp2go.com/v3/email/send']);
  });

  it('sends without a token when no secret is set (the forms work before the keys exist)', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
    vi.stubEnv('SMTP2GO_API_KEY', 'stub');
    const fetch = vi.fn(async () => Response.json({ data: { succeeded: 1 } }));
    vi.stubGlobal('fetch', fetch);
    const res = await post(lead);
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
