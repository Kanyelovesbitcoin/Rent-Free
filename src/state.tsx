import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { decodeSelection, emptySelection, SelectionSchema, type Item, type Selection } from './lib/selection'

const STORAGE_KEY = 'rent-free:selection:v1'

function loadStored(): Selection {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = SelectionSchema.safeParse(JSON.parse(raw))
      if (parsed.success) return parsed.data
    }
  } catch {
    // Private window / blocked storage: just start fresh.
  }
  return emptySelection()
}

interface Ctx {
  selection: Selection
  setSelection: (s: Selection) => void
  upsertItem: (item: Item) => void
  removeItem: (id: string) => void
  setServer: (monthly: number) => void
  clear: () => void
}

const SelectionContext = createContext<Ctx | null>(null)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection>(loadStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
    } catch {
      // ignore
    }
  }, [selection])

  const upsertItem = useCallback(
    (item: Item) =>
      setSelection((s) => {
        const i = s.items.findIndex((x) => x.id === item.id)
        const items = [...s.items]
        if (i === -1) items.push(item)
        else items[i] = item
        return { ...s, items }
      }),
    [],
  )
  const removeItem = useCallback((id: string) => setSelection((s) => ({ ...s, items: s.items.filter((x) => x.id !== id) })), [])
  const setServer = useCallback((server: number) => setSelection((s) => ({ ...s, server })), [])
  const clear = useCallback(() => setSelection(emptySelection()), [])

  const value = useMemo(
    () => ({ selection, setSelection, upsertItem, removeItem, setServer, clear }),
    [selection, upsertItem, removeItem, setServer, clear],
  )
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useSelection() {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error('useSelection must be used inside SelectionProvider')
  return ctx
}

// Shared results links look like #/results?s=<encoded>. Loading one replaces the local selection.
export function useSharedSelection(encoded: string | null) {
  const { setSelection } = useSelection()
  const [shared, setShared] = useState(false)
  useEffect(() => {
    if (!encoded) return
    const decoded = decodeSelection(encoded)
    if (decoded) {
      setSelection(decoded)
      setShared(true)
    }
  }, [encoded, setSelection])
  return shared
}
