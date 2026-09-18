import { create } from 'zustand';
import type { Service } from '../types/db';
import type { ServiceItem, ServiceItemPayload } from '../types/slide';
import * as servicesDb from '../db/services';
import { pickBackgroundMedia, resolveBackgroundUrl, type BackgroundMediaKind } from '../services/media/backgroundMedia';

interface ServiceState {
  services: Service[];
  currentServiceId: number | null;
  currentServiceName: string | null;
  currentServiceBackgroundKind: BackgroundMediaKind | null;
  currentServiceBackgroundUrl: string | null;
  items: ServiceItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadServicesList: () => Promise<void>;
  loadService: (id: number) => Promise<void>;
  createNewService: (name: string) => Promise<number>;
  updateServiceName: (id: number, name: string) => Promise<void>;
  setServiceBackground: (kind: BackgroundMediaKind) => Promise<void>;
  clearServiceBackground: () => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  addItem: (itemType: 'bible' | 'song' | 'custom', label: string, payload: ServiceItemPayload) => Promise<void>;
  reorderItems: (items: Array<{ id: string; position: number }>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  duplicateItem: (itemId: string) => Promise<void>;
  clearCurrent: () => void;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  currentServiceId: null,
  currentServiceName: null,
  currentServiceBackgroundKind: null,
  currentServiceBackgroundUrl: null,
  items: [],
  isLoading: false,
  error: null,

  loadServicesList: async () => {
    try {
      const services = await servicesDb.listServices();
      set({ services });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  loadService: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const [service, items] = await Promise.all([
        servicesDb.getService(id),
        servicesDb.getServiceItems(id)
      ]);
      const backgroundUrl = service?.backgroundMediaPath
        ? await resolveBackgroundUrl(service.backgroundMediaPath)
        : null;
      set({
        currentServiceId: id,
        currentServiceName: service?.name ?? null,
        currentServiceBackgroundKind: service?.backgroundMediaKind ?? null,
        currentServiceBackgroundUrl: backgroundUrl,
        items,
        isLoading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createNewService: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const service = await servicesDb.createService(name);
      set(state => ({
        currentServiceId: service.id,
        currentServiceName: service.name,
        currentServiceBackgroundKind: null,
        currentServiceBackgroundUrl: null,
        items: [],
        isLoading: false,
        services: [service, ...state.services]
      }));
      return service.id;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  setServiceBackground: async (kind: BackgroundMediaKind) => {
    const { currentServiceId } = get();
    if (!currentServiceId) return;
    const picked = await pickBackgroundMedia(kind);
    if (!picked) return;
    await servicesDb.setServiceBackground(currentServiceId, picked.relativePath, picked.kind);
    const url = await resolveBackgroundUrl(picked.relativePath);
    set({ currentServiceBackgroundKind: picked.kind, currentServiceBackgroundUrl: url });
  },

  clearServiceBackground: async () => {
    const { currentServiceId } = get();
    if (!currentServiceId) return;
    await servicesDb.setServiceBackground(currentServiceId, null, null);
    set({ currentServiceBackgroundKind: null, currentServiceBackgroundUrl: null });
  },

  updateServiceName: async (id: number, name: string) => {
    try {
      await servicesDb.updateServiceName(id, name);
      set(state => ({
        currentServiceName: state.currentServiceId === id ? name : state.currentServiceName,
        services: state.services.map(s => (s.id === id ? { ...s, name } : s))
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteService: async (id: number) => {
    try {
      await servicesDb.deleteService(id);
      set(state => ({
        services: state.services.filter(s => s.id !== id),
        ...(state.currentServiceId === id
          ? {
              currentServiceId: null,
              currentServiceName: null,
              currentServiceBackgroundKind: null,
              currentServiceBackgroundUrl: null,
              items: []
            }
          : {})
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  addItem: async (itemType: 'bible' | 'song' | 'custom', label: string, payload: ServiceItemPayload) => {
    const { currentServiceId } = get();
    if (!currentServiceId) throw new Error('No service loaded');

    try {
      const newItem = await servicesDb.addServiceItem(currentServiceId, itemType, label, payload);
      set(state => ({
        items: [...state.items, newItem]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  reorderItems: async (reorderedItems: Array<{ id: string; position: number }>) => {
    const { currentServiceId } = get();
    if (!currentServiceId) throw new Error('No service loaded');

    try {
      // Optimistically update local state
      const itemsMap = new Map(get().items.map(item => [item.id, item]));
      const updated = reorderedItems.map(({ id, position }) => ({
        ...itemsMap.get(id)!,
        position
      }));
      set({ items: updated });

      // Persist to DB
      await servicesDb.updateServiceItemPosition(currentServiceId, reorderedItems);
    } catch (error) {
      // Reload items on error
      get().loadService(currentServiceId);
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteItem: async (itemId: string) => {
    try {
      await servicesDb.deleteServiceItem(itemId);
      set(state => ({
        items: state.items.filter(item => item.id !== itemId)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  duplicateItem: async (itemId: string) => {
    const { currentServiceId } = get();
    if (!currentServiceId) throw new Error('No service loaded');

    try {
      const newItem = await servicesDb.duplicateServiceItem(currentServiceId, itemId);
      set(state => ({
        items: [...state.items, newItem]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  clearCurrent: () => {
    set({
      currentServiceId: null,
      currentServiceBackgroundKind: null,
      currentServiceBackgroundUrl: null,
      items: [],
      error: null
    });
  }
}));
