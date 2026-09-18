export interface Language {
  code: string;
  name: string;
  fontFamily: string;
}

export interface BibleTranslation {
  id: number;
  languageCode: string;
  code: string;
  name: string;
}

export interface BibleBook {
  id: number;
  bookNumber: number;
  testament: 'OT' | 'NT';
}

export interface BibleBookName {
  bookId: number;
  translationId: number;
  name: string;
  abbrev: string;
}

export interface BibleVerse {
  id: number;
  translationId: number;
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface Song {
  id: number;
  slug: string;
  defaultCcli?: string;
  structure: string[];
}

export interface SongTranslation {
  id: number;
  songId: number;
  languageCode: string;
  title: string;
  transliteration?: string;
}

export interface SongSection {
  id: number;
  songTranslationId: number;
  sectionKey: string;
  text: string;
  transliteration?: string;
}

export interface Service {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  backgroundMediaPath?: string;
  backgroundMediaKind?: 'image' | 'video';
}

export interface CustomSlide {
  id: number;
  title?: string;
  body?: string;
  kind: 'custom' | 'welcome' | 'scripture_custom' | 'media';
  mediaPath?: string;
  mediaKind?: 'image' | 'video';
  createdAt: string;
}

export interface Setting {
  key: string;
  value: string;
}
