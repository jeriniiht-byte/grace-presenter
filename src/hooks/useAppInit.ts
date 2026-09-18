import { useEffect } from 'react';
import { useSettingsStore } from '../state/useSettingsStore';
import { useThemeStore } from '../state/useThemeStore';

export function useAppInit() {
  const loadSettings = useSettingsStore(state => state.loadSettings);
  const loadFromSettings = useThemeStore(state => state.loadFromSettings);

  useEffect(() => {
    Promise.all([loadSettings(), loadFromSettings()]).catch(error => {
      console.error('Failed to initialize app:', error);
    });
  }, [loadSettings, loadFromSettings]);
}
