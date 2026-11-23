import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stubServices } from '../../../../tests/stubs/services';
import { USER_AGENT } from './email';
import {
  HUBSPOT_ACCOUNT_ID,
  HUBSPOT_FORMS,
  HUBSPOT_SUBMIT_URL,
  messageText,
  recordInHubSpot,
  submissionFields,
  type CrmEntry,
} from './hubspot';

const TOKEN = 'pat-test-stub';
const entry: CrmEntry = {
  form: 'bio_call_request',
  email: ' Ada@Example.com ',
  name: 'Ada  King Lovelace',
  phone: ' +44 20 7946 0000 ',
  rows: [
    { label: 'Source', value: 'bio.mapltech.com' },
    { label: 'Name', value: 'Ada King Lovelace' },
    { label: 'Email', value: 'Ada@Example.com' },
    { label: 'Phone', value: '+44 20 7946 0000' },
    { label: 'Subject', value: 'A booking system' },
    { label: 'Message', value: 'Line one\nLine two' },
  ],
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('the forms in HubSpot', () => {
  it('gives every site form a HubSpot form of its own, with its own name', () => {
    const forms = Object.values(HUBSPOT_FORMS);
    expect(forms).toHaveLength(9);
    expect(new Set(forms.map(({ id }) => id)).size).toBe(forms.length);
    expect(new Set(forms.map(({ name }) => name)).size).toBe(forms.length);
    for (const { id } of forms) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

describe('what HubSpot is sent', () => {
  it('the contact’s own fields: the email lowercased, the name split at the first space, the phone trimmed', () => {
    const fields = submissionFields(entry);
    expect(fields.every((field) => field.objectTypeId === '0-1')).toBe(true);
    expect(Object.fromEntries(fields.map(({ name, value }) => [name, value]))).toEqual({
      email: 'ada@example.com',
      firstname: 'Ada',
      lastname: 'King Lovelace',
      phone: '+44 20 7946 0000',
      message: 'Source: bio.mapltech.com\nSubject: A booking system\n\nMessage:\nLine one\nLine two',
    });
  });

  it('leaves out what was not given', () => {
    expect(submissionFields({ email: 'sub@example.com', rows: [] })).toEqual([{ objectTypeId: '0-1', name: 'email', value: 'sub@example.com' }]);
    expect(submissionFields({ email: 'cher@example.com', name: 'Cher', phone: ' ', rows: [] }).map(({ name }) => name)).toEqual(['email', 'firstname']);
  });

  it('a message of every other answer, one per line, a multi-line answer under its label', () => {
    expect(messageText([{ label: 'Message', value: 'Line one\nLine two' }])).toBe('Message:\nLine one\nLine two');
    expect(messageText([{ label: 'Role', value: 'Web Developer' }, { label: 'Resume', value: 'cv.pdf (attached to the email)' }])).toBe(
      'Role: Web Developer\nResume: cv.pdf (attached to the email)',
    );
    expect(messageText([{ label: 'Email', value: 'a@b.co' }])).toBe('');
  });

});

describe('recordInHubSpot', () => {
  it('submits the entry to its form’s own form in HubSpot, with the key', async () => {
    const services = stubServices();
    expect(await recordInHubSpot(entry, TOKEN)).toEqual({ ok: true });
    const [call] = services.submissions();
    expect(services.calls()).toHaveLength(1);
    expect(call.url).toBe(`${HUBSPOT_SUBMIT_URL}/${HUBSPOT_ACCOUNT_ID}/${HUBSPOT_FORMS.bio_call_request.id}`);
    expect(call.headers).toEqual({ Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': USER_AGENT });
    expect(call.body).toEqual({ fields: submissionFields(entry) });
  });

  it('keeps each form’s entries apart', async () => {
    const services = stubServices();
    await recordInHubSpot({ ...entry, form: 'referral' }, TOKEN);
    await recordInHubSpot({ ...entry, form: 'newsletter' }, TOKEN);
    expect(services.submissions().map(({ url }) => url.split('/').pop())).toEqual([HUBSPOT_FORMS.referral.id, HUBSPOT_FORMS.newsletter.id]);
  });

  it('says what went wrong in HubSpot’s own words when it refuses the entry', async () => {
    stubServices({
      hubspot: {
        status: 400,
        body: { status: 'error', message: 'The request is not valid', errors: [{ message: "Error in 'fields.email'. Invalid email address", errorType: 'INVALID_EMAIL' }] },
      },
    });
    expect(await recordInHubSpot(entry, TOKEN)).toEqual({ ok: false, problem: "HubSpot refused the entry (400: Error in 'fields.email'. Invalid email address)" });

    stubServices({ hubspot: { status: 403, body: { status: 'error', message: 'This app hasn’t been granted all required scopes' } } });
    expect(await recordInHubSpot(entry, TOKEN)).toEqual({ ok: false, problem: 'HubSpot refused the entry (403: This app hasn’t been granted all required scopes)' });

    stubServices({ hubspot: { status: 503 } });
    expect(await recordInHubSpot(entry, TOKEN)).toEqual({ ok: false, problem: 'HubSpot refused the entry (503)' });
    expect(console.error).toHaveBeenCalledWith('HubSpot refused the entry (503)');
  });

  it('HubSpot unreachable, or no token: a problem, never a throw', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('fetch failed'))));
    expect(await recordInHubSpot(entry, TOKEN)).toEqual({ ok: false, problem: 'HubSpot did not answer' });

    const services = stubServices();
    expect(await recordInHubSpot(entry, '')).toEqual({ ok: false, problem: 'HUBSPOT_ACCESS_TOKEN is not set on this server' });
    expect(services.fetch).not.toHaveBeenCalled();
  });
});
