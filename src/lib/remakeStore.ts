import { useEffect, useState } from 'react'
import type { RemakeConfig } from './agentPrompt'

// Remake choices are saved per tool in this browser only, so they survive a refresh.
const key = (id: string) => `rent-free:remake:${id}`

export function useRemakeConfig(id: string, defaults: RemakeConfig) {
  const [config, setConfig] = useState<RemakeConfig>(() => {
    try {
      const raw = localStorage.getItem(key(id))
      if (raw) return { ...defaults, ...JSON.parse(raw) }
    } catch {
      // ignore: private window / blocked storage
    }
    return defaults
  })
  useEffect(() => {
    try {
      localStorage.setItem(key(id), JSON.stringify(config))
    } catch {
      // ignore
    }
  }, [id, config])
  const reset = () => setConfig(defaults)
  return [config, setConfig, reset] as const
}
