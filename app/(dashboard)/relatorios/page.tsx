'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ReportData {
  period: string
  totalReceived: number
  totalExpenses: number
  netIncome: number
  entries: Array<{
    id: string
    type: string
    description: string
    amount: number
    date: string
    clientName?: string
  }>
  summary: {
    totalEntries: number
    averageEntry: number
    largestEntry: number
  }
}

export default function RelatoriosPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    fetchReport()
  }, [period])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    try {
      const response = await fetch(`/api/reports/pdf?period=${period}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_${period}_${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
    }
  }

  const generateHTML = async () => {
    try {
      const response = await fetch(`/api/reports/html?period=${period}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_${period}_${new Date().toISOString().split('T')[0]}.html`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao gerar HTML:', error)
    }
  }

  if (loading) {
    return <div className="text-center">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Relatórios Financeiros</h2>
        <div className="flex space-x-4">
          <button
            onClick={generatePDF}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Gerar PDF
          </button>
          <button
            onClick={generateHTML}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Gerar HTML
          </button>
        </div>
      </div>

      {/* Filtros de período */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="day"
              checked={period === 'day'}
              onChange={(e) => setPeriod(e.target.value)}
              className="mr-2"
            />
            Hoje
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="week"
              checked={period === 'week'}
              onChange={(e) => setPeriod(e.target.value)}
              className="mr-2"
            />
            Esta Semana
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="month"
              checked={period === 'month'}
              onChange={(e) => setPeriod(e.target.value)}
              className="mr-2"
            />
            Este Mês
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="year"
              checked={period === 'year'}
              onChange={(e) => setPeriod(e.target.value)}
              className="mr-2"
            />
            Este Ano
          </label>
        </div>
      </div>

      {/* Resumo do relatório */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-6 rounded-lg shadow-md">
          <h3 className="text-green-600 text-sm font-medium">Total Recebido</h3>
          <p className="text-green-700 text-2xl font-bold mt-2">
            R$ {data?.totalReceived.toFixed(2) || '0,00'}
          </p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg shadow-md">
          <h3 className="text-red-600 text-sm font-medium">Total Despesas</h3>
          <p className="text-red-700 text-2xl font-bold mt-2">
            R$ {data?.totalExpenses.toFixed(2) || '0,00'}
          </p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h3 className="text-blue-600 text-sm font-medium">Lucro Líquido</h3>
          <p className="text-blue-700 text-2xl font-bold mt-2">
            R$ {data?.netIncome.toFixed(2) || '0,00'}
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-500 text-sm">Total de Lançamentos</p>
            <p className="text-gray-800 text-xl font-bold">
              {data?.summary.totalEntries || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Média por Lançamento</p>
            <p className="text-gray-800 text-xl font-bold">
              R$ {data?.summary.averageEntry.toFixed(2) || '0,00'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Maior Lançamento</p>
            <p className="text-gray-800 text-xl font-bold">
              R$ {data?.summary.largestEntry.toFixed(2) || '0,00'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de lançamentos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Lançamentos</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(entry.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.clientName || '-'}</td>
                <td
                  className={`px-6 py-4 whitespace-nowrap font-medium ${
                    entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toFixed(2)}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        {data?.entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum lançamento encontrado
          </div>
        )}
      </div>
    </div>
  )
}