import { useState } from 'react';
import { RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { checkForAppUpdate, downloadAndInstallUpdate } from '../../services/update/checkForUpdates';

type Status = 'idle' | 'checking' | 'up-to-date' | 'available' | 'downloading' | 'error';

export default function UpdateChecker() {
  const [status, setStatus] = useState<Status>('idle');
  const [version, setVersion] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setStatus('checking');
    setError(null);
    try {
      const result = await checkForAppUpdate();
      if (result.available) {
        setVersion(result.version ?? null);
        setStatus('available');
      } else {
        setStatus('up-to-date');
      }
    } catch (err) {
      console.error('Update check failed:', err);
      setError('Could not check for updates. Check your internet connection.');
      setStatus('error');
    }
  };

  const handleInstall = async () => {
    setStatus('downloading');
    setProgress(0);
    setError(null);
    try {
      await downloadAndInstallUpdate(setProgress);
      // App relaunches automatically after this on most platforms.
    } catch (err) {
      console.error('Update install failed:', err);
      setError('Failed to download or install the update.');
      setStatus('error');
    }
  };

  return (
    <div className="flex items-center gap-3">
      {status === 'idle' || status === 'checking' ? (
        <button
          onClick={handleCheck}
          disabled={status === 'checking'}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-50 text-sm font-medium py-1.5 px-3 rounded-lg transition-colors text-zinc-300"
        >
          <RefreshCw size={14} className={status === 'checking' ? 'animate-spin' : ''} />
          {status === 'checking' ? 'Checking...' : 'Check for Updates'}
        </button>
      ) : status === 'up-to-date' ? (
        <p className="text-sm text-zinc-400 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-green-500" />
          You're up to date
        </p>
      ) : status === 'available' ? (
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
        >
          <Download size={14} />
          Install Update {version ? `v${version}` : ''}
        </button>
      ) : status === 'downloading' ? (
        <p className="text-sm text-zinc-400">Downloading and installing... {progress}%</p>
      ) : null}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
