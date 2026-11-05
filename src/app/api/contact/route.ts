import { NextRequest, NextResponse } from 'next/server';
import { answersTable, escapeHtml, sendEmail } from './email';
import { RECAPTCHA_ERRORS, verifyRecaptcha } from './verifyRecaptcha';

const FAILED = 'Failed to send message. Please try again.';
/** The pages whose inquiries are tagged by where they came from. */
const REGIONAL_SOURCES = ['/nigeria', '/jamaica'] as const;

/** A trimmed string field, '' for anything else, cut to `max` characters. */
function text(value: unknown, max = 5000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * The JSON forms (the brief, the referral, the estimate email, the regional
 * inquiries). A regional inquiry says where it came from (`source`:
 * "/nigeria" or "/jamaica"), and its subject leads with that so the inbox
 * can filter on it: "Inquiry from /nigeria: <name>". Checks, in order,
 * before anything is emailed: the honeypot
 * (a bot that fills the hidden "website" field gets a success and nothing is
 * sent), the required fields, then reCAPTCHA. Every visitor value is escaped
 * in the email's HTML.
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

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
    }

    // reCAPTCHA v2 ("I'm not a robot"), enforced only when RECAPTCHA_SECRET_KEY is set.
    const verdict = await verifyRecaptcha(body.recaptchaToken);
    if (verdict !== 'ok') {
      return NextResponse.json({ error: RECAPTCHA_ERRORS[verdict] }, { status: 400 });
    }

    const rows = [
      ...(source ? [{ label: 'Source', value: `mapltech.com${source}` }] : []),
      { label: 'Name', value: name },
      { label: 'Email', value: email, href: `mailto:${email}` },
      ...(phone ? [{ label: 'Phone', value: phone }] : []),
      ...(contactMethod ? [{ label: 'Preferred Contact', value: contactMethod }] : []),
      ...(subject ? [{ label: 'Subject', value: subject }] : []),
      { label: 'Message', value: message },
    ];

    const sent = await sendEmail({
      subject: source
        ? `Inquiry from ${source}: ${name}`
        : subject
          ? `New Contact: ${subject} - from ${name}`
          : `New Contact Form Submission from ${name}`,
      html: `<h2>${escapeHtml('New Contact Form Submission')}</h2>${answersTable(rows)}`,
      text: `${rows
        .filter((row) => row.label !== 'Message')
        .map((row) => `${row.label}: ${row.value}`)
        .join('\n')}\n\nMessage:\n${message}`,
      replyTo: email,
    });

    if (!sent) return NextResponse.json({ error: FAILED }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: FAILED }, { status: 500 });
  }
}
