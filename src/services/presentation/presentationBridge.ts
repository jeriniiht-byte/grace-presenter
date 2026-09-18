import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { availableMonitors, currentMonitor } from '@tauri-apps/api/window';
import { emit, listen } from '@tauri-apps/api/event';
import type { Slide } from '../../types/slide';
import type { BackgroundMediaKind } from '../media/backgroundMedia';
import { usePresentationStore } from '../../state/usePresentationStore';
import { useThemeStore } from '../../state/useThemeStore';
import { useServiceStore } from '../../state/useServiceStore';

export const DISPLAY_WINDOW_LABEL = 'presentation-display';
const UPDATE_EVENT = 'grace:presentation-update';
const REQUEST_EVENT = 'grace:presentation-request-state';

export interface PresentationBroadcastState {
  isActive: boolean;
  slides: Slide[];
  currentIndex: number;
  isBlackScreen: boolean;
  themeId: string;
  /** Effective background: the presenting service's own background, falling back to the theme's custom background. */
  backgroundUrl: string | null;
  backgroundKind: BackgroundMediaKind | null;
}

function currentBroadcastState(): PresentationBroadcastState {
  const p = usePresentationStore.getState();
  const t = useThemeStore.getState();
  const s = useServiceStore.getState();

  const backgroundUrl = s.currentServiceBackgroundUrl ?? t.customBackgroundUrl;
  const backgroundKind = s.currentServiceBackgroundUrl ? s.currentServiceBackgroundKind : t.customBackgroundKind;

  return {
    isActive: p.isActive,
    slides: p.slides,
    currentIndex: p.currentIndex,
    isBlackScreen: p.isBlackScreen,
    themeId: t.activeThemeId,
    backgroundUrl,
    backgroundKind
  };
}

function broadcast() {
  emit(UPDATE_EVENT, currentBroadcastState()).catch(error => {
    console.error('Failed to broadcast presentation state:', error);
  });
}

let bridgeInitialized = false;

/** Call once, only from the main (controller) window. */
export function initPresentationBridge(): void {
  if (bridgeInitialized) return;
  bridgeInitialized = true;

  usePresentationStore.subscribe(() => broadcast());
  useThemeStore.subscribe(() => broadcast());
  useServiceStore.subscribe(() => broadcast());

  listen(REQUEST_EVENT, () => broadcast()).catch(error => {
    console.error('Failed to subscribe to presentation state requests:', error);
  });
}

export async function openDisplayWindow(): Promise<void> {
  const existing = await WebviewWindow.getByLabel(DISPLAY_WINDOW_LABEL);
  if (existing) {
    await existing.setFocus();
    broadcast();
    return;
  }

  const [monitors, current] = await Promise.all([availableMonitors(), currentMonitor()]);
  const target = monitors.find(
    m => !current || m.position.x !== current.position.x || m.position.y !== current.position.y
  ) ?? current ?? monitors[0];

  const options: ConstructorParameters<typeof WebviewWindow>[1] = {
    url: 'index.html#/presentation',
    title: 'Grace Presenter - Display',
    fullscreen: true,
    decorations: false,
    skipTaskbar: true
  };

  if (target) {
    const scale = target.scaleFactor;
    options.x = Math.round(target.position.x / scale);
    options.y = Math.round(target.position.y / scale);
    options.width = Math.round(target.size.width / scale);
    options.height = Math.round(target.size.height / scale);
  }

  const win = new WebviewWindow(DISPLAY_WINDOW_LABEL, options);
  win.once('tauri://error', event => {
    console.error('Failed to create display window:', event);
  });
}

export async function closeDisplayWindow(): Promise<void> {
  const existing = await WebviewWindow.getByLabel(DISPLAY_WINDOW_LABEL);
  if (existing) {
    await existing.close();
  }
}

export async function toggleDisplayFullscreen(): Promise<void> {
  const existing = await WebviewWindow.getByLabel(DISPLAY_WINDOW_LABEL);
  if (!existing) return;
  const isFs = await existing.isFullscreen();
  await existing.setFullscreen(!isFs);
}

/** Call from the main window's presenter console; resolves an unlisten function. */
export async function onDisplayWindowClosed(callback: () => void): Promise<() => void> {
  const existing = await WebviewWindow.getByLabel(DISPLAY_WINDOW_LABEL);
  if (!existing) return () => {};
  return existing.once('tauri://destroyed', callback);
}

/** Call from the display window; resolves an unlisten function. */
export function listenForPresentationUpdates(
  handler: (state: PresentationBroadcastState) => void
): Promise<() => void> {
  return listen<PresentationBroadcastState>(UPDATE_EVENT, e => handler(e.payload));
}

export function requestPresentationState(): void {
  emit(REQUEST_EVENT).catch(error => {
    console.error('Failed to request presentation state:', error);
  });
}
