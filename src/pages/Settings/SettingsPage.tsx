import { useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import ThemePicker from '../../components/settings/ThemePicker';
import BackgroundPicker from '../../components/settings/BackgroundPicker';
import UpdateChecker from '../../components/settings/UpdateChecker';
import { useSettingsStore } from '../../state/useSettingsStore';
import { useThemeStore } from '../../state/useThemeStore';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil' },
  { code: 'ml', label: 'Malayalam' }
];

export default function SettingsPage() {
  const defaultBibleLanguage = useSettingsStore(s => s.defaultBibleLanguage);
  const defaultSongLanguage = useSettingsStore(s => s.defaultSongLanguage);
  const loadSettings = useSettingsStore(s => s.loadSettings);
  const setDefaultBibleLanguage = useSettingsStore(s => s.setDefaultBibleLanguage);
  const setDefaultSongLanguage = useSettingsStore(s => s.setDefaultSongLanguage);

  const customBackgroundUrl = useThemeStore(s => s.customBackgroundUrl);
  const customBackgroundKind = useThemeStore(s => s.customBackgroundKind);
  const setCustomBackground = useThemeStore(s => s.setCustomBackground);
  const clearCustomBackground = useThemeStore(s => s.clearCustomBackground);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-semibold text-zinc-100 tracking-tight mb-6 flex items-center gap-2.5">
        <SettingsIcon size={20} className="text-brand-400" />
        Settings
      </h1>

      <section className="mb-9">
        <h2 className="text-sm font-semibold text-zinc-200 mb-1">Presentation Theme</h2>
        <p className="text-xs text-zinc-500 mb-3">Choose the look for slides shown during a presentation.</p>
        <ThemePicker />
      </section>

      <section className="mb-9">
        <h2 className="text-sm font-semibold text-zinc-200 mb-1">Background</h2>
        <p className="text-xs text-zinc-500 mb-3">Overrides the theme's background for every presentation, unless a service sets its own.</p>
        <BackgroundPicker
          currentUrl={customBackgroundUrl}
          currentKind={customBackgroundKind}
          onPick={setCustomBackground}
          onClear={clearCustomBackground}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-200 mb-3">Default Languages</h2>
        <div className="flex gap-8">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Bible</label>
            <select
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-brand-500"
              value={defaultBibleLanguage}
              onChange={e => setDefaultBibleLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Songs</label>
            <select
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-brand-500"
              value={defaultSongLanguage}
              onChange={e => setDefaultSongLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <h2 className="text-sm font-semibold text-zinc-200 mb-1">Updates</h2>
        <p className="text-xs text-zinc-500 mb-3">Grace Presenter v{__APP_VERSION__}</p>
        <UpdateChecker />
      </section>
    </div>
  );
}
