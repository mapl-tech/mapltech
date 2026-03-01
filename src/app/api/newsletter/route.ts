import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    const sender = process.env.SMTP2GO_SENDER || 'contact@mapltech.com';

    const res = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.SMTP2GO_API_KEY,
        to: ['contact@mapltech.com'],
        sender,
        subject: `New Newsletter Subscriber: ${email}`,
        html_body: `
          <h2>New Newsletter Subscriber</h2>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p>This person subscribed via the website footer.</p>
        `,
        text_body: `New newsletter subscriber: ${email}`,
        custom_headers: [
          { header: 'Reply-To', value: email },
        ],
      }),
    });

    const result = await res.json();

    if (!res.ok || result.data?.error) {
      console.error('SMTP2GO error:', result);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
