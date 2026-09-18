import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

// The release repo is private, so GitHub requires auth to fetch release assets
// (including the update manifest). Read from a build-time env var (see .env,
// which is gitignored) rather than hardcoding a token in source.
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_UPDATER_TOKEN as string | undefined;

function authHeaders(): HeadersInit | undefined {
  return GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : undefined;
}

export interface UpdateCheckResult {
  available: boolean;
  version?: string;
  notes?: string;
}

export async function checkForAppUpdate(): Promise<UpdateCheckResult> {
  const update = await check({ headers: authHeaders() });
  if (!update) return { available: false };
  return { available: true, version: update.version, notes: update.body };
}

export async function downloadAndInstallUpdate(onProgress?: (percent: number) => void): Promise<void> {
  const update = await check({ headers: authHeaders() });
  if (!update) throw new Error('No update available');

  let downloaded = 0;
  let total = 0;
  await update.downloadAndInstall(event => {
    if (event.event === 'Started') {
      total = event.data.contentLength ?? 0;
    } else if (event.event === 'Progress') {
      downloaded += event.data.chunkLength;
      if (total > 0) onProgress?.(Math.round((downloaded / total) * 100));
    }
  });

  await relaunch();
}
