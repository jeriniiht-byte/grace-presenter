import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useLibraryStore } from '../../state/useLibraryStore';
import { useServiceStore } from '../../state/useServiceStore';

export default function BibleBrowser() {
  const translations = useLibraryStore(s => s.translations);
  const books = useLibraryStore(s => s.books);
  const selectedTranslationId = useLibraryStore(s => s.selectedTranslationId);
  const additionalTranslationIds = useLibraryStore(s => s.additionalTranslationIds);
  const selectedBookId = useLibraryStore(s => s.selectedBookId);
  const selectedChapter = useLibraryStore(s => s.selectedChapter);
  const verses = useLibraryStore(s => s.verses);
  const verseRangeStart = useLibraryStore(s => s.verseRangeStart);
  const verseRangeEnd = useLibraryStore(s => s.verseRangeEnd);
  const isLoadingVerses = useLibraryStore(s => s.isLoadingVerses);
  const bookName = useLibraryStore(s => s.bookName);

  const loadBibleReferenceData = useLibraryStore(s => s.loadBibleReferenceData);
  const selectBibleTranslation = useLibraryStore(s => s.selectBibleTranslation);
  const toggleAdditionalTranslation = useLibraryStore(s => s.toggleAdditionalTranslation);
  const selectBook = useLibraryStore(s => s.selectBook);
  const selectChapter = useLibraryStore(s => s.selectChapter);
  const setVerseRange = useLibraryStore(s => s.setVerseRange);

  const currentServiceId = useServiceStore(s => s.currentServiceId);
  const addItem = useServiceStore(s => s.addItem);

  useEffect(() => {
    loadBibleReferenceData();
  }, [loadBibleReferenceData]);

  const handleVerseClick = (verseNumber: number, shiftKey: boolean) => {
    if (shiftKey && verseRangeStart !== null) {
      const start = Math.min(verseRangeStart, verseNumber);
      const end = Math.max(verseRangeStart, verseNumber);
      setVerseRange(start, end);
    } else {
      setVerseRange(verseNumber, verseNumber);
    }
  };

  const handleAddToService = async () => {
    if (!currentServiceId || !selectedTranslationId || !selectedBookId) return;
    if (verseRangeStart === null || verseRangeEnd === null) return;

    const name = bookName(selectedBookId);
    const label = verseRangeStart === verseRangeEnd
      ? `${name} ${selectedChapter}:${verseRangeStart}`
      : `${name} ${selectedChapter}:${verseRangeStart}-${verseRangeEnd}`;

    await addItem('bible', label, {
      bibleTranslationIds: [selectedTranslationId, ...additionalTranslationIds],
      bibleBookId: selectedBookId,
      bibleChapter: selectedChapter,
      bibleVerseStart: verseRangeStart,
      bibleVerseEnd: verseRangeEnd
    });
  };

  const hasRange = verseRangeStart !== null && verseRangeEnd !== null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <select
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
          value={selectedTranslationId ?? ''}
          onChange={e => selectBibleTranslation(Number(e.target.value))}
        >
          {translations.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
          ))}
        </select>

        <select
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors min-w-[10rem]"
          value={selectedBookId ?? ''}
          onChange={e => selectBook(Number(e.target.value))}
        >
          <option value="" disabled>Select a book</option>
          {books.map(b => (
            <option key={b.id} value={b.id}>{bookName(b.id)}</option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors w-20"
          value={selectedChapter}
          onChange={e => selectChapter(Number(e.target.value) || 1)}
          disabled={!selectedBookId}
        />
      </div>

      {translations.length > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-500">Also show:</span>
          {translations.filter(t => t.id !== selectedTranslationId).map(t => (
            <label key={t.id} className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={additionalTranslationIds.includes(t.id)}
                onChange={() => toggleAdditionalTranslation(t.id)}
                className="accent-brand-600"
              />
              {t.name} ({t.code})
            </label>
          ))}
        </div>
      )}

      {hasRange && (
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5">
          <span className="text-sm text-zinc-300">
            {verseRangeStart === verseRangeEnd ? `Verse ${verseRangeStart}` : `Verses ${verseRangeStart}-${verseRangeEnd}`} selected
          </span>
          <button
            onClick={handleAddToService}
            disabled={!currentServiceId}
            className="ml-auto flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
            title={!currentServiceId ? 'Create or select a service in the Planner first' : undefined}
          >
            <Plus size={14} />
            Add to Service
          </button>
        </div>
      )}

      <div className="space-y-0.5">
        {isLoadingVerses ? (
          <p className="text-zinc-500 text-sm">Loading...</p>
        ) : verses.length === 0 ? (
          <p className="text-zinc-500 text-sm">No verses found for this chapter. Try John 3, Psalm 23, or Romans 8 (sample content).</p>
        ) : (
          verses.map(v => {
            const isSelected = hasRange && v.verse >= verseRangeStart! && v.verse <= verseRangeEnd!;
            return (
              <div
                key={v.id}
                onClick={e => handleVerseClick(v.verse, e.shiftKey)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm leading-relaxed border transition-colors ${
                  isSelected ? 'bg-brand-600/15 border-brand-600/40 text-brand-100' : 'border-transparent hover:bg-zinc-900 text-zinc-300'
                }`}
              >
                <span className="text-zinc-600 font-mono mr-2">{v.verse}</span>
                {v.text}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
