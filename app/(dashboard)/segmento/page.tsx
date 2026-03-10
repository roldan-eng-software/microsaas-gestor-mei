'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMe } from '@/components/useMe'
import { segments, type SegmentKey } from '@/lib/segments'
import { segmentModulePresets } from '@/lib/modules/catalog'

export default function SegmentoPage() {
  const { me, loading, error, refresh } = useMe()
  const [segment, setSegment] = useState<SegmentKey>('geral')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!me?.user?.segment) return
    const found = segments.find((s) => s.key === me.user.segment)
    if (found) setSegment(found.key)
  }, [me?.user?.segment])

  const presetModules = useMemo(() => segmentModulePresets[segment] ?? [], [segment])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/me/segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data?.error || 'Erro ao salvar segmento')
        return
      }
      setMessage('Segmento atualizado.')
      await refresh()
    } catch (err: any) {
      setMessage(err?.message || 'Erro ao salvar segmento')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center">Carregando...</div>
  if (error) return <div className="text-center text-red-600">{error}</div>
  if (!me) return <div className="text-center">Sem dados do usuário.</div>

  if (!me.segmentationEnabled) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Segmento</h2>
        <p className="text-gray-600">
          O modo de especialização por segmento está desativado.
        </p>
        <p className="text-sm text-gray-500">Ative com `NEXT_PUBLIC_SEGMENTED_MODULES=true`.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Segmento</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Escolha seu segmento</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={segment}
              onChange={(e) => setSegment(e.target.value as SegmentKey)}
            >
              {segments.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              {segments.find((s) => s.key === segment)?.description}
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">Preset (recomendado)</p>
            <p className="text-sm text-gray-600 mt-1">
              {presetModules.length ? presetModules.join(', ') : 'Nenhum modulo extra para este segmento.'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              O preset habilita modulos, mas nao desabilita modulos ja ativos.
            </p>
          </div>

          {message && <p className="text-sm text-gray-700">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  )
}

