import { Check } from 'lucide-react';
import type { Slide } from '../../types/slide';
import { PREDEFINED_THEMES } from '../../styles/themes';
import { useThemeStore } from '../../state/useThemeStore';
import SlideRenderer from '../presentation/SlideRenderer';

const PREVIEW_SLIDE: Slide = {
  id: 'preview',
  kind: 'bible-verse',
  lines: ['16 For God so loved the world, that he gave his only begotten Son.'],
  meta: { reference: 'John 3:16' }
};

export default function ThemePicker() {
  const activeThemeId = useThemeStore(s => s.activeThemeId);
  const setTheme = useThemeStore(s => s.setTheme);

  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.values(PREDEFINED_THEMES).map(theme => (
        <div
          key={theme.id}
          onClick={() => setTheme(theme.id)}
          className={`cursor-pointer rounded-lg overflow-hidden border-2 transition ${
            theme.id === activeThemeId ? 'border-brand-500' : 'border-transparent hover:border-zinc-600'
          }`}
        >
          <div className="relative w-full" style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
            <div
              style={{
                width: '1280px',
                height: '720px',
                transform: 'scale(0.2109375)',
                transformOrigin: 'top left'
              }}
            >
              <SlideRenderer slide={PREVIEW_SLIDE} theme={theme} />
            </div>
          </div>
          <div className="bg-zinc-900 px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-zinc-100">{theme.name}</span>
              {theme.id === activeThemeId && (
                <span className="flex items-center gap-1 text-brand-400 text-xs font-medium">
                  <Check size={12} />
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{theme.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
