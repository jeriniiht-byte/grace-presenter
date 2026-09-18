import { useLibraryStore } from '../../state/useLibraryStore';

interface SongSearchProps {
  onSelectSong: (songId: number, languageCode: string) => void;
}

export default function SongSearch({ onSelectSong }: SongSearchProps) {
  const songSearchQuery = useLibraryStore(s => s.songSearchQuery);
  const songSearchResults = useLibraryStore(s => s.songSearchResults);
  const isSearchingSongs = useLibraryStore(s => s.isSearchingSongs);
  const searchSongs = useLibraryStore(s => s.searchSongs);
  const selectedLanguage = useLibraryStore(s => s.selectedLanguage);

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search by title or lyrics (Manglish/Tanglish OK)..."
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
        value={songSearchQuery}
        onChange={e => searchSongs(e.target.value)}
      />
      <p className="text-xs text-zinc-500 -mt-2">Searching {selectedLanguage.toUpperCase()} titles and lyrics</p>

      <div className="space-y-1">
        {isSearchingSongs ? (
          <p className="text-zinc-400 text-sm">Searching...</p>
        ) : songSearchQuery && songSearchResults.length === 0 ? (
          <p className="text-zinc-400 text-sm">No matches found.</p>
        ) : (
          songSearchResults.map(t => (
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
