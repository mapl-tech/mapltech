import { describe, expect, it } from 'vitest';
import { SERVICE_META } from '@/lib/estimate';
import { KIND_OPTIONS, composeBrief, readPrefill } from './brief';

describe('the brief’s first question', () => {
  it('gives every answer one plain line, so none is only a name and a price', () => {
    for (const option of KIND_OPTIONS) {
      expect(option.detail, option.key).toBeTruthy();
      // One line of the site's own words: a phrase, not a sentence or two.
      expect(option.detail, option.key).not.toMatch(/[.!?]$/);
      expect(option.detail!.split(/\s+/).length, option.detail).toBeLessThanOrEqual(8);
    }
  });

  it('names the four services canonically, each with its public floor price', () => {
    const services = KIND_OPTIONS.filter((option) => option.key in SERVICE_META);
    expect(services.map((option) => option.label)).toEqual(
      Object.values(SERVICE_META).map((meta) => meta.label),
    );
    for (const option of services) expect(option.price, option.key).toMatch(/^From \$\d/);
  });
});

describe('prefill and composition', () => {
  it('opens a service link on that service, and a bundle link on the partnership', () => {
    expect(readPrefill('?svc=web')).toMatchObject({ kind: 'web', source: 'service' });
    expect(readPrefill('?svc=web&size.web=growth')).toMatchObject({ kind: 'web', size: 'growth', source: 'estimate' });
    expect(readPrefill('?bundle=full-systems-partner')).toMatchObject({ kind: 'partner', source: 'bundle' });
    expect(readPrefill('?nothing=1')).toBeNull();
  });

  it('writes the subject from the answers', () => {
    const { subject, message } = composeBrief(
      { kind: 'tools', size: null, details: '', name: 'A', email: 'a@b.co', company: '', reply: 'email', phone: '' },
      null,
    );
    expect(subject).toBe('Brief: Custom Internal Tools, Not sure yet');
    expect(message).toContain('Details:\nNo details added.');
  });
});
