import { describe, expect, it } from 'vitest';
import { STORIES, heroTags } from './stories';

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
