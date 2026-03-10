'use client'

import Link from 'next/link'
import { useState } from 'react'

const serviceOptions = [
  'Cabeleireiro(a)',
  'Manicure/Pedicure',
  'Eletricista',
  'Encanador(a)',
  'Mecânico(a)',
  'Designer/Esteticista',
  'Outros serviços',
]

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (password !== confirmPassword) {
      setError('As senhas nao conferem. Verifique e tente novamente.')
      setLoading(false)
      return
    }

    const payload = Object.fromEntries(formData.entries())

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.error || 'Nao foi possivel criar seu cadastro agora.')
      setLoading(false)
      return
    }

    setSuccess('Cadastro criado! Agora voce pode entrar no sistema.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface px-6 py-12 text-ink">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold">Criar novo cadastro</h1>
          <p className="text-sm text-slate-500">
            Preencha os dados para deixar seu MEI pronto para organizar clientes, servicos e finanças.
          </p>
        </div>

        <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nome completo</label>
              <input
                name="name"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="Ex: Maria Souza"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="voce@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Senha</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                  placeholder="Crie uma senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-emerald-600"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Confirmar senha</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                  placeholder="Repita sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-emerald-600"
                >
                  {showConfirm ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">WhatsApp</label>
              <input
                name="whatsapp"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="(11) 90000-0000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">CNPJ (opcional)</label>
              <input
                name="cnpj"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Cidade</label>
              <input
                name="city"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="Ex: Sao Paulo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Estado</label>
              <input
                name="state"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="Ex: SP"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Tipo de servico principal</label>
              <select
                name="serviceType"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione seu servico
                </option>
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Como voce organiza hoje?</label>
              <textarea
                name="workflow"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="Ex: Anoto no caderno, uso Excel, ou apenas na cabeca"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Criando cadastro...' : 'Criar meu cadastro'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Ja tem conta?</span>
          <Link href="/auth/signin" className="font-semibold text-emerald-700 hover:text-emerald-600">
            Entrar no sistema
          </Link>
        </div>
      </div>
    </div>
  )
}
