// ============================================================
// Space Store
// Manages AI-generated dynamic spaces
// ============================================================

import { create } from 'zustand'
import type { Space, GeneratedComponent } from '@/types'
import { getStorage } from '@/services/storage'
import { nanoid } from 'nanoid'

interface SpaceState {
  // Spaces
  spaces: Space[]
  currentSpaceId: string | null

  // Generation state
  isGenerating: boolean
  generationProgress: string | null

  // Current space components
  currentComponents: GeneratedComponent[]

  // Actions
  loadSpaces: (_deviceId: string) => Promise<void>
  createSpace: (_deviceId: string, _name: string, _components: GeneratedComponent[]) => Promise<Space>
  updateSpace: (_spaceId: string, _updates: Partial<Space>) => Promise<void>
  deleteSpace: (_spaceId: string) => Promise<void>
  setCurrentSpace: (_spaceId: string | null) => void

  setGenerating: (_generating: boolean, _progress?: string) => void
  setComponents: (_components: GeneratedComponent[]) => void

  // Component interaction
  addComponent: (_component: Omit<GeneratedComponent, 'id'>) => void
  updateComponent: (_componentId: string, _props: Record<string, unknown>) => void
}

export const useSpaceStore = create<SpaceState>((set, get) => ({
  spaces: [],
  currentSpaceId: null,
  isGenerating: false,
  generationProgress: null,
  currentComponents: [],

  loadSpaces: async (deviceId) => {
    const storage = getStorage()
    const spaces = await storage.getSpacesByDevice(deviceId)
    // Sort by updatedAt descending
    spaces.sort((a, b) => b.updatedAt - a.updatedAt)
    set({ spaces })
  },

  createSpace: async (deviceId, name, components) => {
    const storage = getStorage()
    const now = Date.now()
    const space: Space = {
      id: nanoid(),
      deviceId,
      name,
      components,
      createdAt: now,
      updatedAt: now,
    }

    await storage.saveSpace(space)
    set((state) => ({
      spaces: [space, ...state.spaces],
      currentSpaceId: space.id,
      currentComponents: components,
    }))

    return space
  },

  updateSpace: async (spaceId, updates) => {
    const storage = getStorage()
    const space = get().spaces.find((s) => s.id === spaceId)
    if (space) {
      const updatedSpace: Space = {
        ...space,
        ...updates,
        updatedAt: Date.now(),
      }
      await storage.saveSpace(updatedSpace)
      set((state) => ({
        spaces: state.spaces.map((s) =>
          s.id === spaceId ? updatedSpace : s
        ),
      }))
    }
  },

  deleteSpace: async (spaceId) => {
    const storage = getStorage()
    await storage.deleteSpace(spaceId)
    set((state) => ({
      spaces: state.spaces.filter((s) => s.id !== spaceId),
      currentSpaceId:
        state.currentSpaceId === spaceId ? null : state.currentSpaceId,
      currentComponents:
        state.currentSpaceId === spaceId ? [] : state.currentComponents,
    }))
  },

  setCurrentSpace: (spaceId) => {
    const space = get().spaces.find((s) => s.id === spaceId)
    set({
      currentSpaceId: spaceId,
      currentComponents: space?.components || [],
    })
  },

  setGenerating: (generating, progress) =>
    set({ isGenerating: generating, generationProgress: progress || null }),

  setComponents: (components) => set({ currentComponents: components }),

  addComponent: (component) => {
    const newComponent: GeneratedComponent = {
      ...component,
      id: nanoid(),
    }
    set((state) => ({
      currentComponents: [...state.currentComponents, newComponent],
    }))
  },

  updateComponent: (componentId, props) => {
    const updateRecursive = (components: GeneratedComponent[]): GeneratedComponent[] => {
      return components.map((c) => {
        if (c.id === componentId) {
          return { ...c, props: { ...c.props, ...props } }
        }
        if (c.children) {
          return { ...c, children: updateRecursive(c.children) }
        }
        return c
      })
    }

    set((state) => ({
      currentComponents: updateRecursive(state.currentComponents),
    }))
  },
}))
