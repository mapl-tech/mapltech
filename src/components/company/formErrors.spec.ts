import { describe, expect, it } from 'vitest';
import { blurErrors, checkField, summaryWords } from './formErrors';

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
});
