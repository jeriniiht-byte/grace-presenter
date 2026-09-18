import { create } from 'zustand';
import * as settingsDb from '../db/settings';

interface SettingsState {
  defaultBibleTranslationId: number | null;
  defaultBibleLanguage: string;
  defaultSongLanguage: string;

  loadSettings: () => Promise<void>;
  setDefaultBibleTranslation: (translationId: number) => Promise<void>;
  setDefaultBibleLanguage: (languageCode: string) => Promise<void>;
  setDefaultSongLanguage: (languageCode: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  defaultBibleTranslationId: 1,
  defaultBibleLanguage: 'en',
  defaultSongLanguage: 'en',

  loadSettings: async () => {
    const settings = await settingsDb.getSettings();
    set({
      defaultBibleTranslationId: settings.defaultBibleTranslationId
        ? Number(settings.defaultBibleTranslationId)
        : 1,
      defaultBibleLanguage: settings.defaultBibleLanguage ?? 'en',
      defaultSongLanguage: settings.defaultSongLanguage ?? 'en'
    });
  },

  setDefaultBibleTranslation: async (translationId: number) => {
    await settingsDb.setSetting('defaultBibleTranslationId', String(translationId));
    set({ defaultBibleTranslationId: translationId });
  },

  setDefaultBibleLanguage: async (languageCode: string) => {
    await settingsDb.setSetting('defaultBibleLanguage', languageCode);
    set({ defaultBibleLanguage: languageCode });
  },

  setDefaultSongLanguage: async (languageCode: string) => {
    await settingsDb.setSetting('defaultSongLanguage', languageCode);
    set({ defaultSongLanguage: languageCode });
  }
}));
