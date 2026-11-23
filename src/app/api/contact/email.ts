/**
 * The one way the site's forms send email: Resend's POST /emails. Shared by
 * /api/contact, /api/apply and /api/newsletter. Each entry sends two emails
 * (emailTemplates.ts): the entry to the inbox, with the visitor as Reply-To,
 * and a confirmation to the visitor. Each entry also goes to HubSpot
 * (hubspot.ts).
 *
 * - RESEND_API_KEY is the key. Without it nothing is emailed: the send is
 *   logged and fails.
 * - Resend sends only from a domain verified in its dashboard (mapltech.com).
 *   RESEND_FROM overrides the inbox email's From line; the visitor's email
 *   names its own.
 * - Resend refuses a request with no User-Agent header (403), so every call
 *   sends one.
 * - Attachments use Resend's shape, `{ filename, content, content_type }`,
 *   where `content` is the file's bytes in base64. Nothing is stored: the file
 *   goes from the request to the email and is gone.
 */

export const RESEND_URL = 'https://api.resend.com/emails';

/** Where every form's email goes, applications included (confirmed by the owner, Nov 5 2026). */
export const CONTACT_TO = 'contact@mapltech.com';

/** The From line, on the domain verified in Resend. */
export const DEFAULT_FROM = 'MAPL TECH website <contact@mapltech.com>';

/** Sent with every call to Resend and HubSpot (Resend refuses a request without one). */
export const USER_AGENT = 'mapltech-website/1.0';

/** How long Resend may take before the send counts as failed (the function has to answer the form). */
const TIMEOUT_MS = 4000;

export interface EmailAttachment {
  filename: string;
  /** The file's bytes, base64. */
  content: string;
  mimetype: string;
}

export interface OutgoingEmail {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
  /** contact@mapltech.com unless given. */
  to?: string;
  /** RESEND_FROM, else DEFAULT_FROM, unless given. */
  from?: string;
  /** Extra headers, such as the newsletter's List-Unsubscribe. */
  headers?: Record<string, string>;
  attachments?: EmailAttachment[];
}

/** Visitor text inside the email's HTML: shown as typed, never run as markup. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
}

/** One header-safe line (a subject or Reply-To): no line breaks, at most `max` characters. */
export function oneLine(value: string, max = 200): string {
  return value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

/** Sends one email; true when Resend accepted it. Errors are logged, never thrown. */
export async function sendEmail(
  { subject, html, text, replyTo, to = CONTACT_TO, from, headers, attachments }: OutgoingEmail,
  key: string | undefined = process.env.RESEND_API_KEY,
): Promise<boolean> {
  if (!key) {
    console.error('Resend: RESEND_API_KEY is not set, so nothing was emailed.');
    return false;
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
      body: JSON.stringify({
        from: from ?? (process.env.RESEND_FROM || DEFAULT_FROM),
        to: [to],
        subject: oneLine(subject, 250),
        html,
        text,
        reply_to: oneLine(replyTo, 254),
        ...(headers ? { headers } : {}),
        ...(attachments?.length
          ? { attachments: attachments.map(({ filename, content, mimetype }) => ({ filename, content, content_type: mimetype })) }
          : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const error = (await res.json().catch(() => ({}))) as { name?: unknown; message?: unknown };
      console.error('Resend refused the email:', res.status, error.name ?? '', error.message ?? '');
      return false;
    }
    return true;
  } catch (err) {
    console.error('Resend unreachable:', err);
    return false;
  }
}

/**
 * Sends an entry's two emails: the inbox's, and the visitor's confirmation.
 * The confirmation goes only once the entry is kept, so nobody is told "we
 * have it" about an entry that went nowhere:
 * - `keptWithoutEmail` (HubSpot has the entry, and nothing travels in the
 *   inbox email alone): both go at once;
 * - otherwise the confirmation waits for the inbox email, and goes only if
 *   that went.
 * Returns whether the inbox email went. A confirmation that fails is logged
 * and changes nothing else.
 */
export async function sendEntryEmails(inbox: OutgoingEmail, confirmation: OutgoingEmail, keptWithoutEmail: boolean): Promise<boolean> {
  if (keptWithoutEmail) {
    const [sent] = await Promise.all([sendEmail(inbox), sendEmail(confirmation)]);
    return sent;
  }
  const sent = await sendEmail(inbox);
  if (sent) await sendEmail(confirmation);
  return sent;
}
