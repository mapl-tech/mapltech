'use client';

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import FieldError from './FieldError';
import { RESUME_ACCEPT, RESUME_TYPES, formatBytes, kindFromName, resumeProblem } from './resume';
import forms from './forms.module.scss';
import styles from './FileField.module.scss';

/**
 * The resume field for the careers forms: a visible label, the rule under it
 * (PDF, DOC or DOCX, up to 4 MB), and a drop zone that is a native file input
 * underneath, so it works the same for a mouse, a finger and a keyboard.
 *
 * - Empty: the real <input type="file"> lies over the whole zone, invisible,
 *   so a click or tap anywhere opens the picker (iOS Safari and Android
 *   included) and a file dropped on it lands natively. Keyboard users Tab to
 *   it and press Space or Enter; its ring is drawn on the zone.
 * - Chosen: the file's name and size, then "Replace" (opens the picker) and
 *   "Remove" (focus returns to the field), both 44px. A file dropped on the
 *   zone replaces it.
 * - Checked as it is chosen (resume.ts: empty, over 4 MB, not PDF/DOC/DOCX,
 *   bytes that are not what the name says). A refused file is not taken (any
 *   earlier choice stays) and the reason is announced under the field; the
 *   server checks again, by the bytes, before anything is emailed.
 * - The zone keeps one height whether empty or chosen (taller where the
 *   buttons wrap under the name), so choosing a file never moves the form.
 *
 * The file lives in the form's state (`file`), not in the input: the form
 * appends it to what it sends. The input has no name, so FormData(form)
 * never picks up a refused file.
 */

interface FileFieldProps {
  id: string;
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  /** The form's error for this field (missing on send, or the server's words). */
  error?: string;
}

export default function FileField({ id, label, required = false, file, onChange, error }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [refused, setRefused] = useState<{ message: string; n: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [said, setSaid] = useState('');
  const focusAfterRemove = useRef(false);

  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const shown = refused?.message ?? error;

  useEffect(() => {
    if (!focusAfterRemove.current || file) return;
    focusAfterRemove.current = false;
    inputRef.current?.focus();
  }, [file]);

  const take = async (next: File | undefined) => {
    if (!next) return;
    const problem = await resumeProblem(next);
    // Clear the input either way: the state holds the file, and the same file can be chosen again.
    if (inputRef.current) inputRef.current.value = '';
    if (problem) {
      setRefused((current) => ({ message: problem, n: (current?.n ?? 0) + 1 }));
      setSaid('');
      return;
    }
    setRefused(null);
    setSaid(`Attached ${next.name}, ${formatBytes(next.size)}.`);
    onChange(next);
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => void take(event.target.files?.[0]);

  // Drops on the chosen zone (the empty one takes drops on its input natively).
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    setDragging(false);
    if (!file) return;
    event.preventDefault();
    void take(event.dataTransfer.files?.[0]);
  };
  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    if (file) event.preventDefault();
    if (!dragging) setDragging(true);
  };

  const remove = () => {
    focusAfterRemove.current = true;
    setRefused(null);
    setSaid('Resume removed.');
    onChange(null);
  };

  const kind = file ? kindFromName(file.name) : null;
  const describedBy = [hintId, shown ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className={forms.field}>
      <label id={`${id}-label`} htmlFor={id} className={forms.label}>
        {label}
        {required ? null : <span className={forms.optional}> (optional)</span>}
      </label>
      <p id={hintId} className={forms.hint}>
        PDF, DOC or DOCX, up to 4 MB.
      </p>

      <div
        className={styles.zone}
        data-state={file ? 'chosen' : 'empty'}
        data-drag={dragging ? '' : undefined}
        data-invalid={shown ? '' : undefined}
        onDragEnter={onDragOver}
        onDragOver={onDragOver}
        onDragLeave={(event) => {
          // Moving between the zone's own parts is not leaving it.
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={RESUME_ACCEPT}
          className={styles.input}
          onChange={onPick}
          // Empty, the zone's own words ("Choose a file") are part of the name, so a speech user can say them (WCAG 2.5.3).
          aria-labelledby={file ? `${id}-label` : `${id}-label ${id}-prompt`}
          aria-describedby={describedBy}
          aria-invalid={shown ? true : undefined}
          aria-required={required || undefined}
          // Chosen: "Replace" opens the picker, so the input leaves the Tab order.
          tabIndex={file ? -1 : undefined}
        />
        {file ? (
          <div className={styles.chosen}>
            <span className={styles.icon} aria-hidden="true">
              <DocIcon />
            </span>
            <span className={styles.meta}>
              <span className={styles.name}>{file.name}</span>
              <span className={styles.size}>
                {kind ? `${RESUME_TYPES[kind].label}, ` : ''}
                {formatBytes(file.size)}
              </span>
            </span>
            <span className={styles.actions}>
              <button type="button" className={styles.action} onClick={() => inputRef.current?.click()} aria-describedby={hintId}>
                Replace<span className="visually-hidden"> {file.name}</span>
              </button>
              <button type="button" className={styles.action} onClick={remove}>
                Remove<span className="visually-hidden"> {file.name}</span>
              </button>
            </span>
          </div>
        ) : (
          // What the input under it does, drawn; the input carries the name and state for assistive tech.
          <span className={styles.prompt} aria-hidden="true">
            <span className={styles.icon}>
              <UploadIcon />
            </span>
            <span className={styles.promptText}>
              <span id={`${id}-prompt`} className={styles.choose}>
                Choose a file
              </span>
              <span className={styles.drop}> or drop it here</span>
            </span>
          </span>
        )}
      </div>

      {/* What changed, said once: the field's own name and state are read from the input. */}
      <p className="visually-hidden" role="status">
        {said}
      </p>
      {shown ? (
        <FieldError key={refused?.n ?? 'form'} id={errorId} alert={Boolean(refused)}>
          {shown}
        </FieldError>
      ) : null}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5" />
      <path d="M4 14.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}
