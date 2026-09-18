import { open } from '@tauri-apps/plugin-dialog';
import { copyFile, mkdir, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';

export type BackgroundMediaKind = 'image' | 'video';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];
const BACKGROUNDS_DIR = 'backgrounds';

export interface PickedBackground {
  /** Path relative to the app data dir, e.g. "backgrounds/abc123.mp4". Store this in the DB. */
  relativePath: string;
  kind: BackgroundMediaKind;
}

function extensionOf(path: string): string {
  const dot = path.lastIndexOf('.');
  return dot === -1 ? '' : path.slice(dot + 1).toLowerCase();
}

export async function pickBackgroundMedia(kind: BackgroundMediaKind): Promise<PickedBackground | null> {
  const extensions = kind === 'image' ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS;
  const selected = await open({
    title: kind === 'image' ? 'Choose a background image' : 'Choose a background video',
    multiple: false,
    directory: false,
    filters: [{ name: kind === 'image' ? 'Images' : 'Videos', extensions }]
  });
  if (!selected) return null;

  const sourcePath = Array.isArray(selected) ? selected[0] : selected;
  const ext = extensionOf(sourcePath);

  const dirExists = await exists(BACKGROUNDS_DIR, { baseDir: BaseDirectory.AppData });
  if (!dirExists) {
    await mkdir(BACKGROUNDS_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  const relativePath = `${BACKGROUNDS_DIR}/${filename}`;

  await copyFile(sourcePath, relativePath, { toPathBaseDir: BaseDirectory.AppData });

  return { relativePath, kind };
}

export async function resolveBackgroundUrl(relativePath: string): Promise<string> {
  const dataDir = await appDataDir();
  const absolutePath = await join(dataDir, relativePath);
  return convertFileSrc(absolutePath);
}
