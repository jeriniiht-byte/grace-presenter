import { useState } from 'react';
import { Save } from 'lucide-react';
import * as songsDb from '../../db/songs';
import { parseLyricsInput } from '../../services/songs/parseLyricsInput';
import { useLibraryStore } from '../../state/useLibraryStore';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil' },
  { code: 'ml', label: 'Malayalam' }
];

interface AddSongFormProps {
  onSaved: (songId: number, languageCode: string) => void;
}

export default function AddSongForm({ onSaved }: AddSongFormProps) {
  const [title, setTitle] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [languageCode, setLanguageCode] = useState('en');
  const [lyrics, setLyrics] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSongLanguage = useLibraryStore(s => s.setSongLanguage);

  const canSave = title.trim().length > 0 && lyrics.trim().length > 0 && !isSaving;

  const handleSave = async () => {
    setError(null);
    const { structure, sections } = parseLyricsInput(lyrics);
    if (structure.length === 0) {
      setError('Add at least one section of lyrics.');
      return;
    }

    setIsSaving(true);
    try {
      const song = await songsDb.createSongWithTranslation({
        title: title.trim(),
        transliteration: transliteration.trim() || undefined,
        languageCode,
        structure,
        sections
      });

      setTitle('');
      setTransliteration('');
      setLyrics('');
      await setSongLanguage(languageCode);
      onSaved(song.id, languageCode);
    } catch (err) {
      console.error('Failed to save song:', err);
      setError('Failed to save the song. Check the console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Song title"
          className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <select
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-brand-500 transition-colors"
          value={languageCode}
          onChange={e => setLanguageCode(e.target.value)}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      </div>

      {languageCode !== 'en' && (
        <input
          type="text"
          placeholder="Romanized title, e.g. Manglish/Tanglish (optional)"
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
          value={transliteration}
          onChange={e => setTransliteration(e.target.value)}
        />
      )}

      <textarea
        placeholder={'Verse 1 line one\nVerse 1 line two\n\n[Chorus]\nChorus line one\nChorus line two\n\nVerse 2 line one...'}
        rows={12}
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors resize-none font-mono"
        value={lyrics}
        onChange={e => setLyrics(e.target.value)}
      />
      <p className="text-xs text-zinc-500">
        Separate each section with a blank line. Start a section with a label like{' '}
        <span className="text-zinc-400">[Chorus]</span> to name it and reuse it later in the song.
      </p>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={!canSave}
        className="self-end flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
      >
        <Save size={14} />
        Save Song
      </button>
    </div>
  );
}
