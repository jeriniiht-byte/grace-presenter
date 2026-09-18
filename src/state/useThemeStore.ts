import { create } from 'zustand';
import type { Theme } from '../types/theme';
import { PREDEFINED_THEMES } from '../styles/themes';
import * as settingsDb from '../db/settings';
import { pickBackgroundMedia, resolveBackgroundUrl, type BackgroundMediaKind } from '../services/media/backgroundMedia';

interface ThemeState {
  activeThemeId: string;
  customBackgroundKind: BackgroundMediaKind | null;
  customBackgroundUrl: string | null;

  setTheme: (themeId: string) => Promise<void>;
  getActiveTheme: () => Theme;
  setCustomBackground: (kind: BackgroundMediaKind) => Promise<void>;
  clearCustomBackground: () => Promise<void>;
  loadFromSettings: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  activeThemeId: 'salemag',
  customBackgroundKind: null,
  customBackgroundUrl: null,

  setTheme: async (themeId: string) => {
    if (!PREDEFINED_THEMES[themeId]) return;
    await settingsDb.setSetting('defaultTheme', themeId);
    set({ activeThemeId: themeId });
  },

  getActiveTheme: () => {
    const { activeThemeId, customBackgroundKind, customBackgroundUrl } = get();
    const base = PREDEFINED_THEMES[activeThemeId] || PREDEFINED_THEMES.dark;
    if (!customBackgroundUrl) return base;
    return {
      ...base,
      backgroundImage: customBackgroundKind === 'image' ? customBackgroundUrl : undefined,
      backgroundVideo: customBackgroundKind === 'video' ? customBackgroundUrl : undefined
    };
  },

  setCustomBackground: async (kind: BackgroundMediaKind) => {
    const picked = await pickBackgroundMedia(kind);
    if (!picked) return;
    await settingsDb.setSetting('themeBackgroundPath', picked.relativePath);
    await settingsDb.setSetting('themeBackgroundKind', picked.kind);
    const url = await resolveBackgroundUrl(picked.relativePath);
    set({ customBackgroundKind: picked.kind, customBackgroundUrl: url });
  },

  clearCustomBackground: async () => {
    await settingsDb.setSetting('themeBackgroundPath', '');
    await settingsDb.setSetting('themeBackgroundKind', '');
    set({ customBackgroundKind: null, customBackgroundUrl: null });
  },

  loadFromSettings: async () => {
    const themeId = await settingsDb.getSetting('defaultTheme');
    const path = await settingsDb.getSetting('themeBackgroundPath');
    const kind = await settingsDb.getSetting('themeBackgroundKind');

    let customBackgroundUrl: string | null = null;
    let customBackgroundKind: BackgroundMediaKind | null = null;
    if (path && kind) {
      customBackgroundUrl = await resolveBackgroundUrl(path);
      customBackgroundKind = kind as BackgroundMediaKind;
    }

    set({
      activeThemeId: themeId && PREDEFINED_THEMES[themeId] ? themeId : 'salemag',
      customBackgroundKind,
      customBackgroundUrl
    });
  }
}));
