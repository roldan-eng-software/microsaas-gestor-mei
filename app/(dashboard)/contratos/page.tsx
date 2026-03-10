'use client'

import Link from 'next/link'
import { useMe } from '@/components/useMe'

export default function ContratosPage() {
  const { me, loading, error } = useMe()

  if (loading) return <div className="text-center">Carregando...</div>
  if (error) return <div className="text-center text-red-600">{error}</div>
  if (!me) return <div className="text-center">Sem dados do usuário.</div>

  if (me.segmentationEnabled && !me.enabledModules.includes('contratos')) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Contratos</h2>
        <p className="text-gray-600">Este módulo não está habilitado para o seu perfil.</p>
        <Link href="/(dashboard)/segmento" className="text-indigo-600 hover:text-indigo-900 text-sm">
          Ajustar segmento
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Contratos</h2>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-2">
        <p className="text-gray-700">
          Placeholder do módulo de contratos. Aqui entram templates, status (rascunho/assinado) e anexos.
        </p>
        <p className="text-sm text-gray-500">
          Próximo passo: definir o modelo (contracts) e integrar com clientes e serviços.
        </p>
      </div>
    </div>
  )
}

