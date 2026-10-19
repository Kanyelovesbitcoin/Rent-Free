import { useEffect, useState } from 'react'
import type { RemakeConfig } from './agentPrompt'

// Remake (and game builder) choices are saved per tool in this browser only, so they survive a refresh.
export function useStoredConfig<T extends object>(storageKey: string, defaults: T) {
  const [config, setConfig] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return { ...defaults, ...JSON.parse(raw) }
    } catch {
      // ignore: private window / blocked storage
    }
    return defaults
  })
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config))
    } catch {
      // ignore
    }
  }, [storageKey, config])
  const reset = () => setConfig(defaults)
  return [config, setConfig, reset] as const
}

export const useRemakeConfig = (id: string, defaults: RemakeConfig) => useStoredConfig(`rent-free:remake:${id}`, defaults)
