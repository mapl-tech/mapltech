import { NextRequest, NextResponse } from 'next/server';
import { sendEntryEmails } from '../contact/email';
import { inboxEmail, visitorEmail } from '../contact/emailTemplates';
import { recordInHubSpot } from '../contact/hubspot';

const FAILED = 'Failed to subscribe. Please try again.';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The footer's newsletter sign-up ({ email }).
 *
 * - HubSpot: the address goes into the newsletter's own form there ("Website:
 *   Newsletter", see ../contact/hubspot.ts), which makes or updates the contact.
 * - Email (../contact/emailTemplates.ts): contact@mapltech.com hears about it
 *   through Resend, with the subscriber as Reply-To. If HubSpot missed it,
 *   that email says so. The subscriber gets a confirmation that says how to
 *   leave the list.
 *
 * The visitor is told it worked when either HubSpot or the inbox has the
 * sign-up. The address is escaped in the emails.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : '';
    if (!EMAIL.test(email)) {
      return NextResponse.json({ error: 'Enter an email address like name@example.com.' }, { status: 400 });
    }

    const crm = await recordInHubSpot({ form: 'newsletter', email, rows: [] });
    const sent = await sendEntryEmails(
      inboxEmail({
        form: 'newsletter',
        subject: `New Newsletter Subscriber: ${email}`,
        who: email,
        email,
        rows: [{ label: 'Email', value: email, href: `mailto:${email}` }],
        crm,
      }),
      visitorEmail({ form: 'newsletter', to: email }),
      crm.ok,
    );

    if (!sent && !crm.ok) return NextResponse.json({ error: FAILED }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: FAILED }, { status: 500 });
  }
}
