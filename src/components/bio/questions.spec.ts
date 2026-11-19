import { describe, expect, it } from 'vitest';
import {
  QUESTIONS,
  answerError,
  composeLead,
  firstName,
  firstUnanswered,
  isPhone,
  questionById,
  questionTitle,
  readUtm,
  videoLine,
  type Answers,
} from './questions';

const complete: Answers = {
  build: 'booking',
  deadline: '1-3',
  details: 'Let guests pick a tour date and pay a deposit.',
  budget: '3.5-10',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
};

describe('the call request questions', () => {
  it('asks the video’s two questions first and the contact details last', () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual(['build', 'deadline', 'details', 'budget', 'name', 'email', 'phone', 'business']);
    expect(QUESTIONS[0].kind).toBe('choice');
    expect(QUESTIONS[1].kind).toBe('choice');
  });

  it('says the budget floor the site publishes', () => {
    expect(questionById('budget').hint).toContain('$3,500');
  });

  it('uses the first name in later questions, and reads well without one', () => {
    const email = questionById('email');
    expect(questionTitle(email, { name: '  Ada   Lovelace ' })).toBe('What’s your email, Ada?');
    expect(questionTitle(email, {})).toBe('What’s your email?');
    expect(firstName('')).toBe('');
  });

  it('needs every required answer, and lets the optional ones stay empty', () => {
    expect(firstUnanswered({})).toBe(0);
    expect(firstUnanswered({ ...complete, deadline: undefined })).toBe(1);
    expect(firstUnanswered(complete)).toBe(-1);
    expect(answerError(questionById('phone'), '')).toBe('');
    expect(answerError(questionById('business'), '   ')).toBe('');
  });

  it('refuses a choice that is not on the list', () => {
    expect(answerError(questionById('build'), 'spaceship')).not.toBe('');
    expect(answerError(questionById('build'), 'website')).toBe('');
  });

  it('checks emails and phone numbers with words that say how to fix them', () => {
    expect(answerError(questionById('email'), 'ada@example')).toMatch(/name@company\.com/);
    expect(answerError(questionById('email'), 'ada@example.com')).toBe('');
    expect(isPhone('+234 803 123 4567')).toBe(true);
    expect(isPhone('(416) 555-0123')).toBe(true);
    expect(isPhone('12345')).toBe(false);
    expect(isPhone('call me')).toBe(false);
    expect(answerError(questionById('phone'), '555')).toMatch(/country code/);
  });
});

describe('the lead email', () => {
  it('puts the answers first, in the order asked, then the source and the video', () => {
    const lead = composeLead(
      { ...complete, phone: '+1 416 555 0123' },
      { landing: 'https://bio.mapltech.com/?utm_source=instagram', referrer: 'https://l.instagram.com/', utm: { utm_source: 'instagram', utm_medium: 'bio' } },
      { furthest: 1, withSound: true },
    );
    expect(lead.name).toBe('Ada Lovelace');
    expect(lead.email).toBe('ada@example.com');
    expect(lead.phone).toBe('+1 416 555 0123');
    expect(lead.subject).toBe('A booking system · In 1 to 3 months · $3,500 to $10,000');
    const lines = lead.message.split('\n');
    expect(lines[0]).toBe('Building: A booking system');
    expect(lead.message).toContain('Business or website: Not given');
    expect(lead.message).toContain('What it should do:\nLet guests pick a tour date and pay a deposit.');
    expect(lead.message).toContain('Video: Watched to the end, with sound');
    expect(lead.message).toContain('Campaign: utm_source=instagram, utm_medium=bio');
    expect(lead.message).toContain('Referrer: https://l.instagram.com/');
  });

  it('leaves the phone out when none was given, and says when the video was not played', () => {
    const lead = composeLead(complete, null, null);
    expect(lead.phone).toBeUndefined();
    expect(lead.message).toContain('Video: Not played');
    expect(lead.message).not.toContain('Campaign:');
  });

  it('describes partial and muted viewing', () => {
    expect(videoLine({ furthest: 0.42, withSound: false })).toBe('Watched 42%, muted');
  });

  it('reads only the UTM tags from the landing query', () => {
    expect(readUtm('?utm_source=tiktok&utm_campaign=nov&fbclid=abc&email=x@y.z')).toEqual({ utm_source: 'tiktok', utm_campaign: 'nov' });
    expect(readUtm('')).toBeUndefined();
  });
});
