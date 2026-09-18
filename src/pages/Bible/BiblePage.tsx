import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import BibleBrowser from '../../components/bible/BibleBrowser';
import BibleSearch from '../../components/bible/BibleSearch';
import { useLibraryStore } from '../../state/useLibraryStore';

export default function BiblePage() {
  const [tab, setTab] = useState<'browse' | 'search'>('browse');
  const selectBook = useLibraryStore(s => s.selectBook);
  const selectChapter = useLibraryStore(s => s.selectChapter);
  const setVerseRange = useLibraryStore(s => s.setVerseRange);

  const handleSelectVerse = async (bookId: number, chapter: number, verse: number) => {
    await selectBook(bookId);
    await selectChapter(chapter);
    setVerseRange(verse, verse);
    setTab('browse');
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-zinc-100 tracking-tight mb-6 flex items-center gap-2.5">
        <BookOpen size={20} className="text-brand-400" />
        Bible
      </h1>

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
      </div>

      {tab === 'browse' ? <BibleBrowser /> : <BibleSearch onSelectVerse={handleSelectVerse} />}
    </div>
  );
}
