'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Client {
  id: string
  name: string
}

interface Service {
  id: string
  name: string
  price: number
}

interface RecurringPlan {
  id: string
  name: string
  description?: string
  amount: number
  frequency: string
  nextDueDate: string
  status: string
  clientName: string
  serviceName?: string
}

export default function RecurringPlansPage() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState<RecurringPlan[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: 'monthly',
    dayOfMonth: '1',
    clientId: '',
    serviceId: '',
    startDate: new Date().toISOString().split('T')[0],
  })
  const [stats, setStats] = useState({
    totalRecurring: 0,
    overdue: 0,
    expectedThisMonth: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [plansRes, clientsRes, servicesRes, statsRes] = await Promise.all([
        fetch('/api/recurring-plans'),
        fetch('/api/clients'),
        fetch('/api/services'),
        fetch('/api/recurring-plans/stats'),
      ])
      
      if (plansRes.ok) setPlans(await plansRes.json())
      if (clientsRes.ok) setClients(await clientsRes.json())
      if (servicesRes.ok) setServices(await servicesRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/recurring-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          dayOfMonth: parseInt(formData.dayOfMonth),
        }),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({
          name: '',
          description: '',
          amount: '',
          frequency: 'monthly',
          dayOfMonth: '1',
          clientId: '',
          serviceId: '',
          startDate: new Date().toISOString().split('T')[0],
        })
        fetchData()
      }
    } catch (error) {
      console.error('Erro ao criar plano:', error)
    }
  }

  if (loading) {
    return <div className="text-center">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Planos Recorrentes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          + Novo Plano Recorrente
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="text-blue-600 text-sm font-medium">Total Recorrente</h3>
          <p className="text-blue-700 text-xl font-bold mt-1">
            R$ {stats.totalRecurring.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <h3 className="text-red-600 text-sm font-medium">Atrasados</h3>
          <p className="text-red-700 text-xl font-bold mt-1">{stats.overdue}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="text-green-600 text-sm font-medium">Previsto (mês)</h3>
          <p className="text-green-700 text-xl font-bold mt-1">
            R$ {stats.expectedThisMonth.toFixed(2)}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Novo Plano Recorrente</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente *</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequência *</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dia do Mês</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Serviço (opcional)</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                >
                  <option value="">Sem serviço vinculado</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data de Início *</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequência
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Próximo Vencimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-6 py-4 whitespace-nowrap">{plan.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{plan.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                  R$ {plan.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {plan.frequency}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(plan.nextDueDate).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {plan.status === 'active' ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Ativo
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      {plan.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {plans.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum plano recorrente cadastrado
          </div>
        )}
      </div>
    </div>
  )
}