import { ListMusic } from 'lucide-react';
import { useServiceStore } from '../../state/useServiceStore';
import QueueList from '../queue/QueueList';

export default function QueuePanel() {
  const currentServiceId = useServiceStore(s => s.currentServiceId);
  const currentServiceName = useServiceStore(s => s.currentServiceName);
  const items = useServiceStore(s => s.items);

  if (!currentServiceId) {
    return (
      <div className="w-72 bg-zinc-950 border-l border-zinc-800/80 p-5 overflow-auto">
        <h2 className="font-semibold text-sm text-zinc-300 mb-4 flex items-center gap-2">
          <ListMusic size={15} />
          Service Queue
        </h2>
        <div className="flex flex-col items-center text-center gap-2 py-10 px-2 text-zinc-500">
          <ListMusic size={28} strokeWidth={1.5} className="text-zinc-700" />
          <p className="text-sm">No service loaded.</p>
          <p className="text-xs">Create one in the Planner to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-zinc-950 border-l border-zinc-800/80 p-5 overflow-auto">
      <h2 className="font-semibold text-sm text-zinc-100 mb-0.5 truncate" title={currentServiceName ?? undefined}>
        {currentServiceName}
      </h2>
      <p className="text-xs text-zinc-500 mb-4">{items.length} item{items.length === 1 ? '' : 's'} in queue</p>
      <QueueList />
    </div>
  );
}
