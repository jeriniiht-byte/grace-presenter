import { useEffect, useState } from 'react';
import { PREDEFINED_THEMES } from '../../styles/themes';
import SlideRenderer from './SlideRenderer';
import {
  listenForPresentationUpdates,
  requestPresentationState,
  type PresentationBroadcastState
} from '../../services/presentation/presentationBridge';

export default function PresentationDisplay() {
  const [state, setState] = useState<PresentationBroadcastState | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listenForPresentationUpdates(setState).then(fn => {
      unlisten = fn;
    });
    requestPresentationState();
    return () => unlisten?.();
  }, []);

  if (!state || !state.isActive) {
    return <div className="w-screen h-screen bg-black" />;
  }

  const baseTheme = PREDEFINED_THEMES[state.themeId] ?? PREDEFINED_THEMES.dark;
  const theme = {
    ...baseTheme,
    backgroundImage: state.backgroundKind === 'image' ? state.backgroundUrl ?? undefined : undefined,
    backgroundVideo: state.backgroundKind === 'video' ? state.backgroundUrl ?? undefined : undefined
  };
  const currentSlide = state.slides[state.currentIndex] ?? null;

  return (
    <div className="w-screen h-screen overflow-hidden">
      {state.isBlackScreen ? (
        <div className="w-full h-full bg-black" />
      ) : (
        <SlideRenderer slide={currentSlide} theme={theme} />
      )}
    </div>
  );
}
