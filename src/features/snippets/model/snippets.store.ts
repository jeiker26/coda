import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Snippet, defaultSnippets } from './snippets.types'

interface SnippetsState {
  snippets: Snippet[]
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt'>) => void
  updateSnippet: (id: string, updates: Partial<Snippet>) => void
  removeSnippet: (id: string) => void
}

export const useSnippetsStore = create<SnippetsState>()(
  persist(
    (set) => ({
      snippets: defaultSnippets,
      addSnippet: (snippet) =>
        set((s) => ({
          snippets: [
            ...s.snippets,
            { ...snippet, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),
      updateSnippet: (id, updates) =>
        set((s) => ({
          snippets: s.snippets.map((sn) => (sn.id === id ? { ...sn, ...updates } : sn)),
        })),
      removeSnippet: (id) =>
        set((s) => ({ snippets: s.snippets.filter((sn) => sn.id !== id) })),
    }),
    {
      name: 'mac-agent-snippets',
    }
  )
)
