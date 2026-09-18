import type { ServiceItem } from '../../types/slide';
import type { Slide } from '../../types/slide';
import * as bibleDb from '../../db/bible';
import * as songsDb from '../../db/songs';
import * as servicesDb from '../../db/services';
import { chunkMultilingualBibleVerses, buildSongSectionSlides, chunkCustomBody, type LanguageVerseSet } from './chunking';
import { resolveBackgroundUrl } from '../media/backgroundMedia';

async function buildBibleSlides(item: ServiceItem): Promise<Slide[]> {
  const translationIds = item.bibleTranslationIds;
  if (
    !translationIds || translationIds.length === 0 || !item.bibleBookId || !item.bibleChapter ||
    item.bibleVerseStart == null || item.bibleVerseEnd == null
  ) {
    return [];
  }

  const languageSets: LanguageVerseSet[] = await Promise.all(
    translationIds.map(async (translationId): Promise<LanguageVerseSet> => {
      const [verses, bookLabel, translation] = await Promise.all([
        bibleDb.getVerseRange(
          translationId,
          item.bibleBookId!,
          item.bibleChapter!,
          item.bibleVerseStart!,
          item.bibleVerseEnd!
        ),
        bibleDb.getBookName(translationId, item.bibleBookId!),
        bibleDb.getTranslationById(translationId)
      ]);
      return { languageCode: translation?.languageCode ?? 'en', bookLabel, verses };
    })
  );

  return chunkMultilingualBibleVerses(languageSets, item.bibleChapter, item.id);
}

async function buildSongSlides(item: ServiceItem): Promise<Slide[]> {
  if (!item.songId || !item.songLanguageCode) return [];

  const [song, translation] = await Promise.all([
    songsDb.getSong(item.songId),
    songsDb.getSongTranslation(item.songId, item.songLanguageCode)
  ]);
  if (!song || !translation) return [];

  const sections = await songsDb.getSongSections(translation.id);

  const titleSlide: Slide = {
    id: `${item.id}-title`,
    kind: 'title',
    lines: [translation.title],
    meta: { reference: translation.title, languageCode: item.songLanguageCode }
  };

  const sectionSlides = buildSongSectionSlides(
    song.structure,
    sections,
    item.songLanguageCode,
    item.id
  );

  return [titleSlide, ...sectionSlides];
}

async function buildCustomSlides(item: ServiceItem): Promise<Slide[]> {
  if (!item.customSlideId) return [];

  const customSlide = await servicesDb.getCustomSlide(item.customSlideId);
  if (!customSlide) return [];

  if (customSlide.kind === 'media' && customSlide.mediaPath && customSlide.mediaKind) {
    const mediaUrl = await resolveBackgroundUrl(customSlide.mediaPath);
    return [{
      id: `${item.id}-media`,
      kind: 'media',
      lines: [],
      mediaUrl,
      mediaKind: customSlide.mediaKind,
      meta: {}
    }];
  }

  return chunkCustomBody(customSlide.body ?? '', item.id);
}

export async function buildSlideDeck(item: ServiceItem): Promise<Slide[]> {
  switch (item.itemType) {
    case 'bible':
      return buildBibleSlides(item);
    case 'song':
      return buildSongSlides(item);
    case 'custom':
      return buildCustomSlides(item);
    default:
      return [];
  }
}
