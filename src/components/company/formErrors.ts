/**
 * Field checks for the careers forms. Messages say how to fix the problem,
 * never just that there is one. Required fields are checked on submit (and on
 * blur once flagged, or once a send has been tried); format problems are
 * checked when the field is left. While the visitor types, an error only ever
 * clears (`typingErrors`), so the layout settles before the next press.
 */

export interface FieldRule {
  /** Message when the field is empty; omit for optional fields. */
  required?: string;
  email?: boolean;
  url?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkField(value: string, rule: FieldRule): string {
  const v = value.trim();
  if (!v) return rule.required ?? '';
  if (rule.email && !EMAIL.test(v)) return 'Enter an email address like name@example.com.';
  if (rule.url) {
    try {
      const parsed = new URL(/^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`);
      if (!parsed.hostname.includes('.')) return 'Enter a full link, such as linkedin.com/in/your-name.';
    } catch {
      return 'Enter a full link, such as linkedin.com/in/your-name.';
    }
  }
  return '';
}

/** Validate every rule against the form; returns field name -> message for the failures only. */
export function checkForm(data: FormData, rules: Record<string, FieldRule>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [name, rule] of Object.entries(rules)) {
    const value = data.get(name);
    const message = checkField(typeof value === 'string' ? value : '', rule);
    if (message) errors[name] = message;
  }
  return errors;
}

const COUNT_WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

/**
 * The error summary's words for the fields still flagged, counted in words
 * from one to nine as the site's prose counts ("four short questions"):
 * "One field needs attention…", "Three fields need attention…". It counts
 * down as fields are fixed.
 */
export function summaryWords(count: number): string {
  const number = COUNT_WORDS[count - 1] ?? String(count);
  return `${number} ${count === 1 ? 'field needs' : 'fields need'} attention before this can send.`;
}

/**
 * One field's error after it is left: a format problem as soon as there is
 * a value, a missing required value only if the field was already flagged
 * or a send has been tried (`attempted`). Returns `errors` itself when
 * nothing changed, so a form can tell "a field changed since the send was
 * refused" by identity.
 */
export function blurErrors(
  errors: Record<string, string>,
  name: string,
  value: string,
  rule: FieldRule,
  attempted = false,
): Record<string, string> {
  const message = checkField(value, rule);
  const next = message && (value.trim() || errors[name] || attempted) ? message : '';
  if ((errors[name] ?? '') === next) return errors;
  const updated = { ...errors };
  if (next) updated[name] = next;
  else delete updated[name];
  return updated;
}

/**
 * One field's error while the visitor types in it: it clears as soon as the
 * value is fixed, and is never added or reworded (a new problem waits for the
 * blur or the next send). Returns `errors` itself when nothing changed.
 */
export function typingErrors(errors: Record<string, string>, name: string, value: string, rule: FieldRule): Record<string, string> {
  if (!errors[name] || checkField(value, rule)) return errors;
  const updated = { ...errors };
  delete updated[name];
  return updated;
}

/** "https://" in front of a bare domain so the link in the email is clickable. */
export function normaliseUrl(value: string): string {
  const v = value.trim();
  if (!v) return '';
  return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
}
