import { useState } from 'react';
import { Image, Video, Trash2 } from 'lucide-react';
import type { BackgroundMediaKind } from '../../services/media/backgroundMedia';

interface BackgroundPickerProps {
  currentUrl: string | null;
  currentKind: BackgroundMediaKind | null;
  onPick: (kind: BackgroundMediaKind) => Promise<void>;
  onClear: () => Promise<void>;
}

export default function BackgroundPicker({ currentUrl, currentKind, onPick, onClear }: BackgroundPickerProps) {
  const [isBusy, setIsBusy] = useState(false);

  const handlePick = async (kind: BackgroundMediaKind) => {
    setIsBusy(true);
    try {
      await onPick(kind);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {currentUrl && (
        <div className="w-24 h-14 rounded-lg overflow-hidden border border-zinc-800 shrink-0">
          {currentKind === 'video' ? (
            <video src={currentUrl} muted className="w-full h-full object-cover" />
          ) : (
            <img src={currentUrl} alt="Background preview" className="w-full h-full object-cover" />
          )}
        </div>
      )}
      <button
        onClick={() => handlePick('image')}
        disabled={isBusy}
        className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 text-sm font-medium py-1.5 px-3 rounded-lg transition-colors text-zinc-300"
      >
        <Image size={14} />
        Choose Image
      </button>
      <button
        onClick={() => handlePick('video')}
        disabled={isBusy}
        className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 text-sm font-medium py-1.5 px-3 rounded-lg transition-colors text-zinc-300"
      >
        <Video size={14} />
        Choose Video
      </button>
      {currentUrl && (
        <button
          onClick={onClear}
          disabled={isBusy}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 disabled:opacity-50 text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
          Clear
        </button>
      )}
    </div>
  );
}
