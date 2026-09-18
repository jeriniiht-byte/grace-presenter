import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Music, ClipboardList, Settings, ArrowRight, Clock } from 'lucide-react';
import { useServiceStore } from '../../state/useServiceStore';

const QUICK_ACTIONS = [
  { path: '/bible', icon: BookOpen, label: 'Bible', description: 'Browse and search scripture' },
  { path: '/songs', icon: Music, label: 'Songs', description: 'Browse your song library' },
  { path: '/planner', icon: ClipboardList, label: 'Planner', description: 'Build and manage services' },
  { path: '/settings', icon: Settings, label: 'Settings', description: 'Themes and preferences' }
];

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(`${iso}Z`).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const services = useServiceStore(s => s.services);
  const loadServicesList = useServiceStore(s => s.loadServicesList);
  const loadService = useServiceStore(s => s.loadService);

  useEffect(() => {
    loadServicesList();
  }, [loadServicesList]);

  const handleOpenService = async (id: number) => {
    await loadService(id);
    navigate('/planner');
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Welcome back</h1>
        <p className="text-zinc-500 text-sm mt-1">Here's a quick overview of your presentation library.</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-10">
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="group text-left bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-4 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-600/15 flex items-center justify-center mb-3">
                <Icon size={17} className="text-brand-400" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-zinc-100">
                {action.label}
                <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-zinc-500" />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{action.description}</p>
            </button>
          );
        })}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <Clock size={14} className="text-zinc-500" />
          Recent Services
        </h2>
        {services.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-500">No services yet.</p>
            <button
              onClick={() => navigate('/planner')}
              className="text-sm text-brand-400 hover:text-brand-300 font-medium mt-1"
            >
              Create your first service →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {services.slice(0, 6).map(service => (
              <button
                key={service.id}
                onClick={() => handleOpenService(service.id)}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-lg px-4 py-3 text-left transition-colors"
              >
                <span className="text-sm font-medium text-zinc-200 truncate">{service.name}</span>
                <span className="text-xs text-zinc-500 shrink-0 ml-3">{formatRelativeTime(service.updatedAt)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
