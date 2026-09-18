import { create } from 'zustand';
import type { BibleTranslation, BibleBook, BibleBookName, BibleVerse, SongTranslation, SongSection } from '../types/db';
import * as bibleDb from '../db/bible';
import * as songsDb from '../db/songs';

interface LibraryState {
  // Bible reference data
  translations: BibleTranslation[];
  books: BibleBook[];
  // Book names are always kept in English for the operator's UI (dropdowns, labels),
  // regardless of which translation's scripture text is being browsed/presented.
  englishBookNames: BibleBookName[];

  // Bible browse state
  selectedTranslationId: number | null;
  // Extra translations shown alongside the primary one on the same presented slide.
  additionalTranslationIds: number[];
  selectedBookId: number | null;
  selectedChapter: number;
  verses: BibleVerse[];
  verseRangeStart: number | null;
  verseRangeEnd: number | null;
  isLoadingVerses: boolean;

  // Bible search
  bibleSearchQuery: string;
  bibleSearchResults: BibleVerse[];
  isSearchingBible: boolean;

  // Song browse
  selectedLanguage: string;
  songTranslations: SongTranslation[];
  isLoadingSongs: boolean;

  // Song search
  songSearchQuery: string;
  songSearchResults: SongTranslation[];
  isSearchingSongs: boolean;

  // Song viewer
  selectedSongId: number | null;
  selectedSongStructure: string[];
  selectedSongTranslations: SongTranslation[];
  selectedSongTranslationId: number | null;
  selectedSongSections: SongSection[];
  isLoadingSongDetail: boolean;

  // Actions
  loadBibleReferenceData: () => Promise<void>;
  selectBibleTranslation: (translationId: number) => Promise<void>;
  toggleAdditionalTranslation: (translationId: number) => void;
  selectBook: (bookId: number) => Promise<void>;
  selectChapter: (chapter: number) => Promise<void>;
  setVerseRange: (start: number | null, end: number | null) => void;
  searchBible: (query: string) => Promise<void>;

  setSongLanguage: (languageCode: string) => Promise<void>;
  searchSongs: (query: string) => Promise<void>;
  selectSong: (songId: number, preferredLanguageCode?: string) => Promise<void>;
  selectSongTranslation: (translationId: number) => Promise<void>;

  bookName: (bookId: number) => string;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  translations: [],
  books: [],
  englishBookNames: [],

  selectedTranslationId: null,
  additionalTranslationIds: [],
  selectedBookId: null,
  selectedChapter: 1,
  verses: [],
  verseRangeStart: null,
  verseRangeEnd: null,
  isLoadingVerses: false,

  bibleSearchQuery: '',
  bibleSearchResults: [],
  isSearchingBible: false,

  selectedLanguage: 'en',
  songTranslations: [],
  isLoadingSongs: false,

  songSearchQuery: '',
  songSearchResults: [],
  isSearchingSongs: false,

  selectedSongId: null,
  selectedSongStructure: [],
  selectedSongTranslations: [],
  selectedSongTranslationId: null,
  selectedSongSections: [],
  isLoadingSongDetail: false,

  loadBibleReferenceData: async () => {
    const [translations, books] = await Promise.all([
      bibleDb.getTranslations(),
      bibleDb.listBooks()
    ]);
    set({ translations, books });

    const englishTranslation = translations.find(t => t.languageCode === 'en');
    if (englishTranslation) {
      const englishBookNames = await bibleDb.getBookNames(englishTranslation.id);
      set({ englishBookNames });
    }

    const { selectedTranslationId } = get();
    if (!selectedTranslationId && translations.length > 0) {
      await get().selectBibleTranslation((englishTranslation ?? translations[0]).id);
    }
  },

  selectBibleTranslation: async (translationId: number) => {
    set(state => ({
      selectedTranslationId: translationId,
      additionalTranslationIds: state.additionalTranslationIds.filter(id => id !== translationId)
    }));

    const { selectedBookId, selectedChapter } = get();
    if (selectedBookId) {
      await get().selectChapter(selectedChapter);
    }
  },

  toggleAdditionalTranslation: (translationId: number) => {
    set(state => ({
      additionalTranslationIds: state.additionalTranslationIds.includes(translationId)
        ? state.additionalTranslationIds.filter(id => id !== translationId)
        : [...state.additionalTranslationIds, translationId]
    }));
  },

  selectBook: async (bookId: number) => {
    set({ selectedBookId: bookId, selectedChapter: 1, verseRangeStart: null, verseRangeEnd: null });
    await get().selectChapter(1);
  },

  selectChapter: async (chapter: number) => {
    const { selectedTranslationId, selectedBookId } = get();
    if (!selectedTranslationId || !selectedBookId) return;

    set({ selectedChapter: chapter, isLoadingVerses: true, verseRangeStart: null, verseRangeEnd: null });
    try {
      const verses = await bibleDb.getChapter(selectedTranslationId, selectedBookId, chapter);
      set({ verses, isLoadingVerses: false });
    } catch (error) {
      console.error('Failed to load chapter:', error);
      set({ verses: [], isLoadingVerses: false });
    }
  },

  setVerseRange: (start: number | null, end: number | null) => {
    set({ verseRangeStart: start, verseRangeEnd: end });
  },

  searchBible: async (query: string) => {
    const { selectedTranslationId } = get();
    if (!selectedTranslationId || !query.trim()) {
      set({ bibleSearchQuery: query, bibleSearchResults: [] });
      return;
    }
    set({ bibleSearchQuery: query, isSearchingBible: true });
    try {
      const results = await bibleDb.searchVerses(selectedTranslationId, query);
      set({ bibleSearchResults: results, isSearchingBible: false });
    } catch (error) {
      console.error('Bible search failed:', error);
      set({ bibleSearchResults: [], isSearchingBible: false });
    }
  },

  setSongLanguage: async (languageCode: string) => {
    set({ selectedLanguage: languageCode, isLoadingSongs: true });
    try {
      const songTranslations = await songsDb.getSongsByLanguage(languageCode);
      set({ songTranslations, isLoadingSongs: false });
    } catch (error) {
      console.error('Failed to load songs:', error);
      set({ songTranslations: [], isLoadingSongs: false });
    }
  },

  searchSongs: async (query: string) => {
    const { selectedLanguage } = get();
    if (!query.trim()) {
      set({ songSearchQuery: query, songSearchResults: [] });
      return;
    }
    set({ songSearchQuery: query, isSearchingSongs: true });
    try {
      const [titleMatches, lyricsMatches] = await Promise.all([
        songsDb.searchSongTitles(query, selectedLanguage),
        songsDb.searchSongsByLanguage(query, selectedLanguage).catch(error => {
          console.error('Lyrics search failed:', error);
          return [] as SongTranslation[];
        })
      ]);
      const merged = new Map<number, SongTranslation>();
      [...titleMatches, ...lyricsMatches].forEach(t => merged.set(t.id, t));
      set({ songSearchResults: Array.from(merged.values()), isSearchingSongs: false });
    } catch (error) {
      console.error('Song search failed:', error);
      set({ songSearchResults: [], isSearchingSongs: false });
    }
  },

  selectSong: async (songId: number, preferredLanguageCode?: string) => {
    set({ isLoadingSongDetail: true, selectedSongId: songId });
    try {
      const [song, translations] = await Promise.all([
        songsDb.getSong(songId),
        songsDb.getTranslationsForSong(songId)
      ]);
      set({ selectedSongStructure: song?.structure ?? [], selectedSongTranslations: translations });

      const target = translations.find(t => t.languageCode === preferredLanguageCode) ?? translations[0];
      if (target) {
        await get().selectSongTranslation(target.id);
      } else {
        set({ selectedSongTranslationId: null, selectedSongSections: [], isLoadingSongDetail: false });
      }
    } catch (error) {
      console.error('Failed to load song:', error);
      set({ isLoadingSongDetail: false });
    }
  },

  selectSongTranslation: async (translationId: number) => {
    set({ isLoadingSongDetail: true });
    try {
      const sections = await songsDb.getSongSections(translationId);
      set({ selectedSongTranslationId: translationId, selectedSongSections: sections, isLoadingSongDetail: false });
    } catch (error) {
      console.error('Failed to load song sections:', error);
      set({ selectedSongSections: [], isLoadingSongDetail: false });
    }
  },

  bookName: (bookId: number) => {
    const { englishBookNames, books } = get();
    const found = englishBookNames.find(b => b.bookId === bookId);
    if (found) return found.name;
    const book = books.find(b => b.id === bookId);
    return book ? `Book ${book.bookNumber}` : `Book ${bookId}`;
  }
}));
