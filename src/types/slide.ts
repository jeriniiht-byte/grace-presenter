export type SlideKind = 'title' | 'song-section' | 'bible-verse' | 'custom' | 'media';

export interface Slide {
  id: string;
  kind: SlideKind;
  lines: string[];
  /** Romanized ("Manglish"/"Tanglish") counterpart of `lines`, shown beneath them when present. */
  transliterationLines?: string[];
  /** Extra translations of the same content (e.g. a Bible verse in Tamil + Malayalam alongside English), each in its own script. */
  additionalLanguageBlocks?: { languageCode: string; lines: string[] }[];
  /** Set when kind === 'media': a full-slide image or video. */
  mediaUrl?: string;
  mediaKind?: 'image' | 'video';
  meta: {
    songSectionLabel?: string;
    reference?: string;
    languageCode?: string;
  };
}

export interface ServiceItem {
  id: string;
  position: number;
  itemType: 'bible' | 'song' | 'custom';
  label: string;
  // Bible payload — one or more translations to show together on the same slide
  bibleTranslationIds?: number[];
  bibleBookId?: number;
  bibleChapter?: number;
  bibleVerseStart?: number;
  bibleVerseEnd?: number;
  // Song payload
  songId?: number;
  songLanguageCode?: string;
  // Custom payload
  customSlideId?: number;
}

export type ServiceItemPayload = Partial<Pick<ServiceItem,
  | 'bibleTranslationIds' | 'bibleBookId' | 'bibleChapter' | 'bibleVerseStart' | 'bibleVerseEnd'
  | 'songId' | 'songLanguageCode'
  | 'customSlideId'
>>;
