import { useLibraryStore } from '../../state/useLibraryStore';

interface BibleSearchProps {
  onSelectVerse: (bookId: number, chapter: number, verse: number) => void;
}

export default function BibleSearch({ onSelectVerse }: BibleSearchProps) {
  const bibleSearchQuery = useLibraryStore(s => s.bibleSearchQuery);
  const bibleSearchResults = useLibraryStore(s => s.bibleSearchResults);
  const isSearchingBible = useLibraryStore(s => s.isSearchingBible);
  const searchBible = useLibraryStore(s => s.searchBible);
  const bookName = useLibraryStore(s => s.bookName);

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search verse text..."
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
        value={bibleSearchQuery}
        onChange={e => searchBible(e.target.value)}
      />

      <div className="space-y-1">
        {isSearchingBible ? (
          <p className="text-zinc-400 text-sm">Searching...</p>
        ) : bibleSearchQuery && bibleSearchResults.length === 0 ? (
          <p className="text-zinc-400 text-sm">No matches found.</p>
        ) : (
          bibleSearchResults.map(v => (
            <div
              key={v.id}
              onClick={() => onSelectVerse(v.bookId, v.chapter, v.verse)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            >
              <div className="text-brand-400 text-xs font-medium mb-0.5">{bookName(v.bookId)} {v.chapter}:{v.verse}</div>
              <div className="leading-relaxed text-zinc-300">{v.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
