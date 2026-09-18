import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, EyeOff, Maximize, X, MonitorPlay } from 'lucide-react';
import { usePresentationStore } from '../../state/usePresentationStore';
import { useThemeStore } from '../../state/useThemeStore';
import { useServiceStore } from '../../state/useServiceStore';
import { usePresentationKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { closeDisplayWindow, onDisplayWindowClosed, toggleDisplayFullscreen } from '../../services/presentation/presentationBridge';
import SlideRenderer from './SlideRenderer';

export default function PresenterConsole() {
  const navigate = useNavigate();
  const isActive = usePresentationStore(s => s.isActive);
  const slides = usePresentationStore(s => s.slides);
  const currentIndex = usePresentationStore(s => s.currentIndex);
  const isBlackScreen = usePresentationStore(s => s.isBlackScreen);
  const nextSlide = usePresentationStore(s => s.nextSlide);
  const prevSlide = usePresentationStore(s => s.prevSlide);
  const toggleBlackScreen = usePresentationStore(s => s.toggleBlackScreen);
  const exitPresentation = usePresentationStore(s => s.exitPresentation);
  const getActiveTheme = useThemeStore(s => s.getActiveTheme);
  const serviceBackgroundUrl = useServiceStore(s => s.currentServiceBackgroundUrl);
  const serviceBackgroundKind = useServiceStore(s => s.currentServiceBackgroundKind);

  const handleExit = useCallback(async () => {
    exitPresentation();
    await closeDisplayWindow();
    navigate('/planner');
  }, [exitPresentation, navigate]);

  usePresentationKeyboardShortcuts(handleExit);

  useEffect(() => {
    if (!isActive) {
      navigate('/planner');
    }
  }, [isActive, navigate]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    onDisplayWindowClosed(() => {
      exitPresentation();
      navigate('/planner');
    }).then(fn => {
      unlisten = fn;
    });
    return () => unlisten?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- register once for the life of this console
  }, []);

  if (!isActive) return null;

  const baseTheme = getActiveTheme();
  const theme = serviceBackgroundUrl
    ? {
        ...baseTheme,
        backgroundImage: serviceBackgroundKind === 'image' ? serviceBackgroundUrl : undefined,
        backgroundVideo: serviceBackgroundKind === 'video' ? serviceBackgroundUrl : undefined
      }
    : baseTheme;
  const currentSlide = slides[currentIndex] ?? null;
  const upcomingSlide = slides[currentIndex + 1] ?? null;

  return (
    <div className="w-screen h-screen bg-zinc-950 text-white flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <MonitorPlay size={16} className="text-brand-400" />
          Presenting
          <span className="text-zinc-600 font-mono text-xs font-normal">
            {slides.length > 0 ? `${currentIndex + 1} / ${slides.length}` : '0 / 0'}
          </span>
        </h1>
        <div className="flex gap-2">
          <button onClick={prevSlide} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-medium py-2 px-3 rounded-lg transition-colors">
            <ChevronLeft size={15} />
            Prev
          </button>
          <button onClick={nextSlide} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-medium py-2 px-3 rounded-lg transition-colors">
            Next
            <ChevronRight size={15} />
          </button>
          <button
            onClick={toggleBlackScreen}
            className={`flex items-center gap-1.5 text-sm font-medium py-2 px-3 rounded-lg transition-colors border ${
              isBlackScreen ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            <EyeOff size={15} />
            Black Screen
            <span className="text-xs opacity-50">B</span>
          </button>
          <button
            onClick={() => toggleDisplayFullscreen().catch(err => console.error(err))}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
          >
            <Maximize size={15} />
            Fullscreen
            <span className="text-xs opacity-50">F</span>
          </button>
          <button onClick={handleExit} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-sm font-medium py-2 px-3 rounded-lg transition-colors">
            <X size={15} />
            Exit
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[2fr_1fr] gap-4 min-h-0">
        <div className="rounded-xl overflow-hidden border border-zinc-800">
          <SlideRenderer slide={currentSlide} theme={theme} />
        </div>
        <div className="flex flex-col gap-2 min-h-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Next</span>
          <div className="flex-1 rounded-xl overflow-hidden border border-zinc-800/80 opacity-60">
            <SlideRenderer slide={upcomingSlide} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}
