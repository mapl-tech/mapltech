/**
 * Server check for the forms' reCAPTCHA v2 ("I'm not a robot") token.
 *
 * - No RECAPTCHA_SECRET_KEY: not enforced, every send passes (local dev,
 *   previews, and production until the owner adds the keys).
 * - Secret set, no token: "missing" (the box never loaded, or a bot posted
 *   straight to the API).
 * - Secret set, Google says success: false (a forged, expired or reused
 *   token): "rejected". v2 has no score or action to check, only success.
 * - Google unreachable or erroring: passes, so an outage on Google's side
 *   never blocks a real lead (the behaviour the v3 check had). Likewise a
 *   secret Google does not recognise (a typo in Netlify) is logged as an
 *   error and passes: our misconfiguration must not refuse every visitor.
 */

export const SITEVERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

export type RecaptchaVerdict = 'ok' | 'missing' | 'rejected';

/** What the forms show for each refusal (the brief and the referral form print the API's words). */
export const RECAPTCHA_ERRORS: Record<Exclude<RecaptchaVerdict, 'ok'>, string> = {
  missing: 'The “I’m not a robot” check did not load. Refresh the page and try again.',
  rejected: 'The “I’m not a robot” check did not go through. Tick it again, then send.',
};

export async function verifyRecaptcha(
  token: unknown,
  secret: string | undefined = process.env.RECAPTCHA_SECRET_KEY,
): Promise<RecaptchaVerdict> {
  if (!secret) return 'ok';
  if (typeof token !== 'string' || !token.trim()) return 'missing';

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!res.ok) throw new Error(`siteverify ${res.status}`);
    const data = (await res.json()) as { success?: unknown; 'error-codes'?: unknown };
    if (data.success === true) return 'ok';
    const codes = Array.isArray(data['error-codes']) ? data['error-codes'] : [];
    if (codes.includes('invalid-input-secret') || codes.includes('missing-input-secret')) {
      console.error('reCAPTCHA secret refused by Google; check RECAPTCHA_SECRET_KEY:', codes);
      return 'ok';
    }
    console.warn('reCAPTCHA refused:', codes);
    return 'rejected';
  } catch (err) {
    console.error('reCAPTCHA verification unavailable:', err);
    return 'ok';
  }
}
