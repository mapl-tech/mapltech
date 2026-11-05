import {
  RESUME_MAX_BYTES,
  RESUME_MESSAGES,
  RESUME_TYPES,
  cleanResumeName,
  kindFromHeader,
  kindFromName,
  kindsAgree,
  type ResumeKind,
} from '@/components/convert/resume';

/**
 * The server's check of an uploaded resume, before anything is emailed. The
 * type is decided by the bytes, never by the name or the browser's MIME type:
 *
 * - PDF: "%PDF-" within the first 1,024 bytes.
 * - DOC: an OLE compound file holding a "WordDocument" stream, and no VBA
 *   project (macros).
 * - DOCX: a ZIP holding "word/document.xml", and no "vbaProject.bin" (a
 *   macro-enabled .docm renamed).
 *
 * The name's extension, when it has one we take, must agree with the bytes.
 * The result carries a clean filename and the base64 SMTP2GO attaches.
 */

export interface ResumeAttachment {
  filename: string;
  mimetype: string;
  /** Base64 of the file's bytes: SMTP2GO's `fileblob`. */
  fileblob: string;
  bytes: number;
  kind: ResumeKind;
}

export type ResumeCheck = { ok: true; resume: ResumeAttachment | null } | { ok: false; error: string; status: 400 | 413 };

const utf16 = (text: string) => Buffer.from(text, 'utf16le');

/** Look inside the container the header announced. */
function confirmKind(buffer: Buffer, kind: ResumeKind): boolean {
  if (kind === 'pdf') return true;
  if (kind === 'doc') return buffer.includes(utf16('WordDocument')) && !buffer.includes(utf16('_VBA_PROJECT'));
  return buffer.includes(Buffer.from('word/document.xml')) && !buffer.includes(Buffer.from('vbaProject.bin'));
}

/** `value` is whatever FormData held under "resume": a File, a string, or nothing. */
export async function checkResume(value: FormDataEntryValue | null, { required }: { required: boolean }): Promise<ResumeCheck> {
  const file = value && typeof value !== 'string' ? value : null;
  // A form sends an empty, nameless part when no file was chosen.
  if (!file || (file.size === 0 && !file.name)) {
    return required ? { ok: false, error: RESUME_MESSAGES.required, status: 400 } : { ok: true, resume: null };
  }
  if (file.size > RESUME_MAX_BYTES) return { ok: false, error: RESUME_MESSAGES.size(file.size), status: 413 };
  if (file.size === 0) return { ok: false, error: RESUME_MESSAGES.empty, status: 400 };

  const named = kindFromName(file.name);
  if (!named) return { ok: false, error: RESUME_MESSAGES.type, status: 400 };

  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = kindFromHeader(buffer.subarray(0, 1024));
  // A .doc and a .docx are often confused by the apps that save them; the bytes decide which.
  if (!kind || !kindsAgree(kind, named) || !confirmKind(buffer, kind)) return { ok: false, error: RESUME_MESSAGES.unreadable, status: 400 };

  return {
    ok: true,
    resume: {
      filename: cleanResumeName(file.name, kind),
      mimetype: RESUME_TYPES[kind].mime,
      fileblob: buffer.toString('base64'),
      bytes: file.size,
      kind,
    },
  };
}
