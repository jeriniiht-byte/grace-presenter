import { useEffect } from 'react';
import { useLibraryStore } from '../../state/useLibraryStore';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil' },
  { code: 'ml', label: 'Malayalam' }
];

interface SongBrowserProps {
  onSelectSong: (songId: number, languageCode: string) => void;
}

export default function SongBrowser({ onSelectSong }: SongBrowserProps) {
  const selectedLanguage = useLibraryStore(s => s.selectedLanguage);
  const songTranslations = useLibraryStore(s => s.songTranslations);
  const isLoadingSongs = useLibraryStore(s => s.isLoadingSongs);
  const setSongLanguage = useLibraryStore(s => s.setSongLanguage);

  useEffect(() => {
    setSongLanguage(selectedLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount with the initial language
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800/80 rounded-lg p-1 w-fit">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => setSongLanguage(lang.code)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedLanguage === lang.code
                ? 'bg-brand-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {songTranslations.length >= 200 && (
        <p className="text-xs text-zinc-500">Showing first 200 songs — use Search to find a specific one.</p>
      )}

      <div className="space-y-0.5">
        {isLoadingSongs ? (
          <p className="text-zinc-500 text-sm">Loading...</p>
        ) : songTranslations.length === 0 ? (
          <p className="text-zinc-500 text-sm">No songs available in this language yet.</p>
        ) : (
          songTranslations.map(t => (
            <div
              key={t.id}
              onClick={() => onSelectSong(t.songId, t.languageCode)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            >
              <div className="text-zinc-200">{t.title}</div>
              {t.transliteration && (
                <div className="text-xs text-zinc-500">{t.transliteration}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
