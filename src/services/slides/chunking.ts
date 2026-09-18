import type { BibleVerse, SongSection } from '../../types/db';
import type { Slide } from '../../types/slide';

export const BIBLE_MAX_CHARS_PER_SLIDE = 350;
export const SONG_MAX_LINES_PER_SLIDE = 6;

function formatSectionLabel(key: string): string {
  const match = key.match(/^([a-zA-Z]+)(\d*)$/);
  if (!match) return key;
  const [, word, num] = match;
  const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
  return num ? `${capitalized} ${num}` : capitalized;
}

interface VerseChunkRange {
  rangeStart: number;
  rangeEnd: number;
}

/** Greedily groups verses under maxChars, never splitting a single verse across a boundary. */
function computeVerseChunkRanges(verses: BibleVerse[], maxChars: number): VerseChunkRange[] {
  if (verses.length === 0) return [];

  const ranges: VerseChunkRange[] = [];
  let currentChars = 0;
  let rangeStart = verses[0].verse;
  let rangeEnd = verses[0].verse;
  let hasCurrent = false;

  for (const verse of verses) {
    const lineLength = `${verse.verse} ${verse.text}`.length;
    if (hasCurrent && currentChars + lineLength > maxChars) {
      ranges.push({ rangeStart, rangeEnd });
      hasCurrent = false;
      currentChars = 0;
    }
    if (!hasCurrent) {
      rangeStart = verse.verse;
    }
    currentChars += lineLength;
    rangeEnd = verse.verse;
    hasCurrent = true;
  }
  if (hasCurrent) ranges.push({ rangeStart, rangeEnd });

  return ranges;
}

function formatReference(bookLabel: string, chapter: number, range: VerseChunkRange): string {
  return range.rangeStart === range.rangeEnd
    ? `${bookLabel} ${chapter}:${range.rangeStart}`
    : `${bookLabel} ${chapter}:${range.rangeStart}-${range.rangeEnd}`;
}

export function chunkBibleVerses(
  verses: BibleVerse[],
  bookLabel: string,
  chapter: number,
  languageCode: string,
  itemId: string,
  maxChars: number = BIBLE_MAX_CHARS_PER_SLIDE
): Slide[] {
  const ranges = computeVerseChunkRanges(verses, maxChars);

  return ranges.map((range, idx) => ({
    id: `${itemId}-bible-${idx}`,
    kind: 'bible-verse',
    lines: verses
      .filter(v => v.verse >= range.rangeStart && v.verse <= range.rangeEnd)
      .map(v => `${v.verse} ${v.text}`),
    meta: { reference: formatReference(bookLabel, chapter, range), languageCode }
  }));
}

export interface LanguageVerseSet {
  languageCode: string;
  bookLabel: string;
  verses: BibleVerse[];
}

/**
 * Builds slides showing the same verse range in multiple languages stacked together
 * (e.g. English + Tamil + Malayalam). Slide boundaries are computed from the first
 * ("primary") language; the other languages contribute the matching verse numbers.
 */
export function chunkMultilingualBibleVerses(
  languageSets: LanguageVerseSet[],
  chapter: number,
  itemId: string,
  maxChars: number = BIBLE_MAX_CHARS_PER_SLIDE
): Slide[] {
  const [primary, ...secondary] = languageSets;
  if (!primary || primary.verses.length === 0) return [];

  const ranges = computeVerseChunkRanges(primary.verses, maxChars);
  const secondaryMaps = secondary.map(set => ({
    languageCode: set.languageCode,
    textByVerse: new Map(set.verses.map(v => [v.verse, v.text]))
  }));

  return ranges.map((range, idx) => {
    const additionalLanguageBlocks = secondaryMaps
      .map(({ languageCode, textByVerse }) => {
        const lines: string[] = [];
        for (let vn = range.rangeStart; vn <= range.rangeEnd; vn++) {
          const text = textByVerse.get(vn);
          if (text) lines.push(`${vn} ${text}`);
        }
        return { languageCode, lines };
      })
      .filter(block => block.lines.length > 0);

    return {
      id: `${itemId}-bible-${idx}`,
      kind: 'bible-verse',
      lines: primary.verses
        .filter(v => v.verse >= range.rangeStart && v.verse <= range.rangeEnd)
        .map(v => `${v.verse} ${v.text}`),
      additionalLanguageBlocks: additionalLanguageBlocks.length > 0 ? additionalLanguageBlocks : undefined,
      meta: { reference: formatReference(primary.bookLabel, chapter, range), languageCode: primary.languageCode }
    };
  });
}

export function buildSongSectionSlides(
  structure: string[],
  sections: SongSection[],
  languageCode: string,
  itemId: string,
  maxLines: number = SONG_MAX_LINES_PER_SLIDE
): Slide[] {
  const sectionsByKey = new Map(sections.map(s => [s.sectionKey, s]));
  const slides: Slide[] = [];

  structure.forEach((sectionKey, structureIndex) => {
    const section = sectionsByKey.get(sectionKey);
    const label = formatSectionLabel(sectionKey);
    const lines = (section?.text ?? '').split('\n').filter(l => l.length > 0);
    const transliterationLines = (section?.transliteration ?? '').split('\n').filter(l => l.length > 0);
    // Only trust the romanized text as line-aligned with the native text when the
    // counts match; otherwise the two would drift apart once split across slides.
    const hasAlignedTransliteration = transliterationLines.length === lines.length && lines.length > 0;

    if (lines.length === 0) {
      slides.push({
        id: `${itemId}-song-${structureIndex}`,
        kind: 'song-section',
        lines: [],
        meta: { songSectionLabel: label, languageCode }
      });
      return;
    }

    for (let i = 0; i < lines.length; i += maxLines) {
      slides.push({
        id: `${itemId}-song-${structureIndex}-${i / maxLines}`,
        kind: 'song-section',
        lines: lines.slice(i, i + maxLines),
        transliterationLines: hasAlignedTransliteration
          ? transliterationLines.slice(i, i + maxLines)
          : undefined,
        meta: { songSectionLabel: label, languageCode }
      });
    }
  });

  return slides;
}

export function chunkCustomBody(
  body: string,
  itemId: string,
  maxChars: number = BIBLE_MAX_CHARS_PER_SLIDE
): Slide[] {
  const paragraphs = body.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  if (paragraphs.length === 0) return [];

  const slides: Slide[] = [];
  let currentLines: string[] = [];
  let currentChars = 0;

  const flush = () => {
    if (currentLines.length === 0) return;
    slides.push({
      id: `${itemId}-custom-${slides.length}`,
      kind: 'custom',
      lines: currentLines,
      meta: {}
    });
    currentLines = [];
    currentChars = 0;
  };

  for (const paragraph of paragraphs) {
    if (currentLines.length > 0 && currentChars + paragraph.length > maxChars) {
      flush();
    }
    currentLines.push(paragraph);
    currentChars += paragraph.length;
  }
  flush();

  return slides;
}
