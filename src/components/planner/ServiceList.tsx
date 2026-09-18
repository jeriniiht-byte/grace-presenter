import { useEffect, useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { useServiceStore } from '../../state/useServiceStore';

export default function ServiceList() {
  const services = useServiceStore(s => s.services);
  const currentServiceId = useServiceStore(s => s.currentServiceId);
  const loadServicesList = useServiceStore(s => s.loadServicesList);
  const loadService = useServiceStore(s => s.loadService);
  const createNewService = useServiceStore(s => s.createNewService);
  const deleteService = useServiceStore(s => s.deleteService);

  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadServicesList();
  }, [loadServicesList]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await createNewService(name);
    setNewName('');
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this service and all its items?')) {
      await deleteService(id);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New service name..."
          className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={!newName.trim()}
          className="flex items-center justify-center bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white w-9 shrink-0 rounded-lg transition-colors"
          title="Create service"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-1">
        {services.length === 0 ? (
          <p className="text-zinc-500 text-sm">No services yet.</p>
        ) : (
          services.map(service => (
            <div
              key={service.id}
              onClick={() => loadService(service.id)}
              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer border transition-colors ${
                service.id === currentServiceId
                  ? 'bg-brand-600/15 border-brand-600/40'
                  : 'border-transparent hover:bg-zinc-900'
              }`}
            >
              <Calendar size={14} className={service.id === currentServiceId ? 'text-brand-400' : 'text-zinc-600'} />
              <span className={`flex-1 truncate ${service.id === currentServiceId ? 'text-brand-200' : 'text-zinc-300'}`}>
                {service.name}
              </span>
              <button
                onClick={e => handleDelete(service.id, e)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete service"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
