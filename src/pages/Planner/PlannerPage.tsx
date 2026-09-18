import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useServiceStore } from '../../state/useServiceStore';
import ServiceList from '../../components/planner/ServiceList';
import CustomSlideForm from '../../components/planner/CustomSlideForm';
import MediaSlideForm from '../../components/planner/MediaSlideForm';
import QueueList from '../../components/queue/QueueList';
import BackgroundPicker from '../../components/settings/BackgroundPicker';

interface ServiceNameEditorProps {
  serviceId: number;
  name: string;
}

function ServiceNameEditor({ serviceId, name }: ServiceNameEditorProps) {
  const updateServiceName = useServiceStore(s => s.updateServiceName);
  const [nameDraft, setNameDraft] = useState(name);

  const commitNameChange = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== name) {
      updateServiceName(serviceId, trimmed);
    }
  };

  return (
    <input
      type="text"
      value={nameDraft}
      onChange={e => setNameDraft(e.target.value)}
      onBlur={commitNameChange}
      onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      className="text-xl font-bold bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-brand-500 focus:outline-none px-1 py-1"
    />
  );
}

export default function PlannerPage() {
  const currentServiceId = useServiceStore(s => s.currentServiceId);
  const currentServiceName = useServiceStore(s => s.currentServiceName);
  const currentServiceBackgroundUrl = useServiceStore(s => s.currentServiceBackgroundUrl);
  const currentServiceBackgroundKind = useServiceStore(s => s.currentServiceBackgroundKind);
  const setServiceBackground = useServiceStore(s => s.setServiceBackground);
  const clearServiceBackground = useServiceStore(s => s.clearServiceBackground);

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-zinc-100 tracking-tight mb-6 flex items-center gap-2.5">
        <ClipboardList size={20} className="text-brand-400" />
        Service Planner
      </h1>

      <div className="grid grid-cols-[16rem_1fr] gap-8">
        <div>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2.5">Services</h2>
          <ServiceList />
        </div>

        <div>
          {!currentServiceId ? (
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-6 text-center">
              <p className="text-zinc-400 text-sm">Select or create a service to start building the queue.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              <ServiceNameEditor key={currentServiceId} serviceId={currentServiceId} name={currentServiceName ?? ''} />

              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2.5">Background</h3>
                <p className="text-xs text-zinc-500 mb-2">Overrides the theme's background for this service only.</p>
                <BackgroundPicker
                  currentUrl={currentServiceBackgroundUrl}
                  currentKind={currentServiceBackgroundKind}
                  onPick={setServiceBackground}
                  onClear={clearServiceBackground}
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2.5">Add Custom Slide</h3>
                <CustomSlideForm />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2.5">Add Media Slide</h3>
                <p className="text-xs text-zinc-500 mb-2">Inserts a full-screen image or video as its own slide in the queue.</p>
                <MediaSlideForm />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2.5">Queue</h3>
                <QueueList editable />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
