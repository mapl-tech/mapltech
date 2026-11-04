import { describe, expect, it } from 'vitest';
import { CLIENTS_LINE } from '@/components/flagship/content';
import { STORIES, heroTags, otherClientsLine } from './stories';

describe('the case hero’s tags', () => {
  // Echoes in other words ("Staffing and recruitment" beside "search and
  // staffing") are named per story in `tagsInFacts`; this catches the literal ones.
  it('never repeat a fact word for word, on any case', () => {
    for (const story of STORIES) {
      const facts = story.facts.map((fact) => fact.detail.toLowerCase());
      for (const tag of heroTags(story)) {
        expect(
          facts.find((detail) => detail.includes(tag.toLowerCase())),
          `${story.slug}: "${tag}"`,
        ).toBeUndefined();
      }
    }
  });

  it('leave out only tags the story has (a renamed tag would come back)', () => {
    for (const story of STORIES) {
      for (const tag of story.tagsInFacts ?? []) expect(story.tags, story.slug).toContain(tag);
    }
  });
});

describe('the case close’s client line', () => {
  const names = (line: string) => line.replace(/^Other clients include /, '').replace(/\.$/, '').split(/, | and /);

  it('names only clients the site’s client line names, never the case’s own', () => {
    for (const story of STORIES) {
      const line = otherClientsLine(story);
      if (!line) continue;
      const own = [story.client, ...story.facts.filter((fact) => fact.term === 'Client').map((fact) => fact.detail)];
      for (const name of names(line)) {
        expect(CLIENTS_LINE, `${story.slug}: ${name}`).toContain(name);
        expect(own.some((detail) => detail === name || detail.startsWith(`${name},`) || detail.startsWith(`${name} (`)), `${story.slug}: ${name}`).toBe(false);
      }
    }
  });

  it('drops exactly one name on a case whose client the line names', () => {
    const lro = STORIES.find((story) => story.slug === 'lro-staffing');
    const all = names(CLIENTS_LINE.replace(/^Clients include /, 'Other clients include '));
    expect(names(otherClientsLine(lro!)!)).toEqual(all.filter((name) => name !== 'LRO Staffing'));
  });
});
