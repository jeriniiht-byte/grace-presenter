import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useServiceStore } from '../../state/useServiceStore';
import { usePresentationStore } from '../../state/usePresentationStore';
import { buildSlideDeck } from '../../services/slides/buildSlideDeck';
import { openDisplayWindow } from '../../services/presentation/presentationBridge';
import Sidebar from './Sidebar';
import QueuePanel from './QueuePanel';

export default function AppShell() {
  const navigate = useNavigate();
  const currentServiceId = useServiceStore(s => s.currentServiceId);
  const items = useServiceStore(s => s.items);
  const startPresentation = usePresentationStore(s => s.startPresentation);
  const [isBuilding, setIsBuilding] = useState(false);

  const handlePresent = async () => {
    if (!currentServiceId) {
      alert('Please create or select a service first');
      return;
    }
    if (items.length === 0) {
      alert('This service has no items yet. Add some from Bible, Songs, or the Planner.');
      return;
    }

    setIsBuilding(true);
    try {
      const slideGroups = await Promise.all(items.map(item => buildSlideDeck(item)));
      const flatSlides = slideGroups.flat();
      if (flatSlides.length === 0) {
        alert('No slides could be generated from this service.');
        return;
      }
      startPresentation(flatSlides);
      await openDisplayWindow();
      navigate('/presenter');
    } catch (error) {
      console.error('Failed to build presentation:', error);
      alert('Failed to build the presentation. Check the console for details.');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <Sidebar onPresent={handlePresent} isPresentDisabled={isBuilding} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>

      {/* Queue Panel */}
      <QueuePanel />
    </div>
  );
}
