import { NextRequest, NextResponse } from 'next/server';
import { ESTIMATE_SENDER_NAME } from '@/lib/estimate';
import { sendEntryEmails } from './email';
import { inboxEmail, visitorEmail } from './emailTemplates';
import { type HubSpotForm, recordInHubSpot } from './hubspot';
import { RECAPTCHA_ERRORS, verifyRecaptcha } from './verifyRecaptcha';

const FAILED = 'Failed to send message. Please try again.';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** The pages whose inquiries are tagged by where they came from. */
const REGIONAL_SOURCES = ['/nigeria', '/jamaica'] as const;
/** The call request on bio.mapltech.com (src/app/bio): its own subject, so the inbox can filter it. */
const BIO_SOURCE = '/bio';
const BIO_HOST = 'bio.mapltech.com';
/**
 * The forms that post here, by the name each one sends (lead.ts). Each has its
 * own form in HubSpot; a send that names none counts as a project brief.
 */
const CONTACT_FORMS = [
  'project_brief',
  'referral',
  'estimate_email',
  'regional_inquiry_nigeria',
  'regional_inquiry_jamaica',
  'bio_call_request',
] as const satisfies readonly HubSpotForm[];

/** A trimmed string field, '' for anything else, cut to `max` characters. */
function text(value: unknown, max = 5000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * The JSON forms: the brief, the referral, the estimate email, the regional
 * inquiries and the call request on bio.mapltech.com.
 *
 * - A regional inquiry says where it came from (`source`: "/nigeria" or
 *   "/jamaica"). Its subject leads with that so the inbox can filter on it:
 *   "Inquiry from /nigeria: <name>".
 * - The bio page sends `source: "/bio"`. Its email arrives as "Call request
 *   from bio.mapltech.com: <name>".
 *
 * Before anything is sent, in order:
 * 1. The honeypot. A bot that fills the hidden "website" field gets a success,
 *    and nothing is sent.
 * 2. The required fields, and an email address that looks like one.
 * 3. reCAPTCHA.
 *
 * Then the entry goes to HubSpot, into the form's own form there (`form`, see
 * hubspot.ts), followed by two emails through Resend (emailTemplates.ts): the
 * entry to contact@mapltech.com, and a confirmation to the visitor once the
 * entry is kept. If HubSpot missed it, the inbox email says so. The visitor is
 * told it worked when either HubSpot or the inbox has the entry. Every visitor
 * value is escaped in the emails.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (text(body.website)) return NextResponse.json({ success: true });

    const name = text(body.name, 200);
    const email = text(body.email, 254);
    const phone = text(body.phone, 40);
    const contactMethod = text(body.contactMethod, 40);
    const subject = text(body.subject, 200);
    const message = text(body.message);
    const source = REGIONAL_SOURCES.find((path) => path === text(body.source, 40));
    const fromBio = text(body.source, 40) === BIO_SOURCE;
    const form = CONTACT_FORMS.find((id) => id === text(body.form, 40)) ?? 'project_brief';

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
    }
    if (!EMAIL.test(email)) {
      return NextResponse.json({ error: 'Enter an email address like name@example.com.' }, { status: 400 });
    }

    // reCAPTCHA v2 ("I'm not a robot"), enforced only when RECAPTCHA_SECRET_KEY is set.
    const verdict = await verifyRecaptcha(body.recaptchaToken);
    if (verdict !== 'ok') {
      return NextResponse.json({ error: RECAPTCHA_ERRORS[verdict] }, { status: 400 });
    }

    const rows = [
      ...(source ? [{ label: 'Source', value: `mapltech.com${source}` }] : []),
      ...(fromBio ? [{ label: 'Source', value: BIO_HOST }] : []),
      // The estimate form has no name field: its fixed name is not the visitor's.
      ...(name === ESTIMATE_SENDER_NAME ? [] : [{ label: 'Name', value: name }]),
      { label: 'Email', value: email, href: `mailto:${email}` },
      ...(phone ? [{ label: 'Phone', value: phone }] : []),
      ...(contactMethod ? [{ label: 'Preferred Contact', value: contactMethod }] : []),
      ...(subject ? [{ label: 'Subject', value: subject }] : []),
      { label: 'Message', value: message },
    ];
    const emailSubject = source
      ? `Inquiry from ${source}: ${name}`
      : fromBio
        ? `Call request from ${BIO_HOST}: ${name}`
        : subject
          ? `New Contact: ${subject} - from ${name}`
          : `New Contact Form Submission from ${name}`;

    const visitorName = name === ESTIMATE_SENDER_NAME ? undefined : name;
    const crm = await recordInHubSpot({ form, email, name: visitorName, phone, rows });

    const sent = await sendEntryEmails(
      inboxEmail({ form, subject: emailSubject, who: visitorName ?? email, email, rows, crm }),
      visitorEmail({ form, to: email, name: visitorName, phone: contactMethod === 'phone' }),
      crm.ok,
    );

    if (!sent && !crm.ok) return NextResponse.json({ error: FAILED }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: FAILED }, { status: 500 });
  }
}
