import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useServiceStore } from '../../state/useServiceStore';
import * as servicesDb from '../../db/services';

export default function CustomSlideForm() {
  const currentServiceId = useServiceStore(s => s.currentServiceId);
  const addItem = useServiceStore(s => s.addItem);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!currentServiceId || !body.trim()) return;
    setIsSaving(true);
    try {
      const slide = await servicesDb.createCustomSlide(title.trim() || null, body.trim());
      await addItem('custom', title.trim() || 'Custom Slide', { customSlideId: slide.id });
      setTitle('');
      setBody('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Title (optional)"
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Slide text..."
        rows={4}
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors resize-none"
        value={body}
        onChange={e => setBody(e.target.value)}
      />
      <button
        onClick={handleAdd}
        disabled={!currentServiceId || !body.trim() || isSaving}
        className="self-end flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
        title={!currentServiceId ? 'Create or select a service first' : undefined}
      >
        <Plus size={14} />
        Add to Service
      </button>
    </div>
  );
}
