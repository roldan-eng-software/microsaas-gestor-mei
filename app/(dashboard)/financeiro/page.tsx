'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface FinanceData {
  totalReceived: number
  totalToReceive: number
  totalExpenses: number
  netIncome: number
  topClients: Array<{
    name: string
    amount: number
    percentage: number
  }>
  topServices: Array<{
    name: string
    count: number
    total: number
  }>
  monthlyGoal: number
  monthlyProgress: number
  goals: Array<{
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    status: string
  }>
}

export default function FinanceiroPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    period: 'monthly',
  })

  useEffect(() => {
    fetchFinanceData()
  }, [])

  const fetchFinanceData = async () => {
    try {
      const response = await fetch('/api/finance-dashboard')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGoal.name,
          targetAmount: parseFloat(newGoal.targetAmount),
          period: newGoal.period,
        }),
      })
      if (response.ok) {
        setShowGoalForm(false)
        setNewGoal({ name: '', targetAmount: '', period: 'monthly' })
        fetchFinanceData()
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error)
    }
  }

  if (loading) {
    return <div className="text-center">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Console Financeiro</h2>
        <Link
          href="/(dashboard)/relatorios"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Ver Relatórios
        </Link>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 p-6 rounded-lg shadow-md">
          <h3 className="text-green-600 text-sm font-medium">Total Recebido (Mês)</h3>
          <p className="text-green-700 text-2xl font-bold mt-2">
            R$ {data?.totalReceived.toFixed(2) || '0,00'}
          </p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
          <h3 className="text-yellow-600 text-sm font-medium">A Receber</h3>
          <p className="text-yellow-700 text-2xl font-bold mt-2">
            R$ {data?.totalToReceive.toFixed(2) || '0,00'}
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

      {/* Barra de progresso da meta mensal */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Meta Mensal</h3>
          <button
            onClick={() => setShowGoalForm(true)}
            className="text-indigo-600 hover:text-indigo-900 text-sm"
          >
            + Adicionar Meta
          </button>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso</span>
            <span>{data?.monthlyProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(data?.monthlyProgress || 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>R$ {data?.totalReceived.toFixed(2) || '0,00'}</span>
            <span>Meta: R$ {data?.monthlyGoal.toFixed(2) || '0,00'}</span>
          </div>
        </div>
      </div>

      {/* Formulário para criar meta */}
      {showGoalForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Nova Meta</h3>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Alvo (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Período</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={newGoal.period}
                  onChange={(e) => setNewGoal({ ...newGoal, period: e.target.value })}
                >
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Salvar Meta
              </button>
              <button
                type="button"
                onClick={() => setShowGoalForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Metas ativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Metas Ativas</h3>
          <div className="space-y-4">
            {data?.goals.filter(g => g.status === 'active').map((goal) => (
              <div key={goal.id} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-sm text-gray-500">
                    R$ {goal.currentAmount.toFixed(2)} / R$ {goal.targetAmount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {data?.goals.filter(g => g.status === 'active').length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma meta ativa</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Principais Clientes</h3>
          <div className="space-y-3">
            {data?.topClients.map((client, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span>{client.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-medium">
                    R$ {client.amount.toFixed(2)}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({client.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
            {data?.topClients.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum cliente encontrado</p>
            )}
          </div>
        </div>
      </div>

      {/* Serviços mais vendidos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Serviços Mais Vendidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.topServices.map((service, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{service.name}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {service.count} vendas
                </span>
              </div>
              <p className="text-green-600 font-bold">
                R$ {service.total.toFixed(2)}
              </p>
            </div>
          ))}
          {data?.topServices.length === 0 && (
            <p className="text-gray-500 text-center py-4 col-span-3">
              Nenhum serviço encontrado
            </p>
          )}
        </div>
      </div>
    </div>
  )
}