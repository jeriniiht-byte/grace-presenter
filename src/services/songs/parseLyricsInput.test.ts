import { describe, it, expect } from 'vitest';
import { parseLyricsInput } from './parseLyricsInput';

describe('parseLyricsInput', () => {
  it('numbers unlabeled blocks sequentially as verses', () => {
    const result = parseLyricsInput('Line one\nLine two\n\nLine three');
    expect(result.structure).toEqual(['verse1', 'verse2']);
    expect(result.sections).toEqual([
      { key: 'verse1', text: 'Line one\nLine two' },
      { key: 'verse2', text: 'Line three' }
    ]);
  });

  it('uses a bracketed label to name a section', () => {
    const result = parseLyricsInput('[Chorus]\nSing along\nWith joy');
    expect(result.structure).toEqual(['chorus']);
    expect(result.sections).toEqual([{ key: 'chorus', text: 'Sing along\nWith joy' }]);
  });

  it('reuses the same section when a label repeats, without duplicating storage', () => {
    const body = '[Chorus]\nSing along\n\n[Verse 1]\nFirst verse\n\n[Chorus]\nSing along\n\n[Verse 2]\nSecond verse';
    const result = parseLyricsInput(body);

    expect(result.structure).toEqual(['chorus', 'verse1', 'chorus', 'verse2']);
    expect(result.sections).toHaveLength(3);
    expect(result.sections.filter(s => s.key === 'chorus')).toHaveLength(1);
  });

  it('mixes labeled and unlabeled blocks', () => {
    const body = 'Intro line\n\n[Chorus]\nHallelujah\n\nAnother unlabeled verse';
    const result = parseLyricsInput(body);
    expect(result.structure).toEqual(['verse1', 'chorus', 'verse2']);
  });

  it('ignores blank/whitespace-only input', () => {
    expect(parseLyricsInput('   \n\n  ')).toEqual({ structure: [], sections: [] });
  });

  it('skips a labeled block left with no text after removing its label line', () => {
    const result = parseLyricsInput('[Chorus]\n\nActual verse text');
    expect(result.structure).toEqual(['verse1']);
    expect(result.sections).toEqual([{ key: 'verse1', text: 'Actual verse text' }]);
  });
});
