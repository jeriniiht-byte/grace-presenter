import { useEffect } from 'react';
import { usePresentationStore } from '../state/usePresentationStore';
import { toggleDisplayFullscreen } from '../services/presentation/presentationBridge';

export function usePresentationKeyboardShortcuts(onExit: () => void) {
  const nextSlide = usePresentationStore(s => s.nextSlide);
  const prevSlide = usePresentationStore(s => s.prevSlide);
  const firstSlide = usePresentationStore(s => s.firstSlide);
  const lastSlide = usePresentationStore(s => s.lastSlide);
  const toggleBlackScreen = usePresentationStore(s => s.toggleBlackScreen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          firstSlide();
          break;
        case 'End':
          e.preventDefault();
          lastSlide();
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          toggleBlackScreen();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleDisplayFullscreen().catch(error => {
            console.error('Failed to toggle display fullscreen:', error);
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, firstSlide, lastSlide, toggleBlackScreen, onExit]);
}
