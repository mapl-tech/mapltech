import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CUES, VSL, cueAt } from './vsl';

/** The WebVTT file the iPhone's own fullscreen player reads, parsed into cues. */
function vttCues() {
  const file = readFileSync(join(process.cwd(), 'public', VSL.captions), 'utf8');
  const seconds = (stamp: string) => {
    const [h, m, s] = stamp.split(':');
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
  };
  return file
    .trim()
    .split(/\n\n+/)
    .slice(1)
    .map((block) => {
      const [, timing, ...text] = block.split('\n');
      const [start, end] = timing.split(' --> ');
      return { start: seconds(start), end: seconds(end), text: text.join('\n') };
    });
}

describe('the video captions', () => {
  it('are the same cues in the page player and in the WebVTT file', () => {
    expect(vttCues()).toEqual(CUES.map((cue) => ({ ...cue })));
  });

  it('run in order, never overlap, and cover the 28-second video', () => {
    CUES.forEach((cue, i) => {
      expect(cue.end).toBeGreaterThan(cue.start);
      if (i > 0) expect(cue.start).toBeGreaterThanOrEqual(CUES[i - 1].end);
    });
    expect(CUES.at(-1)!.end).toBeGreaterThanOrEqual(VSL.duration);
  });

  it('keep each line short enough for a phone-width player', () => {
    for (const cue of CUES) for (const line of cue.text.split('\n')) expect(line.length).toBeLessThanOrEqual(37);
  });

  it('show the right words at a given moment, and nothing between cues', () => {
    expect(cueAt(0)).toBe('Hi, I’m Leshan Patterson,\nco-founder of MAPL TECH.');
    expect(cueAt(10.5)).toBe('Miss the deadline\nand you don’t pay the final payment.');
    expect(cueAt(3.48)).toBe('');
    expect(cueAt(99)).toBe('');
  });
});
