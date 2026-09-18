import { create } from 'zustand';
import type { Slide } from '../types/slide';

interface PresentationState {
  isActive: boolean;
  slides: Slide[];
  currentIndex: number;
  isBlackScreen: boolean;
  activeSongLanguageOverride: string | null;

  // Actions
  startPresentation: (slides: Slide[]) => void;
  exitPresentation: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  firstSlide: () => void;
  lastSlide: () => void;
  toggleBlackScreen: () => void;
  setSongLanguage: (languageCode: string | null) => void;
}

export const usePresentationStore = create<PresentationState>((set) => ({
  isActive: false,
  slides: [],
  currentIndex: 0,
  isBlackScreen: false,
  activeSongLanguageOverride: null,

  startPresentation: (slides: Slide[]) => {
    set({
      isActive: true,
      slides,
      currentIndex: 0,
      isBlackScreen: false,
      activeSongLanguageOverride: null
    });
  },

  exitPresentation: () => {
    set({
      isActive: false,
      slides: [],
      currentIndex: 0,
      isBlackScreen: false,
      activeSongLanguageOverride: null
    });
  },

  nextSlide: () => {
    set(state => {
      const nextIndex = Math.min(state.currentIndex + 1, state.slides.length - 1);
      return { currentIndex: nextIndex };
    });
  },

  prevSlide: () => {
    set(state => {
      const prevIndex = Math.max(state.currentIndex - 1, 0);
      return { currentIndex: prevIndex };
    });
  },

  goToSlide: (index: number) => {
    set(state => {
      const clampedIndex = Math.max(0, Math.min(index, state.slides.length - 1));
      return { currentIndex: clampedIndex };
    });
  },

  firstSlide: () => {
    set({ currentIndex: 0 });
  },

  lastSlide: () => {
    set(state => ({
      currentIndex: state.slides.length - 1
    }));
  },

  toggleBlackScreen: () => {
    set(state => ({
      isBlackScreen: !state.isBlackScreen
    }));
  },

  setSongLanguage: (languageCode: string | null) => {
    set({ activeSongLanguageOverride: languageCode });
  }
}));
