import { BookOpen, Music, FileText, ChevronUp, ChevronDown, Copy, X, ListMusic } from 'lucide-react';
import { useServiceStore } from '../../state/useServiceStore';

const ICONS: Record<string, typeof BookOpen> = {
  bible: BookOpen,
  song: Music,
  custom: FileText
};

interface QueueListProps {
  editable?: boolean;
}

export default function QueueList({ editable = false }: QueueListProps) {
  const items = useServiceStore(s => s.items);
  const deleteItem = useServiceStore(s => s.deleteItem);
  const duplicateItem = useServiceStore(s => s.duplicateItem);
  const reorderItems = useServiceStore(s => s.reorderItems);

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorderItems(reordered.map((item, i) => ({ id: item.id, position: i + 1 })));
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-2 py-8 px-2 text-zinc-500">
        <ListMusic size={24} strokeWidth={1.5} className="text-zinc-700" />
        <p className="text-sm">Add items from Bible or Songs</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item, idx) => {
        const Icon = ICONS[item.itemType] ?? FileText;
        return (
          <div
            key={item.id}
            className="group flex items-center gap-2.5 bg-zinc-900 border border-zinc-800/80 rounded-lg px-2.5 py-2 text-sm hover:border-zinc-700 transition-colors"
          >
            <span className="text-zinc-600 font-mono text-xs w-4 text-right shrink-0">{idx + 1}</span>
            <Icon size={14} className="text-zinc-500 shrink-0" />
            <span className="flex-1 truncate text-zinc-200" title={item.label}>{item.label}</span>
            {editable && (
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => moveItem(idx, -1)}
                  disabled={idx === 0}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-400"
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveItem(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-400"
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => duplicateItem(item.id)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400"
                  title="Duplicate"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-400"
                  title="Delete"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
