import { describe, expect, it } from 'vitest';
import { blurErrors, checkField, summaryWords, typingErrors } from './formErrors';

describe('summaryWords', () => {
  it('counts the flagged fields in words, one convention for one and for many', () => {
    expect(summaryWords(1)).toBe('One field needs attention before this can send.');
    expect(summaryWords(2)).toBe('Two fields need attention before this can send.');
    expect(summaryWords(4)).toBe('Four fields need attention before this can send.');
    expect(summaryWords(9)).toBe('Nine fields need attention before this can send.');
  });

  it('falls back to numerals past nine', () => {
    expect(summaryWords(12)).toBe('12 fields need attention before this can send.');
  });
});

describe('checkField and blurErrors', () => {
  it('says how to fix a field, and only flags a missing value once the field was flagged', () => {
    expect(checkField('', { required: 'Enter your name.' })).toBe('Enter your name.');
    expect(checkField('name@', { email: true })).toBe('Enter an email address like name@example.com.');
    expect(checkField('linkedin.com/in/someone', { url: true })).toBe('');
    const none = {};
    expect(blurErrors(none, 'name', '', { required: 'Enter your name.' })).toBe(none);
    expect(blurErrors({ name: 'Enter your name.' }, 'name', 'Ada', { required: 'Enter your name.' })).toEqual({});
  });

  it('flags a field left empty once a send has been tried', () => {
    expect(blurErrors({}, 'name', '', { required: 'Enter your name.' }, true)).toEqual({ name: 'Enter your name.' });
  });
});

describe('typingErrors', () => {
  const email = { required: 'Enter your email address.', email: true };

  it('clears an error as soon as the value is fixed', () => {
    expect(typingErrors({ email: 'Enter your email address.', name: 'Enter your name.' }, 'email', 'ada@example.com', email)).toEqual({
      name: 'Enter your name.',
    });
  });

  it('never adds or rewords an error while typing (same object back)', () => {
    const flagged = { email: 'Enter your email address.' };
    expect(typingErrors(flagged, 'email', 'ada@exa', email)).toBe(flagged);
    const none = {};
    expect(typingErrors(none, 'email', 'ada@', email)).toBe(none);
  });
});
