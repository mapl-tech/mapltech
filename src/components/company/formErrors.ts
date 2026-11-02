/**
 * Field checks for the careers forms. Messages say how to fix the problem,
 * never just that there is one. Required fields are checked on submit (and on
 * blur once flagged); format problems are checked when the field is left.
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

/** "https://" in front of a bare domain so the link in the email is clickable. */
export function normaliseUrl(value: string): string {
  const v = value.trim();
  if (!v) return '';
  return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
}
