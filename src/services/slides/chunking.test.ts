import { describe, it, expect } from 'vitest';
import type { BibleVerse, SongSection } from '../../types/db';
import { chunkBibleVerses, chunkMultilingualBibleVerses, buildSongSectionSlides, chunkCustomBody } from './chunking';

function verse(chapter: number, num: number, text: string): BibleVerse {
  return { id: num, translationId: 1, bookId: 43, chapter, verse: num, text };
}

describe('chunkBibleVerses', () => {
  it('never splits a single verse across slides', () => {
    const longText = 'x'.repeat(500);
    const verses = [verse(3, 1, 'short'), verse(3, 2, longText), verse(3, 3, 'short again')];
    const slides = chunkBibleVerses(verses, 'John', 3, 'en', 'item-1', 350);

    const allLines = slides.flatMap(s => s.lines);
    expect(allLines.some(l => l.includes(longText))).toBe(true);
    // the long verse must appear whole on exactly one line
    expect(allLines.filter(l => l.includes(longText))).toHaveLength(1);
  });

  it('accounts for every input verse across the produced slides', () => {
    const verses = Array.from({ length: 36 }, (_, i) => verse(3, i + 1, `Verse text number ${i + 1} with some padding words here.`));
    const slides = chunkBibleVerses(verses, 'John', 3, 'en', 'item-1');

    const totalLines = slides.reduce((sum, s) => sum + s.lines.length, 0);
    expect(totalLines).toBe(36);
    expect(slides.length).toBeGreaterThan(1);
  });

  it('labels a single-verse slide without a dash range', () => {
    const slides = chunkBibleVerses([verse(23, 1, 'The LORD is my shepherd')], 'Psalms', 23, 'en', 'item-2');
    expect(slides).toHaveLength(1);
    expect(slides[0].meta.reference).toBe('Psalms 23:1');
  });

  it('labels a multi-verse slide with a dash range', () => {
    const verses = [verse(23, 1, 'a'), verse(23, 2, 'b')];
    const slides = chunkBibleVerses(verses, 'Psalms', 23, 'en', 'item-3', 1000);
    expect(slides).toHaveLength(1);
    expect(slides[0].meta.reference).toBe('Psalms 23:1-2');
  });

  it('returns an empty array for no verses', () => {
    expect(chunkBibleVerses([], 'John', 3, 'en', 'item-4')).toEqual([]);
  });
});

describe('chunkMultilingualBibleVerses', () => {
  it('attaches matching verses from secondary languages as additional blocks', () => {
    const en = [verse(23, 1, 'The LORD is my shepherd'), verse(23, 2, 'He maketh me to lie down')];
    const ta = [verse(23, 1, 'தமிழ் 1'), verse(23, 2, 'தமிழ் 2')];
    const ml = [verse(23, 1, 'മലയാളം 1'), verse(23, 2, 'മലയാളം 2')];

    const slides = chunkMultilingualBibleVerses(
      [
        { languageCode: 'en', bookLabel: 'Psalms', verses: en },
        { languageCode: 'ta', bookLabel: 'Psalms', verses: ta },
        { languageCode: 'ml', bookLabel: 'Psalms', verses: ml }
      ],
      23,
      'item-1',
      1000
    );

    expect(slides).toHaveLength(1);
    expect(slides[0].lines).toEqual(['1 The LORD is my shepherd', '2 He maketh me to lie down']);
    expect(slides[0].additionalLanguageBlocks).toEqual([
      { languageCode: 'ta', lines: ['1 தமிழ் 1', '2 தமிழ் 2'] },
      { languageCode: 'ml', lines: ['1 മലയാളം 1', '2 മലയാളം 2'] }
    ]);
    expect(slides[0].meta.reference).toBe('Psalms 23:1-2');
    expect(slides[0].meta.languageCode).toBe('en');
  });

  it('splits into multiple slides using the primary language boundaries, keeping secondary languages aligned per slide', () => {
    const longText = 'x'.repeat(344);
    const en = [verse(3, 1, 'short'), verse(3, 2, longText), verse(3, 3, 'short again')];
    const ta = [verse(3, 1, 'ta1'), verse(3, 2, 'ta2'), verse(3, 3, 'ta3')];

    const slides = chunkMultilingualBibleVerses(
      [
        { languageCode: 'en', bookLabel: 'John', verses: en },
        { languageCode: 'ta', bookLabel: 'John', verses: ta }
      ],
      3,
      'item-2',
      350
    );

    expect(slides.length).toBeGreaterThan(1);
    const totalTaLines = slides.reduce((sum, s) => sum + (s.additionalLanguageBlocks?.[0]?.lines.length ?? 0), 0);
    expect(totalTaLines).toBe(3);
  });

  it('omits a language block entirely when it has no verses in range', () => {
    const en = [verse(3, 1, 'hello')];
    const slides = chunkMultilingualBibleVerses(
      [
        { languageCode: 'en', bookLabel: 'John', verses: en },
        { languageCode: 'ta', bookLabel: 'John', verses: [] }
      ],
      3,
      'item-3'
    );
    expect(slides[0].additionalLanguageBlocks).toBeUndefined();
  });

  it('returns an empty array when the primary language has no verses', () => {
    const slides = chunkMultilingualBibleVerses(
      [{ languageCode: 'en', bookLabel: 'John', verses: [] }],
      3,
      'item-4'
    );
    expect(slides).toEqual([]);
  });
});

describe('buildSongSectionSlides', () => {
  const sections: SongSection[] = [
    { id: 1, songTranslationId: 1, sectionKey: 'verse1', text: 'Line one\nLine two' },
    { id: 2, songTranslationId: 1, sectionKey: 'chorus', text: 'Chorus line one\nChorus line two' },
    { id: 3, songTranslationId: 1, sectionKey: 'verse2', text: 'Verse two line one' }
  ];

  it('produces one slide per structure entry, repeating a chorus as separate slides', () => {
    const structure = ['verse1', 'chorus', 'verse2', 'chorus'];
    const slides = buildSongSectionSlides(structure, sections, 'en', 'item-1', 10);

    expect(slides).toHaveLength(4);
    expect(slides[1].meta.songSectionLabel).toBe('Chorus');
    expect(slides[3].meta.songSectionLabel).toBe('Chorus');
    // both chorus occurrences carry the same text, but are distinct slide objects
    expect(slides[1].lines).toEqual(slides[3].lines);
    expect(slides[1].id).not.toBe(slides[3].id);
  });

  it('splits an overly long section into multiple slides with the same label', () => {
    const longSection: SongSection[] = [
      { id: 4, songTranslationId: 1, sectionKey: 'verse1', text: Array.from({ length: 10 }, (_, i) => `Line ${i + 1}`).join('\n') }
    ];
    const slides = buildSongSectionSlides(['verse1'], longSection, 'en', 'item-2', 4);

    expect(slides).toHaveLength(3); // 10 lines / 4 per slide = 3 slides (4,4,2)
    slides.forEach(s => expect(s.meta.songSectionLabel).toBe('Verse 1'));
  });

  it('produces an empty-lines slide when a structure key has no matching section', () => {
    const slides = buildSongSectionSlides(['bridge'], sections, 'en', 'item-3');
    expect(slides).toHaveLength(1);
    expect(slides[0].lines).toEqual([]);
  });

  it('formats numbered and unnumbered section keys correctly', () => {
    const slides = buildSongSectionSlides(['verse1', 'chorus'], sections, 'en', 'item-4', 10);
    expect(slides[0].meta.songSectionLabel).toBe('Verse 1');
    expect(slides[1].meta.songSectionLabel).toBe('Chorus');
  });
});

describe('chunkCustomBody', () => {
  it('groups short paragraphs onto one slide', () => {
    const body = 'Paragraph one.\n\nParagraph two.';
    const slides = chunkCustomBody(body, 'item-1', 1000);
    expect(slides).toHaveLength(1);
    expect(slides[0].lines).toEqual(['Paragraph one.', 'Paragraph two.']);
  });

  it('splits across slides when paragraphs exceed the char limit', () => {
    const body = `${'a'.repeat(200)}\n\n${'b'.repeat(200)}`;
    const slides = chunkCustomBody(body, 'item-2', 250);
    expect(slides).toHaveLength(2);
  });

  it('keeps a single oversized paragraph intact on its own slide', () => {
    const body = 'x'.repeat(1000);
    const slides = chunkCustomBody(body, 'item-3', 100);
    expect(slides).toHaveLength(1);
    expect(slides[0].lines[0]).toHaveLength(1000);
  });

  it('returns an empty array for blank input', () => {
    expect(chunkCustomBody('   \n\n  ', 'item-4')).toEqual([]);
  });
});
