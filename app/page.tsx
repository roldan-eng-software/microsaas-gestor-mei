'use client'

import { useEffect, useMemo, useState } from 'react'

const stats = [
  {
    title: 'FATURAMENTO CLARO',
    highlight: 'R$3.450 em Jan/26',
    icon: '💸',
  },
  {
    title: '47 CLIENTES ATIVOS',
    highlight: 'clientes fiéis, sem perder ninguém',
    icon: '🤝',
  },
  {
    title: '12 SERVIÇOS RECORRENTES',
    highlight: 'assinaturas e combos organizados',
    icon: '🔁',
  },
  {
    title: 'RECIBO PROFISSIONAL',
    highlight: 'Link ou PDF em 2 cliques',
    icon: '🧾',
  },
  {
    title: 'CLIENTES ORGANIZADOS',
    highlight: 'foto + telefone + historico',
    icon: '📇',
  },
  {
    title: 'FINANÇAS SIMPLES',
    highlight: 'Entradas x saidas automatico',
    icon: '📊',
  },
  {
    title: 'AGENDA INTELIGENTE',
    highlight: 'Proximos atendimentos no celular',
    icon: '🗓️',
  },
  {
    title: 'COBRANCA AUTOMATICA',
    highlight: 'Lembretes e pagamentos no prazo',
    icon: '📲',
  },
  {
    title: 'RESUMO DO MES',
    highlight: 'Lucro, gastos e metas em 1 tela',
    icon: '📈',
  },
]

const steps = [
  {
    title: 'PASSO 1 - Cadastre seu cliente',
    description: 'Foto + nome + telefone + servicos habituais.',
  },
  {
    title: 'PASSO 2 - Registre o servico',
    description: 'Valor + forma pagamento + data concluido.',
  },
  {
    title: 'PASSO 3 - Envie recibo',
    description: 'Link unico ou PDF - cliente salva no celular.',
  },
]

export default function Home() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-reveal]'))
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const priceLabel = useMemo(() => {
    return billing === 'monthly' ? 'R$19/mês' : 'R$190/ano'
  }, [billing])

  const savings = billing === 'yearly' ? 'Economia de 17% no anual' : '7 dias gratis para testar'

  const handleLead = async (name: string, email: string) => {
    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, plan: billing }),
    })
  }

  const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setStatus(null)

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') || '')
    const email = String(formData.get('email') || '')

    try {
      await handleLead(name, email)

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: billing, email, name }),
      })

      if (!response.ok) {
        throw new Error('Falha ao iniciar o checkout')
      }

      const { url } = await response.json()
      if (!url) {
        throw new Error('Checkout indisponivel')
      }
      window.location.href = url
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado'
      setStatus(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative overflow-hidden bg-surface text-ink">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-32 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-200/40 blur-3xl" />
      </div>

      <section className="relative flex min-h-screen items-center px-6 py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 lg:flex-row lg:items-start">
          <div data-reveal className="reveal flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              Simples para MEI de servicos · 7 dias gratis
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">
              ORGANIZE seu MEI em 5 minutos
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Controle financeiro + recibos profissionais + agenda de clientes. Tudo simples, sem complicacao.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button className="rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-600">
                COMECAR GRATIS 7 DIAS
              </button>
              <button className="rounded-full border-2 border-secondary px-6 py-3 text-base font-semibold text-amber-700 transition hover:-translate-y-0.5 hover:bg-amber-50">
                Ver demo
              </button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              <span>Sem cartao agora</span>
              <span>Sem multa de cancelamento</span>
              <span>Suporte humano no WhatsApp</span>
            </div>
          </div>

          <div data-reveal className="reveal relative flex-1">
            <div className="relative mx-auto max-w-md rounded-3xl bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-emerald-600">Dashboard MEI</p>
                  <p className="text-lg font-semibold text-slate-900">Resumo do mes</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-600">Recebido</p>
                  <p className="text-xl font-bold text-emerald-700">R$ 5.200</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs text-amber-600">Pendencias</p>
                  <p className="text-xl font-bold text-amber-700">R$ 820</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Corte e escova</p>
                    <p className="text-xs text-slate-500">Maria S.</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">R$ 160</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Manutencao</p>
                    <p className="text-xs text-slate-500">Joao P.</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">R$ 240</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 hidden rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-lg lg:block">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Ana, manicure</p>
                  <p className="text-xs text-slate-500">"Pago tudo no celular"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-ink">Voce vive isso todo mes? 😩</h2>
            <ul className="mt-6 grid gap-4 text-lg text-slate-600 sm:grid-cols-2">
              <li>✅ Esquece quanto cobrou cada cliente</li>
              <li>✅ Perde recibos importantes</li>
              <li>✅ Nao sabe quanto faturou de verdade</li>
              <li>✅ Corre atras de pagamento</li>
              <li>✅ Passa horas no Excel baguncado</li>
            </ul>
            <p className="mt-6 max-w-2xl text-base text-slate-500">
              Se voce atende varios clientes por semana, o controle vira bagunca rapidinho. O MEI Organizado
              resolve isso em um painel simples que cabe no seu bolso.
            </p>
            <button className="mt-8 rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-500">
              Quero resolver isso AGORA
            </button>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal text-center">
            <h2 className="font-display text-3xl font-bold text-ink">Tudo organizado, do jeito que voce trabalha</h2>
            <p className="mt-3 text-base text-slate-600">
              Enxergue o dinheiro que entra, o que falta receber e quais clientes voltam todo mes.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.title}
                data-reveal
                className="reveal rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                </div>
                <p className="mt-4 text-lg font-semibold text-emerald-700">{item.highlight}</p>
                <p className="mt-2 text-sm text-slate-500">
                  O painel mostra tudo em tempo real para voce decidir rapido.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal flex flex-col gap-10 lg:flex-row">
            <div className="flex-1">
              <h2 className="font-display text-3xl font-bold text-ink">Como funciona na pratica</h2>
              <p className="mt-4 text-base text-slate-600">
                Um fluxo simples para registrar seus atendimentos e nunca mais perder recibo.
              </p>
            </div>
            <div className="flex-1 space-y-6">
              {steps.map((step) => (
                <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="font-display text-3xl font-bold text-ink">Preco unico, sem pegadinha</h2>
              <p className="mt-4 text-base text-slate-600">
                Tudo o que voce precisa para organizar o MEI em um unico lugar, com suporte rapido no WhatsApp.
              </p>
              <div className="mt-8 space-y-4 text-sm text-slate-600">
                <p>MEI ORGANIZADO</p>
                <p className="text-4xl font-bold text-emerald-700">{priceLabel}</p>
                <p className="text-sm text-slate-500">(economia 17%)</p>
                <div className="mt-4 space-y-2">
                  <p>✅ Tudo ilimitado</p>
                  <p>✅ 7 dias gratis</p>
                  <p>✅ Suporte WhatsApp</p>
                  <p>✅ Backup automatico</p>
                  <p>✅ Sem multa cancelamento</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
              <form className="space-y-5" onSubmit={handleCheckout}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Seu nome</label>
                  <input
                    name="name"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                    placeholder="Ex: Ana Souza"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Seu melhor email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
                    placeholder="voce@exemplo.com"
                  />
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="billing"
                      value="monthly"
                      checked={billing === 'monthly'}
                      onChange={() => setBilling('monthly')}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    Pagamento recorrente
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
                    Anual (economia 17%)
                  </label>
                  <p className="text-xs text-emerald-600">{savings}</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? 'Processando...' : 'COMECAR GRATIS 👇'}
                </button>
                {status && <p className="text-xs text-red-500">{status}</p>}
                <p className="text-xs text-slate-500">
                  O checkout e feito via Stripe. Cancelamento sem taxa e sem burocracia.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-ink">MEIs reais falando</h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-6">
                <p className="text-lg font-semibold text-slate-900">
                  "Finalmente consigo cobrar meus R$5.200/mes sem perder cliente!"
                </p>
                <p className="mt-3 text-sm text-slate-600">- Maria Silva, cabeleireira</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-6">
                <p className="text-lg font-semibold text-slate-900">
                  "Minha marcenaria faturou 30% a mais organizando tudo no celular"
                </p>
                <p className="mt-3 text-sm text-slate-600">- Joao Santos</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 text-lg font-semibold text-slate-700">
              <span>⭐⭐⭐⭐⭐</span>
              <span>4.9/5 (127 avaliacoes)</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative px-6 pb-16 pt-12">
        <div className="mx-auto max-w-6xl rounded-3xl border border-amber-200 bg-amber-50 px-8 py-10 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-amber-900">
                🚨 VAGAS LIMITADAS - so ate amanha
              </h3>
              <p className="mt-2 text-sm text-amber-800">
                10.000 MEIs ja organizaram suas financas! Garanta sua vaga hoje.
              </p>
            </div>
            <button className="rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-500">
              Quero meu acesso
            </button>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-6 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            <a className="hover:text-emerald-600" href="https://wa.me/5500000000000">
              WhatsApp suporte
            </a>
            <a className="hover:text-emerald-600" href="/termos">
              Termos
            </a>
            <a className="hover:text-emerald-600" href="/privacidade">
              Privacidade
            </a>
          </div>
          <p>© 2026 MEI Organizado - CNPJ 99.999.999/0001-99</p>
        </div>
      </footer>
    </main>
  )
}
