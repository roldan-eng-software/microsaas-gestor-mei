'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface DashboardData {
  totalRevenue: number
  totalExpenses: number
  recentEntries: Array<{
    id: string
    description: string
    amount: number
    date: string
    clientName?: string
  }>
  clientsCount: number
  servicesCount: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-6 rounded-lg shadow-md">
          <h3 className="text-green-600 text-sm font-medium">Receitas (mês)</h3>
          <p className="text-green-700 text-2xl font-bold mt-2">
            R$ {data?.totalRevenue.toFixed(2) || '0,00'}
          </p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg shadow-md">
          <h3 className="text-red-600 text-sm font-medium">Despesas (mês)</h3>
          <p className="text-red-700 text-2xl font-bold mt-2">
            R$ {data?.totalExpenses.toFixed(2) || '0,00'}
          </p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h3 className="text-blue-600 text-sm font-medium">Saldo</h3>
          <p className="text-blue-700 text-2xl font-bold mt-2">
            R$ {((data?.totalRevenue || 0) - (data?.totalExpenses || 0)).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/(dashboard)/lancamentos"
          className="bg-indigo-600 text-white p-4 rounded-lg text-center hover:bg-indigo-700"
        >
          + Registrar Serviço
        </Link>
        <Link
          href="/(dashboard)/clientes"
          className="bg-gray-600 text-white p-4 rounded-lg text-center hover:bg-gray-700"
        >
          + Adicionar Cliente
        </Link>
        <Link
          href="/(dashboard)/servicos"
          className="bg-gray-600 text-white p-4 rounded-lg text-center hover:bg-gray-700"
        >
          + Adicionar Serviço
        </Link>
        <Link
          href="/(dashboard)/recibos"
          className="bg-gray-600 text-white p-4 rounded-lg text-center hover:bg-gray-700"
        >
          Ver Recibos
        </Link>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 text-sm">Clientes</p>
          <p className="text-gray-800 text-xl font-bold">{data?.clientsCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 text-sm">Serviços</p>
          <p className="text-gray-800 text-xl font-bold">{data?.servicesCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 text-sm">Lançamentos (mês)</p>
          <p className="text-gray-800 text-xl font-bold">
            {data?.recentEntries.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 text-sm">Ticket médio</p>
          <p className="text-gray-800 text-xl font-bold">
            R$ {data && data.recentEntries.length > 0
              ? (data.totalRevenue / data.recentEntries.length).toFixed(2)
              : '0,00'}
          </p>
        </div>
      </div>

      {/* Lançamentos recentes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Lançamentos Recentes</h3>
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
            {data?.recentEntries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(entry.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.clientName || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                  R$ {entry.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.recentEntries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum lançamento recente
          </div>
        )}
      </div>
    </div>
  )
}