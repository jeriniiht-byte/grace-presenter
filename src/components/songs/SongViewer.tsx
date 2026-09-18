import { Plus } from 'lucide-react';
import { useLibraryStore } from '../../state/useLibraryStore';
import { useServiceStore } from '../../state/useServiceStore';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ta: 'Tamil',
  ml: 'Malayalam'
};

function formatSectionLabel(key: string): string {
  const match = key.match(/^([a-zA-Z]+)(\d*)$/);
  if (!match) return key;
  const [, word, num] = match;
  const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
  return num ? `${capitalized} ${num}` : capitalized;
}

export default function SongViewer() {
  const selectedSongId = useLibraryStore(s => s.selectedSongId);
  const selectedSongStructure = useLibraryStore(s => s.selectedSongStructure);
  const selectedSongTranslations = useLibraryStore(s => s.selectedSongTranslations);
  const selectedSongTranslationId = useLibraryStore(s => s.selectedSongTranslationId);
  const selectedSongSections = useLibraryStore(s => s.selectedSongSections);
  const isLoadingSongDetail = useLibraryStore(s => s.isLoadingSongDetail);
  const selectSongTranslation = useLibraryStore(s => s.selectSongTranslation);

  const currentServiceId = useServiceStore(s => s.currentServiceId);
  const addItem = useServiceStore(s => s.addItem);

  if (!selectedSongId) {
    return <p className="text-zinc-400 text-sm">Select a song to view its lyrics.</p>;
  }

  if (isLoadingSongDetail) {
    return <p className="text-zinc-400 text-sm">Loading...</p>;
  }

  const currentTranslation = selectedSongTranslations.find(t => t.id === selectedSongTranslationId);
  const sectionsByKey = new Map(selectedSongSections.map(s => [s.sectionKey, s]));

  const handleAddToService = async () => {
    if (!currentServiceId || !currentTranslation) return;
    await addItem('song', currentTranslation.title, {
      songId: selectedSongId,
      songLanguageCode: currentTranslation.languageCode
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800/80 rounded-lg p-1">
          {selectedSongTranslations.map(t => (
            <button
              key={t.id}
              onClick={() => selectSongTranslation(t.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                t.id === selectedSongTranslationId
                  ? 'bg-brand-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {LANGUAGE_LABELS[t.languageCode] ?? t.languageCode}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddToService}
          disabled={!currentServiceId || !currentTranslation}
          className="ml-auto flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
          title={!currentServiceId ? 'Create or select a service in the Planner first' : undefined}
        >
          <Plus size={14} />
          Add to Service
        </button>
      </div>

      {currentTranslation && (
        <div className="border-b border-zinc-800/80 pb-4">
          <h2 className="text-xl font-semibold text-zinc-100">{currentTranslation.title}</h2>
          {currentTranslation.transliteration && (
            <p className="text-sm text-zinc-500 mt-0.5">{currentTranslation.transliteration}</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {selectedSongStructure.map((sectionKey, idx) => {
          const section = sectionsByKey.get(sectionKey);
          return (
            <div key={`${sectionKey}-${idx}`}>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-400/80 mb-1.5">
                {formatSectionLabel(sectionKey)}
              </div>
              {section ? (
                <>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-200">{section.text}</div>
                  {section.transliteration && (
                    <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-500 mt-1">
                      {section.transliteration}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-zinc-600 italic">Missing section</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
