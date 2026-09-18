import { Link, useLocation } from 'react-router-dom';
import { Church, LayoutDashboard, BookOpen, Music, ClipboardList, Settings, MonitorPlay, Loader2 } from 'lucide-react';

interface SidebarProps {
  onPresent: () => void;
  isPresentDisabled?: boolean;
}

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/bible', icon: BookOpen, label: 'Bible' },
  { path: '/songs', icon: Music, label: 'Songs' },
  { path: '/planner', icon: ClipboardList, label: 'Planner' },
  { path: '/settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar({ onPresent, isPresentDisabled }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="w-56 bg-zinc-950 border-r border-zinc-800/80 flex flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <Church size={18} className="text-white" />
        </div>
        <span className="font-semibold text-[15px] text-zinc-100 tracking-tight">Grace Presenter</span>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600/15 text-brand-300'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Icon size={17} strokeWidth={2} className={isActive ? 'text-brand-400' : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <button
          onClick={onPresent}
          disabled={isPresentDisabled}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 px-3 rounded-lg transition-colors shadow-lg shadow-brand-950/50"
        >
          {isPresentDisabled ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Building...
            </>
          ) : (
            <>
              <MonitorPlay size={16} />
              Start Presentation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
