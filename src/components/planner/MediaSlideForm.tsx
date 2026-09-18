import { useState } from 'react';
import { Image, Video } from 'lucide-react';
import { useServiceStore } from '../../state/useServiceStore';
import * as servicesDb from '../../db/services';
import { pickBackgroundMedia, type BackgroundMediaKind } from '../../services/media/backgroundMedia';

export default function MediaSlideForm() {
  const currentServiceId = useServiceStore(s => s.currentServiceId);
  const addItem = useServiceStore(s => s.addItem);
  const [isBusy, setIsBusy] = useState(false);

  const handleAdd = async (kind: BackgroundMediaKind) => {
    if (!currentServiceId) return;
    setIsBusy(true);
    try {
      const picked = await pickBackgroundMedia(kind);
      if (!picked) return;
      const label = kind === 'image' ? 'Image Slide' : 'Video Slide';
      const slide = await servicesDb.createMediaSlide(label, picked.relativePath, picked.kind);
      await addItem('custom', label, { customSlideId: slide.id });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAdd('image')}
        disabled={!currentServiceId || isBusy}
        className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium py-1.5 px-3 rounded-lg transition-colors text-zinc-300"
        title={!currentServiceId ? 'Create or select a service first' : undefined}
      >
        <Image size={14} />
        Add Image Slide
      </button>
      <button
        onClick={() => handleAdd('video')}
        disabled={!currentServiceId || isBusy}
        className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium py-1.5 px-3 rounded-lg transition-colors text-zinc-300"
        title={!currentServiceId ? 'Create or select a service first' : undefined}
      >
        <Video size={14} />
        Add Video Slide
      </button>
    </div>
  );
}
