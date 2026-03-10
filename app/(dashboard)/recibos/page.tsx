'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Receipt {
  id: string
  number: string
  amount: number
  description: string
  date: string
  clientName?: string
  shareUrl: string
  isPublic: boolean
  createdAt: string
}

export default function RecibosPage() {
  const { data: session } = useSession()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/receipts')
      if (response.ok) {
        const data = await response.json()
        setReceipts(data)
      }
    } catch (error) {
      console.error('Erro ao carregar recibos:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReceipt = async (entryId: string) => {
    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialEntryId: entryId }),
      })
      if (response.ok) {
        fetchReceipts()
      }
    } catch (error) {
      console.error('Erro ao gerar recibo:', error)
    }
  }

  if (loading) {
    return <div className="text-center">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Recibos</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receipts.map((receipt) => (
              <tr key={receipt.id}>
                <td className="px-6 py-4 whitespace-nowrap">{receipt.number}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(receipt.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{receipt.clientName || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                  R$ {receipt.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {receipt.isPublic ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Público
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      Privado
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => window.open(receipt.shareUrl, '_blank')}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(receipt.shareUrl)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Copiar Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {receipts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum recibo gerado
          </div>
        )}
      </div>
    </div>
  )
}