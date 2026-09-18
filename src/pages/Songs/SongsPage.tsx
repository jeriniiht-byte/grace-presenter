import { useState } from 'react';
import { Music } from 'lucide-react';
import SongBrowser from '../../components/songs/SongBrowser';
import SongSearch from '../../components/songs/SongSearch';
import AddSongForm from '../../components/songs/AddSongForm';
import SongViewer from '../../components/songs/SongViewer';
import { useLibraryStore } from '../../state/useLibraryStore';

export default function SongsPage() {
  const [tab, setTab] = useState<'browse' | 'search' | 'add'>('browse');
  const selectSong = useLibraryStore(s => s.selectSong);

  const handleSelectSong = (songId: number, languageCode: string) => {
    selectSong(songId, languageCode);
  };

  const handleSongSaved = (songId: number, languageCode: string) => {
    selectSong(songId, languageCode);
    setTab('browse');
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-zinc-100 tracking-tight mb-6 flex items-center gap-2.5">
        <Music size={20} className="text-brand-400" />
        Songs
      </h1>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="flex gap-1 mb-5 bg-zinc-900 border border-zinc-800/80 rounded-lg p-1 w-fit">
            <button
              onClick={() => setTab('browse')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'browse' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => setTab('search')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'search' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setTab('add')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === 'add' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              + Add Song
            </button>
          </div>

          {tab === 'browse' && <SongBrowser onSelectSong={handleSelectSong} />}
          {tab === 'search' && <SongSearch onSelectSong={handleSelectSong} />}
          {tab === 'add' && <AddSongForm onSaved={handleSongSaved} />}
        </div>

        <div className="border-l border-zinc-800/80 pl-8">
          <SongViewer />
        </div>
      </div>
    </div>
  );
}
