import { NextRequest, NextResponse } from 'next/server';
import { RESUME_MAX_BYTES, RESUME_MESSAGES } from '@/components/convert/resume';
import { sendEntryEmails } from '../contact/email';
import { inboxEmail, visitorEmail } from '../contact/emailTemplates';
import { recordInHubSpot } from '../contact/hubspot';
import { RECAPTCHA_ERRORS, verifyRecaptcha } from '../contact/verifyRecaptcha';
import { checkResume } from './checkResume';

/**
 * The careers forms: a job application (resume required) and the talent list
 * (resume optional), sent as multipart/form-data so the resume can come with
 * them. Fields: form ("application" | "talent"), name, email, role, location,
 * link, note (the application's) or about (the talent list's), resume (file),
 * website (honeypot), recaptchaToken.
 *
 * Before anything is sent, in order:
 * 1. The request size.
 * 2. The honeypot. A bot gets a success, and nothing is sent.
 * 3. The fields.
 * 4. The resume: its type is read from its bytes, and it must be 4 MB or less.
 * 5. reCAPTCHA.
 *
 * Then the entry goes to HubSpot, into its own form there ("Careers: Job
 * application" or "Careers: Talent list", see ../contact/hubspot.ts), so
 * applicants never mix with sales inquiries there. Then the entry is emailed to contact@mapltech.com (the address every
 * form uses) through Resend, with the applicant as Reply-To, and the applicant
 * gets a confirmation once the entry is kept (../contact/emailTemplates.ts).
 *
 * - The resume is an attachment on that email only. It is not stored
 *   anywhere, HubSpot included. HubSpot's copy names the file.
 * - Subjects are made to filter on: "Job application: <role> (<name>)" and
 *   "Talent list: <name>".
 * - The applicant is told it worked when either HubSpot or the email has the
 *   entry. With a resume attached, only the email counts, because only the
 *   email carries the file. If HubSpot missed the entry, the email says so.
 *
 * Errors name the field they belong to (`field`), so the form can put the
 * words under it.
 */

const FAILED = 'Failed to send message. Please try again.';
// The file, plus room for the text fields and the multipart framing.
const BODY_LIMIT = RESUME_MAX_BYTES + 256 * 1024;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = 'name' | 'email' | 'note' | 'about' | 'resume' | 'link';

function refuse(error: string, status: number, field?: Field) {
  return NextResponse.json(field ? { error, field } : { error }, { status });
}

export async function POST(req: NextRequest) {
  const length = Number(req.headers.get('content-length') ?? 0);
  if (length > BODY_LIMIT) return refuse(RESUME_MESSAGES.size(length), 413, 'resume');
  if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
    return refuse('We could not read that form. Refresh the page and try again.', 415);
  }

  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return refuse('We could not read that form. Refresh the page and try again.', 400);
  }
  const text = (key: string, max = 5000) => {
    const value = data.get(key);
    return typeof value === 'string' ? value.trim().slice(0, max) : '';
  };

  if (text('website')) return NextResponse.json({ success: true });

  const talent = text('form') === 'talent';
  const name = text('name', 200);
  const email = text('email', 254);
  const role = text('role', 200);
  const location = text('location', 200);
  const link = text('link', 500);
  const messageKey: Field = talent ? 'about' : 'note';
  const message = text(messageKey);

  if (!name) return refuse('Enter your name.', 400, 'name');
  if (!EMAIL.test(email)) return refuse('Enter an email address like name@example.com.', 400, 'email');
  if (!message) {
    return refuse(talent ? 'Tell us in a sentence what you do best.' : 'Tell us in a sentence or two about you and the role.', 400, messageKey);
  }
  if (link && !/^https?:\/\/[^\s/]+\.[^\s]+$/i.test(link)) return refuse('Enter a full link, such as linkedin.com/in/your-name.', 400, 'link');

  const resume = await checkResume(data.get('resume'), { required: !talent });
  if (!resume.ok) return refuse(resume.error, resume.status, 'resume');

  // reCAPTCHA v2, enforced only when RECAPTCHA_SECRET_KEY is set: the last gate before the email.
  const verdict = await verifyRecaptcha(data.get('recaptchaToken'));
  if (verdict !== 'ok') return refuse(RECAPTCHA_ERRORS[verdict], 400);

  const file = resume.resume;
  const subject = talent ? `Talent list: ${name}` : `Job application: ${role || 'General application'} (${name})`;
  const rows = [
    ...(talent ? [] : [{ label: 'Role', value: role || 'General application' }]),
    ...(location ? [{ label: 'Location', value: location }] : []),
    { label: 'Name', value: name },
    { label: 'Email', value: email, href: `mailto:${email}` },
    ...(link ? [{ label: 'LinkedIn / portfolio', value: link, href: link }] : []),
    { label: 'Resume', value: file ? `${file.filename} (attached)` : 'None attached' },
    { label: talent ? 'What they do best' : 'About them and the role', value: message },
  ];

  const form = talent ? 'talent_list' : 'careers_application';
  const crm = await recordInHubSpot({
    form,
    email,
    name,
    // The file itself goes only to the inbox.
    rows: rows.map((row) => (row.label === 'Resume' && file ? { ...row, value: `${file.filename} (attached to the email)` } : row)),
  });

  // A resume travels only in the inbox email, so with one attached that email has to go.
  const keptWithoutEmail = crm.ok && !file;
  const sent = await sendEntryEmails(
    inboxEmail({
      form,
      subject,
      who: name,
      email,
      rows,
      crm,
      attachments: file ? [{ filename: file.filename, content: file.content, mimetype: file.mimetype }] : undefined,
    }),
    visitorEmail({ form, to: email, name, resume: Boolean(file) }),
    keptWithoutEmail,
  );
  if (!sent && !keptWithoutEmail) return refuse(FAILED, 500);
  return NextResponse.json({ success: true });
}
