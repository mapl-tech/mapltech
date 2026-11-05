import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESUME_MAX_BYTES, RESUME_MESSAGES, cleanResumeName, formatBytes, kindFromHeader, kindFromName } from '@/components/convert/resume';
import { SMTP2GO_URL } from '../contact/email';
import { RECAPTCHA_ERRORS, SITEVERIFY_URL } from '../contact/verifyRecaptcha';
import { checkResume } from './checkResume';

// ------------------------------------------------------------ fixtures: real headers, tiny bodies
const ascii = (text: string) => new TextEncoder().encode(text);
const utf16 = (text: string) => new Uint8Array(Buffer.from(text, 'utf16le'));
const join = (...parts: (Uint8Array | number[])[]) => {
  const arrays = parts.map((part) => (part instanceof Uint8Array ? part : new Uint8Array(part)));
  const out = new Uint8Array(arrays.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of arrays) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP = [0x50, 0x4b, 0x03, 0x04];

const PDF_BYTES = ascii('%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n');
const DOC_BYTES = join(OLE, new Uint8Array(504), utf16('Root Entry'), utf16('WordDocument'), new Uint8Array(64));
const DOCX_BYTES = join(ZIP, new Uint8Array(26), ascii('[Content_Types].xml'), new Uint8Array(32), ascii('word/document.xml'));
const DOCM_BYTES = join(DOCX_BYTES, ascii('word/vbaProject.bin'));
const DOC_MACROS = join(DOC_BYTES, utf16('_VBA_PROJECT'));
const XLSX_BYTES = join(ZIP, new Uint8Array(26), ascii('xl/workbook.xml'));
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
const EXE_BYTES = join(ascii('MZ'), new Uint8Array(64));

const file = (bytes: Uint8Array, name: string, type = '') => new File([bytes as BlobPart], name, { type });

describe('resume rules (shared by the form and the server)', () => {
  it('reads the type a name promises', () => {
    expect(kindFromName('cv.PDF')).toBe('pdf');
    expect(kindFromName('cv.docx')).toBe('docx');
    expect(kindFromName('cv.doc')).toBe('doc');
    expect(kindFromName('cv.pages')).toBeNull();
    expect(kindFromName('cv')).toBeNull();
  });

  it('reads the container from the first bytes', () => {
    expect(kindFromHeader(PDF_BYTES)).toBe('pdf');
    expect(kindFromHeader(join(ascii('\n\n  '), PDF_BYTES))).toBe('pdf');
    expect(kindFromHeader(DOC_BYTES)).toBe('doc');
    expect(kindFromHeader(DOCX_BYTES)).toBe('docx');
    expect(kindFromHeader(PNG_BYTES)).toBeNull();
    expect(kindFromHeader(EXE_BYTES)).toBeNull();
  });

  it('cleans a filename: no path, no odd characters, the proven extension', () => {
    expect(cleanResumeName('C:\\Users\\me\\My CV (final).PDF', 'pdf')).toBe('My CV (final).pdf');
    expect(cleanResumeName('../../etc/passwd<script>.pdf', 'pdf')).toBe('passwd-script.pdf');
    expect(cleanResumeName('Résumé Zoë.docx', 'docx')).toBe('Resume Zoe.docx');
    expect(cleanResumeName('\u0000\u0001.doc', 'doc')).toBe('resume.doc');
    expect(cleanResumeName(`${'a'.repeat(200)}.pdf`, 'pdf')).toBe(`${'a'.repeat(80)}.pdf`);
    expect(cleanResumeName('cv.docx', 'doc')).toBe('cv.doc');
  });

  it('reads sizes as people do', () => {
    expect(formatBytes(512)).toBe('512 bytes');
    expect(formatBytes(186_000)).toBe('182 KB');
    expect(formatBytes(6.2 * 1024 * 1024)).toBe('6.2 MB');
  });
});

describe('checkResume (the server)', () => {
  it('takes a real PDF, DOC and DOCX, with a clean name and the base64 SMTP2GO attaches', async () => {
    const pdf = await checkResume(file(PDF_BYTES, 'Ada Lovelace CV.pdf', 'application/pdf'), { required: true });
    expect(pdf).toMatchObject({ ok: true, resume: { filename: 'Ada Lovelace CV.pdf', mimetype: 'application/pdf', kind: 'pdf' } });
    if (!pdf.ok || !pdf.resume) throw new Error('expected a resume');
    expect(Buffer.from(pdf.resume.fileblob, 'base64').equals(Buffer.from(PDF_BYTES))).toBe(true);

    expect(await checkResume(file(DOC_BYTES, 'cv.doc'), { required: true })).toMatchObject({ ok: true, resume: { kind: 'doc', mimetype: 'application/msword' } });
    expect(await checkResume(file(DOCX_BYTES, 'cv.docx'), { required: true })).toMatchObject({ ok: true, resume: { kind: 'docx' } });
  });

  it('decides by the bytes, not the name or the MIME type', async () => {
    // A picture, a program and a spreadsheet, each dressed as a resume.
    for (const [bytes, name] of [
      [PNG_BYTES, 'cv.pdf'],
      [EXE_BYTES, 'cv.pdf'],
      [XLSX_BYTES, 'cv.docx'],
      [PDF_BYTES, 'cv.docx'],
    ] as const) {
      expect(await checkResume(file(bytes, name, 'application/pdf'), { required: true })).toEqual({ ok: false, error: RESUME_MESSAGES.unreadable, status: 400 });
    }
    // A Word file saved under the other Word extension is still a Word file; the bytes set the name.
    expect(await checkResume(file(DOCX_BYTES, 'cv.doc'), { required: true })).toMatchObject({ ok: true, resume: { filename: 'cv.docx', kind: 'docx' } });
  });

  it('refuses Word files carrying macros', async () => {
    expect(await checkResume(file(DOCM_BYTES, 'cv.docx'), { required: true })).toMatchObject({ ok: false, error: RESUME_MESSAGES.unreadable });
    expect(await checkResume(file(DOC_MACROS, 'cv.doc'), { required: true })).toMatchObject({ ok: false, error: RESUME_MESSAGES.unreadable });
  });

  it('refuses other types by name, an empty file, and anything over 4 MB', async () => {
    expect(await checkResume(file(PDF_BYTES, 'cv.pages'), { required: true })).toEqual({ ok: false, error: RESUME_MESSAGES.type, status: 400 });
    expect(await checkResume(file(new Uint8Array(0), 'cv.pdf'), { required: true })).toEqual({ ok: false, error: RESUME_MESSAGES.empty, status: 400 });
    const big = new Uint8Array(RESUME_MAX_BYTES + 1);
    big.set(PDF_BYTES);
    expect(await checkResume(file(big, 'cv.pdf'), { required: true })).toEqual({ ok: false, error: RESUME_MESSAGES.size(big.length), status: 413 });
    const atCap = new Uint8Array(RESUME_MAX_BYTES);
    atCap.set(PDF_BYTES);
    expect(await checkResume(file(atCap, 'cv.pdf'), { required: true })).toMatchObject({ ok: true });
  });

  it('requires a file only when asked to', async () => {
    const none = file(new Uint8Array(0), '');
    expect(await checkResume(null, { required: true })).toEqual({ ok: false, error: RESUME_MESSAGES.required, status: 400 });
    expect(await checkResume(none, { required: true })).toEqual({ ok: false, error: RESUME_MESSAGES.required, status: 400 });
    expect(await checkResume('a string', { required: true })).toMatchObject({ ok: false, error: RESUME_MESSAGES.required });
    expect(await checkResume(none, { required: false })).toEqual({ ok: true, resume: null });
  });
});

// ------------------------------------------------------------ the route, end to end, with fetch stubbed
describe('POST /api/apply', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('SMTP2GO_API_KEY', 'stub');
    vi.stubEnv('RECAPTCHA_SECRET_KEY', '');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  /** Every outbound call answered: siteverify passes, SMTP2GO accepts. */
  function stubFetch() {
    const fn = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async (url) =>
      Response.json(url === SITEVERIFY_URL ? { success: true } : { data: { succeeded: 1 } }),
    );
    vi.stubGlobal('fetch', fn);
    return fn;
  }
  const smtpBody = (fetch: ReturnType<typeof stubFetch>) => {
    const call = fetch.mock.calls.find(([url]) => url === SMTP2GO_URL);
    return call ? JSON.parse(String(call[1]?.body)) : null;
  };

  function form(fields: Record<string, string>, resume?: File) {
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    if (resume) data.set('resume', resume);
    return data;
  }
  const application = {
    form: 'application',
    role: 'Web Developer, Jamaica',
    location: 'Kingston · Full-time',
    name: 'Ada <b>Lovelace</b>',
    email: 'ada@example.com',
    link: 'https://github.com/ada',
    note: 'I build accessible sites.',
  };

  async function post(body: FormData, headers: Record<string, string> = {}) {
    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');
    return POST(new NextRequest('http://localhost/api/apply', { method: 'POST', body, headers }));
  }

  it('emails the application with the resume attached in SMTP2GO’s shape, and escapes what was typed', async () => {
    const fetch = stubFetch();
    const res = await post(form(application, file(PDF_BYTES, 'My CV.pdf', 'application/pdf')));
    expect(res.status).toBe(200);
    const body = smtpBody(fetch);
    expect(body.attachments).toEqual([
      { filename: 'My CV.pdf', mimetype: 'application/pdf', fileblob: Buffer.from(PDF_BYTES).toString('base64') },
    ]);
    expect(body.to).toEqual(['contact@mapltech.com']);
    expect(body.subject).toBe('Job application: Web Developer, Jamaica (Ada <b>Lovelace</b>)');
    expect(body.custom_headers).toEqual([{ header: 'Reply-To', value: 'ada@example.com' }]);
    expect(body.html_body).toContain('Ada &lt;b&gt;Lovelace&lt;/b&gt;');
    expect(body.html_body).not.toContain('<b>Lovelace</b>');
    expect(body.text_body).toContain('Resume: My CV.pdf (attached)');
  });

  it('names a general application in the subject when no role was chosen', async () => {
    const fetch = stubFetch();
    await post(form({ ...application, role: '' }, file(DOCX_BYTES, 'cv.docx')));
    expect(smtpBody(fetch).subject).toBe('Job application: General application (Ada <b>Lovelace</b>)');
  });

  it('refuses an application without a resume, on the resume field, and sends nothing', async () => {
    const fetch = stubFetch();
    const res = await post(form(application));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: RESUME_MESSAGES.required, field: 'resume' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses a file that is not what it says, and sends nothing', async () => {
    const fetch = stubFetch();
    const res = await post(form(application, file(EXE_BYTES, 'cv.pdf', 'application/pdf')));
    expect(await res.json()).toEqual({ error: RESUME_MESSAGES.unreadable, field: 'resume' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses a body over the cap before reading it', async () => {
    const fetch = stubFetch();
    const res = await post(form(application, file(PDF_BYTES, 'cv.pdf')), { 'content-length': String(RESUME_MAX_BYTES + 512 * 1024) });
    expect(res.status).toBe(413);
    expect((await res.json()).field).toBe('resume');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('takes the talent list without a resume, and with one', async () => {
    const fetch = stubFetch();
    const talent = { form: 'talent', name: 'Grace Hopper', email: 'grace@example.com', about: 'Compilers.' };
    expect((await post(form(talent))).status).toBe(200);
    expect(smtpBody(fetch).attachments).toBeUndefined();
    expect(smtpBody(fetch).subject).toBe('Talent list: Grace Hopper');
    fetch.mockClear();
    expect((await post(form(talent, file(DOC_BYTES, 'grace.doc')))).status).toBe(200);
    expect(smtpBody(fetch).attachments[0]).toMatchObject({ filename: 'grace.doc', mimetype: 'application/msword' });
  });

  it('names the field for missing details', async () => {
    stubFetch();
    expect(await (await post(form({ ...application, name: '' }, file(PDF_BYTES, 'cv.pdf')))).json()).toMatchObject({ field: 'name' });
    expect(await (await post(form({ ...application, email: 'ada@' }, file(PDF_BYTES, 'cv.pdf')))).json()).toMatchObject({ field: 'email' });
    expect(await (await post(form({ ...application, note: ' ' }, file(PDF_BYTES, 'cv.pdf')))).json()).toMatchObject({ field: 'note' });
    expect(await (await post(form({ ...application, link: 'not a link' }, file(PDF_BYTES, 'cv.pdf')))).json()).toMatchObject({ field: 'link' });
  });

  it('gives a bot that fills the honeypot a success and emails nothing', async () => {
    const fetch = stubFetch();
    const res = await post(form({ ...application, website: 'spam.example' }, file(PDF_BYTES, 'cv.pdf')));
    expect(res.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('checks reCAPTCHA before emailing once the secret is set', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secret');
    const fetch = stubFetch();
    const res = await post(form(application, file(PDF_BYTES, 'cv.pdf')));
    expect(await res.json()).toEqual({ error: RECAPTCHA_ERRORS.missing });
    expect(fetch).not.toHaveBeenCalled();

    const ok = await post(form({ ...application, recaptchaToken: 'token' }, file(PDF_BYTES, 'cv.pdf')));
    expect(ok.status).toBe(200);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([SITEVERIFY_URL, SMTP2GO_URL]);
  });

  it('says so when SMTP2GO refuses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ data: { error: 'bad key' } }, { status: 400 })));
    const res = await post(form(application, file(PDF_BYTES, 'cv.pdf')));
    expect(res.status).toBe(500);
  });

  it('refuses a JSON body (this route takes the multipart form)', async () => {
    const fetch = stubFetch();
    const { POST } = await import('./route');
    const { NextRequest } = await import('next/server');
    const res = await POST(
      new NextRequest('http://localhost/api/apply', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } }),
    );
    expect(res.status).toBe(415);
    expect(fetch).not.toHaveBeenCalled();
  });
});
