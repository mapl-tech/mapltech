import { NextRequest, NextResponse } from 'next/server';

// Verify a reCAPTCHA v3 token with Google. Enforced only when the secret is
// configured; without it the form works unprotected (dev/preview safe).
async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    // v3 returns a 0-1 score; 0.5 is Google's recommended default threshold
    return data.success === true && data.action === 'contact' && (data.score ?? 0) >= 0.5;
  } catch (err) {
    // Google unreachable: fail open so a transient outage never blocks real leads
    console.error('reCAPTCHA verification unavailable:', err);
    return true;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, contactMethod, subject, message, recaptchaToken } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (!(await verifyRecaptcha(recaptchaToken))) {
      return NextResponse.json(
        { error: 'Verification failed. Please refresh the page and try again.' },
        { status: 400 }
      );
    }

    const subjectLine = subject
      ? `New Contact: ${subject} - from ${name}`
      : `New Contact Form Submission from ${name}`;

    const htmlBody = `
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; vertical-align: top;">Name</td>
          <td style="padding: 8px 12px;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; vertical-align: top;">Email</td>
          <td style="padding: 8px 12px;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        ${phone ? `<tr><td style="padding: 8px 12px; font-weight: bold; vertical-align: top;">Phone</td><td style="padding: 8px 12px;">${phone}</td></tr>` : ''}
        ${contactMethod ? `<tr><td style="padding: 8px 12px; font-weight: bold; vertical-align: top;">Preferred Contact</td><td style="padding: 8px 12px;">${contactMethod}</td></tr>` : ''}
        ${subject ? `<tr><td style="padding: 8px 12px; font-weight: bold; vertical-align: top;">Subject</td><td style="padding: 8px 12px;">${subject}</td></tr>` : ''}
        <tr>
          <td style="padding: 8px 12px; font-weight: bold; vertical-align: top;">Message</td>
          <td style="padding: 8px 12px; white-space: pre-wrap;">${message}</td>
        </tr>
      </table>
    `;

    const textBody = `Name: ${name}\nEmail: ${email}\n${phone ? `Phone: ${phone}\n` : ''}${contactMethod ? `Preferred Contact: ${contactMethod}\n` : ''}${subject ? `Subject: ${subject}\n` : ''}\nMessage:\n${message}`;

    const sender = process.env.SMTP2GO_SENDER || 'contact@mapltech.com';

    const res = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.SMTP2GO_API_KEY,
        to: ['contact@mapltech.com'],
        sender,
        subject: subjectLine,
        html_body: htmlBody,
        text_body: textBody,
        custom_headers: [
          { header: 'Reply-To', value: email },
        ],
      }),
    });

    const result = await res.json();

    if (!res.ok || result.data?.error) {
      console.error('SMTP2GO error:', result);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
