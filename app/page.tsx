'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

// Apply theme immediately before React renders to prevent flash
const applyThemeImmediate = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
  const initialTheme = savedTheme || 'system'
  
  const html = document.documentElement
  if (initialTheme === 'dark') {
    html.classList.add('dark')
  } else if (initialTheme === 'light') {
    html.classList.remove('dark')
  } else {
    // system - remove manual class and let media query handle it
    html.classList.remove('dark')
  }
}

// Run immediately on load
if (typeof window !== 'undefined') {
  applyThemeImmediate()
}

// Navbar Component
function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  useEffect(() => {
    // Check initial theme preference from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    const initialTheme = savedTheme || 'system'
    setTheme(initialTheme)
    
    // Apply theme
    applyTheme(initialTheme)
  }, [])
  
  useEffect(() => {
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        const prefersDark = mediaQuery.matches
        setIsDarkMode(prefersDark)
        // Update the class based on system preference
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])
  
  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const html = document.documentElement
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDark)
      html.classList.remove('dark')
    } else if (newTheme === 'dark') {
      setIsDarkMode(true)
      html.classList.add('dark')
    } else {
      // light
      setIsDarkMode(false)
      html.classList.remove('dark')
    }
  }
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      case 'system':
      default:
        return '🌓'
    }
  }

  return (
    <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 transition-all border-b border-gray-100 dark:bg-slate-900/90 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Esquerda: Favicon e Logotipo em PNG */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image src="/favicon.ico" alt="Ícone" fill className="object-contain" />
          </div>
          <div className="relative w-28 h-8 hidden sm:block">
            <Image src="/logotipo.png" alt="Logotipo do Projeto" fill className="object-contain" />
          </div>
        </div>

        {/* Centro: Nome do Projeto */}
        <div className="absolute left-1/2 transform -translate-x-1/2 font-bold text-xl text-gray-800 dark:text-slate-100 tracking-tight hidden md:block">
          MEI Organizado
        </div>

        {/* Direita: Seletor de Tema e Botão Entrar */}
        <div className="flex items-center gap-4">
          {/* Seletor de Tema com Dropdown */}
          <div className="relative group">
            <button 
              title="Alternar Tema"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            >
              {getThemeIcon()}
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                onClick={() => handleThemeChange('light')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg flex items-center gap-2 ${theme === 'light' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
              >
                ☀️ Claro
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
              >
                🌙 Escuro
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-b-lg flex items-center gap-2 ${theme === 'system' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
              >
                🌓 Sistema
              </button>
            </div>
          </div>

          <Link 
            href="/auth/signin" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  )
}

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
    <div className="min-h-screen bg-surface text-ink dark:bg-slate-900 dark:text-slate-100">
      <Navbar />
      
      <main className="relative overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-32 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-900/20" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-amber-200/50 blur-3xl dark:bg-amber-900/20" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-200/40 blur-3xl dark:bg-red-900/20" />
        </div>

        <section className="relative flex min-h-screen items-center px-6 py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 lg:flex-row lg:items-start">
          <div data-reveal className="reveal flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-slate-800/80 dark:text-emerald-400">
              Simples para MEI de servicos · 7 dias gratis
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl dark:text-slate-100">
              ORGANIZE seu MEI em 5 minutos
            </h1>
            <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
              Controle financeiro + recibos profissionais + agenda de clientes. Tudo simples, sem complicacao.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button className="rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400">
                COMECAR GRATIS 7 DIAS
              </button>
              <button className="rounded-full border-2 border-secondary px-6 py-3 text-base font-semibold text-amber-700 transition hover:-translate-y-0.5 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-900/50">
                Ver demo
              </button>
              <Link
                href="/auth/signin"
                className="rounded-full border border-slate-200 px-6 py-3 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
              >
                Entrar no sistema
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-400">
              <span>Sem cartao agora</span>
              <span>Sem multa de cancelamento</span>
              <span>Suporte humano no WhatsApp</span>
            </div>
          </div>

          <div data-reveal className="reveal relative flex-1">
            <div className="relative mx-auto max-w-md rounded-3xl bg-white p-6 shadow-soft dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Dashboard MEI</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Resumo do mes</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/30">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Recebido</p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">R$ 5.200</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/30">
                  <p className="text-xs text-amber-600 dark:text-amber-400">Pendencias</p>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-300">R$ 820</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Corte e escova</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Maria S.</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">R$ 160</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Manutencao</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Joao P.</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">R$ 240</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 hidden rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-lg lg:block dark:border-emerald-900 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ana, manicure</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">"Pago tudo no celular"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-soft dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-display text-3xl font-bold text-ink dark:text-slate-100">Voce vive isso todo mes? 😩</h2>
            <ul className="mt-6 grid gap-4 text-lg text-slate-600 dark:text-slate-400 sm:grid-cols-2">
              <li>✅ Esquece quanto cobrou cada cliente</li>
              <li>✅ Perde recibos importantes</li>
              <li>✅ Nao sabe quanto faturou de verdade</li>
              <li>✅ Corre atras de pagamento</li>
              <li>✅ Passa horas no Excel baguncado</li>
            </ul>
            <p className="mt-6 max-w-2xl text-base text-slate-500 dark:text-slate-400">
              Se voce atende varios clientes por semana, o controle vira bagunca rapidinho. O MEI Organizado
              resolve isso em um painel simples que cabe no seu bolso.
            </p>
            <button className="mt-8 rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400">
              Quero resolver isso AGORA
            </button>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal text-center">
            <h2 className="font-display text-3xl font-bold text-ink dark:text-slate-100">Tudo organizado, do jeito que voce trabalha</h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
              Enxergue o dinheiro que entra, o que falta receber e quais clientes voltam todo mes.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.title}
                data-reveal
                className="reveal rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl dark:bg-emerald-900/30">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.title}</h3>
                </div>
                <p className="mt-4 text-lg font-semibold text-emerald-700 dark:text-emerald-400">{item.highlight}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
              <h2 className="font-display text-3xl font-bold text-ink dark:text-slate-100">Como funciona na pratica</h2>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
                Um fluxo simples para registrar seus atendimentos e nunca mais perder recibo.
              </p>
            </div>
            <div className="flex-1 space-y-6">
              {steps.map((step) => (
                <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
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
              <h2 className="font-display text-3xl font-bold text-ink dark:text-slate-100">Preco unico, sem pegadinha</h2>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
                Tudo o que voce precisa para organizar o MEI em um unico lugar, com suporte rapido no WhatsApp.
              </p>
              <div className="mt-8 space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <p>MEI ORGANIZADO</p>
                <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">{priceLabel}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">(economia 17%)</p>
                <div className="mt-4 space-y-2">
                  <p>✅ Tudo ilimitado</p>
                  <p>✅ 7 dias gratis</p>
                  <p>✅ Suporte WhatsApp</p>
                  <p>✅ Backup automatico</p>
                  <p>✅ Sem multa cancelamento</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-700 dark:bg-slate-800">
              <form className="space-y-5" onSubmit={handleCheckout}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Seu nome</label>
                  <input
                    name="name"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-500"
                    placeholder="Ex: Ana Souza"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Seu melhor email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-500"
                    placeholder="voce@exemplo.com"
                  />
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{savings}</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                >
                  {loading ? 'Processando...' : 'COMECAR GRATIS 👇'}
                </button>
                {status && <p className="text-xs text-red-500">{status}</p>}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  O checkout e feito via Stripe. Cancelamento sem taxa e sem burocracia.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="reveal rounded-3xl border border-slate-200 bg-white px-8 py-12 shadow-soft dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-display text-3xl font-bold text-ink dark:text-slate-100">MEIs reais falando</h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-6 dark:bg-emerald-900/30">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  "Finalmente consigo cobrar meus R$5.200/mes sem perder cliente!"
                </p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">- Maria Silva, cabeleireira</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-6 dark:bg-amber-900/30">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  "Minha marcenaria faturou 30% a mais organizando tudo no celular"
                </p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">- Joao Santos</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 text-lg font-semibold text-slate-700 dark:text-slate-300">
              <span>⭐⭐⭐⭐⭐</span>
              <span>4.9/5 (127 avaliacoes)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Carrossel de Imagens com Movimento Infinito */}
      <section className="w-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative border-y border-slate-200 dark:border-slate-800 py-12">
        <div className="flex w-[200%] animate-marquee">
          {/* Loop de 10 imagens (5 originais + 5 duplicadas para efeito infinito) */}
          {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((idx, i) => (
            <div 
              key={`${idx}-${i}`} 
              className="w-full md:w-1/2 lg:w-1/3 flex-none relative h-[300px] sm:h-[350px] px-2"
            >
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                Imagem {idx}
              </div>
              
              {/* Overlay Inferior + Texto da Descrição no Pé da Imagem */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded-lg p-3 text-center">
                <p className="text-white text-sm font-medium drop-shadow-md">
                  Demonstração do serviço {idx} - MEI Organizado
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative px-6 pb-16 pt-12">
        <div className="mx-auto max-w-6xl rounded-3xl border border-amber-200 bg-amber-50 px-8 py-10 shadow-soft dark:border-amber-700 dark:bg-amber-900/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-amber-900 dark:text-amber-200">
                🚨 VAGAS LIMITADAS - so ate amanha
              </h3>
              <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
                10.000 MEIs ja organizaram suas financas! Garanta sua vaga hoje.
              </p>
            </div>
            <button className="rounded-full bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400">
              Quero meu acesso
            </button>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-6 text-sm text-slate-500 dark:text-slate-400 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            <a className="hover:text-emerald-600 dark:hover:text-emerald-400" href="https://wa.me/5500000000000">
              WhatsApp suporte
            </a>
            <a className="hover:text-emerald-600 dark:hover:text-emerald-400" href="/termos">
              Termos
            </a>
            <a className="hover:text-emerald-600 dark:hover:text-emerald-400" href="/privacidade">
              Privacidade
            </a>
          </div>
          <div className="text-center lg:text-right">
            <p className="mb-1">
              Desenvolvido por: <a href="https://roldan-eng-software.github.io/roldan-page/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-500 hover:text-blue-400">Roldan Eng Software</a>
            </p>
            <p>&copy; {new Date().getFullYear()} MEI Organizado. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}
