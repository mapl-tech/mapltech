/**
 * Resume rules shared by the careers forms (FileField, in the browser) and
 * /api/apply (on the server), so the two can never disagree: the types we
 * take, the size cap, the words for each refusal, and a clean filename.
 *
 * PDF, DOC or DOCX, at most 4 MB. Netlify caps a function's request at about
 * 6 MB and carries a file in it as base64 (a third larger), so 4 MB is the
 * most that always arrives. The type is decided by the file's first bytes;
 * the name and the browser's MIME type only say what to expect.
 */

export const RESUME_MAX_BYTES = 4 * 1024 * 1024;

export type ResumeKind = 'pdf' | 'doc' | 'docx';

export const RESUME_TYPES: Record<ResumeKind, { ext: string; mime: string; label: string }> = {
  pdf: { ext: 'pdf', mime: 'application/pdf', label: 'PDF' },
  doc: { ext: 'doc', mime: 'application/msword', label: 'DOC' },
  docx: { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'DOCX' },
};

/** For <input accept>: extensions first (iOS and Android pick by them), then the MIME types. */
export const RESUME_ACCEPT = [
  ...Object.values(RESUME_TYPES).map((type) => `.${type.ext}`),
  ...Object.values(RESUME_TYPES).map((type) => type.mime),
].join(',');

/** "182 KB", "3.4 MB": the size as a person reads it (1 KB = 1,024 bytes, as file managers show it). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

export const RESUME_MESSAGES = {
  required: 'Attach your resume as a PDF or Word file.',
  type: 'Attach your resume as a PDF, DOC or DOCX file.',
  empty: 'That file is empty. Choose your resume again.',
  unreadable: 'That file does not open as a PDF or Word document. Save your resume as a PDF and attach that.',
  size: (bytes: number) => `That file is ${formatBytes(bytes)}. Attach a resume of 4 MB or less (a PDF export is usually smaller).`,
} as const;

/** What the name promises, by its extension; null for anything else. */
export function kindFromName(name: string): ResumeKind | null {
  const ext = /\.([a-z0-9]+)$/i.exec(name.trim())?.[1]?.toLowerCase();
  return ext === 'pdf' || ext === 'doc' || ext === 'docx' ? ext : null;
}

const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP = [0x50, 0x4b, 0x03, 0x04];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

function startsWith(bytes: Uint8Array, signature: number[], at = 0): boolean {
  return signature.every((byte, i) => bytes[at + i] === byte);
}

/**
 * The container the first bytes show: a PDF (its "%PDF-" header may follow a
 * little leading junk, so the first 1,024 bytes are searched), an OLE
 * compound file (what a .doc is) or a ZIP (what a .docx is). This is the
 * browser's quick check; the server confirms the Word ones look inside.
 */
export function kindFromHeader(head: Uint8Array): ResumeKind | null {
  if (startsWith(head, OLE)) return 'doc';
  if (startsWith(head, ZIP)) return 'docx';
  const end = Math.min(head.length, 1024) - PDF.length;
  for (let i = 0; i <= end; i++) if (startsWith(head, PDF, i)) return 'pdf';
  return null;
}

/**
 * A filename safe to put in an email: no path, no control or odd characters,
 * at most 80 characters before the extension, and the extension the bytes
 * proved ("My CV (final).PDF" as a PDF -> "My CV (final).pdf").
 */
export function cleanResumeName(name: string, kind: ResumeKind): string {
  const base = name.split(/[\\/]/).pop() ?? '';
  const stem = base
    .replace(/\.[^.]*$/, '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ._()-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s.-]+|[\s.-]+$/g, '')
    .slice(0, 80)
    .trim();
  return `${stem || 'resume'}.${RESUME_TYPES[kind].ext}`;
}

/** The bytes and the name agree: the same type, or both Word (apps mix .doc and .docx up). */
export function kindsAgree(fromBytes: ResumeKind | null, fromName: ResumeKind | null): boolean {
  if (!fromBytes || !fromName) return false;
  return fromBytes === fromName || (fromBytes !== 'pdf' && fromName !== 'pdf');
}

/**
 * The browser's check as a file is chosen, in the order a person would fix
 * things: empty, too big, the wrong type by name, then bytes that are not
 * what the name says. Returns the message, or null when the file can go.
 */
export async function resumeProblem(file: File): Promise<string | null> {
  if (file.size === 0) return RESUME_MESSAGES.empty;
  if (file.size > RESUME_MAX_BYTES) return RESUME_MESSAGES.size(file.size);
  const named = kindFromName(file.name);
  if (!named) return RESUME_MESSAGES.type;
  try {
    const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
    return kindsAgree(kindFromHeader(head), named) ? null : RESUME_MESSAGES.unreadable;
  } catch {
    // Unreadable here (a cloud file not yet downloaded): let the server decide.
    return null;
  }
}
