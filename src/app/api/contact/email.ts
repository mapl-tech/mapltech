/**
 * The one way the site's forms email MAPL TECH: SMTP2GO's /email/send, with
 * the visitor as Reply-To. Shared by /api/contact and /api/apply.
 *
 * Attachments use SMTP2GO's documented shape: `{ filename, fileblob, mimetype }`,
 * `fileblob` being the file's bytes in base64. Nothing is stored anywhere
 * else: the file goes from the request to the email and is gone.
 */

export const SMTP2GO_URL = 'https://api.smtp2go.com/v3/email/send';

/** Where every form's email goes, applications included (confirmed by the owner, Nov 5 2026). */
export const CONTACT_TO = 'contact@mapltech.com';

export interface EmailAttachment {
  filename: string;
  fileblob: string;
  mimetype: string;
}

export interface OutgoingEmail {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
  to?: string;
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

/** The table of answers every form email shows, escaped; `value` keeps its line breaks. */
export function answersTable(rows: { label: string; value: string; href?: string }[]): string {
  const cell = 'padding: 8px 12px; vertical-align: top;';
  return `<table style="border-collapse: collapse; width: 100%; max-width: 600px;">${rows
    .map(
      ({ label, value, href }) =>
        `<tr><td style="${cell} font-weight: bold;">${escapeHtml(label)}</td><td style="${cell} white-space: pre-wrap;">${
          href ? `<a href="${escapeHtml(href)}">${escapeHtml(value)}</a>` : escapeHtml(value)
        }</td></tr>`,
    )
    .join('')}</table>`;
}

/** Sends one email; true when SMTP2GO accepted it. Errors are logged, never thrown. */
export async function sendEmail({ subject, html, text, replyTo, to = CONTACT_TO, attachments }: OutgoingEmail): Promise<boolean> {
  try {
    const res = await fetch(SMTP2GO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.SMTP2GO_API_KEY,
        to: [to],
        sender: process.env.SMTP2GO_SENDER || CONTACT_TO,
        subject: oneLine(subject, 250),
        html_body: html,
        text_body: text,
        custom_headers: [{ header: 'Reply-To', value: oneLine(replyTo, 254) }],
        ...(attachments?.length ? { attachments } : {}),
      }),
    });
    const result = (await res.json().catch(() => ({}))) as { data?: { error?: unknown } };
    if (!res.ok || result.data?.error) {
      console.error('SMTP2GO error:', res.status, result.data?.error ?? result);
      return false;
    }
    return true;
  } catch (err) {
    console.error('SMTP2GO unreachable:', err);
    return false;
  }
}
