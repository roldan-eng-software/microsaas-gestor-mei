'use client'

import { useState } from 'react'

export default function BillingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: billing }),
      })

      if (!response.ok) {
        throw new Error('Nao foi possivel iniciar o checkout')
      }

      const { url } = await response.json()
      if (!url) {
        throw new Error('Checkout indisponivel')
      }

      window.location.href = url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5">
        <h1 className="text-2xl font-bold text-amber-900">Finalize seu pagamento</h1>
        <p className="mt-2 text-sm text-amber-800">
          Seu cadastro esta pronto, mas o acesso completo depende da confirmacao do pagamento.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-800">Plano MEI Organizado</h2>
        <p className="mt-2 text-sm text-slate-500">Escolha o plano ideal e finalize o checkout seguro.</p>

        <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 p-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="radio"
              name="billing"
              value="monthly"
              checked={billing === 'monthly'}
              onChange={() => setBilling('monthly')}
              className="h-4 w-4 accent-emerald-600"
            />
            Pagamento recorrente - R$19/mês
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="radio"
              name="billing"
              value="yearly"
              checked={billing === 'yearly'}
              onChange={() => setBilling('yearly')}
              className="h-4 w-4 accent-emerald-600"
            />
            Anual (economia 17%) - R$190/ano
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? 'Abrindo checkout...' : 'Pagar agora com Stripe'}
        </button>
      </div>
    </div>
  )
}
