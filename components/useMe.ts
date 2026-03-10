'use client'

import { useCallback, useEffect, useState } from 'react'

export interface MeResponse {
  segmentationEnabled: boolean
  user: {
    id: string
    email: string
    name: string | null
    segment: string
  }
  enabledModules: string[]
  segments: Array<{ key: string; label: string; description: string }>
  moduleCatalog: Record<string, { key: string; name: string; description: string; href: string }>
}

export function useMe() {
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/me')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setMe(null)
        setError(data?.error || 'Erro ao carregar /api/me')
        return
      }
      setMe(await res.json())
    } catch (e: any) {
      setMe(null)
      setError(e?.message || 'Erro ao carregar /api/me')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { me, loading, error, refresh }
}

