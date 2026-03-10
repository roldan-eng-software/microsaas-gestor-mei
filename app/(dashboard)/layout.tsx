'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMe } from '@/components/useMe'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const { me } = useMe()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p>Você precisa estar autenticado para acessar esta página.</p>
          <Link href="/auth/signin" className="text-blue-500 hover:underline">
            Fazer login
          </Link>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/(dashboard)', label: 'Início' },
    { href: '/(dashboard)/clientes', label: 'Clientes' },
    { href: '/(dashboard)/servicos', label: 'Serviços' },
    { href: '/(dashboard)/lancamentos', label: 'Lançamentos' },
    { href: '/(dashboard)/planos-recorrentes', label: 'Planos Recorrentes' },
    { href: '/(dashboard)/recibos', label: 'Recibos' },
    { href: '/(dashboard)/financeiro', label: 'Financeiro' },
  ]

  const moduleNavItems =
    me?.segmentationEnabled && me.enabledModules?.length
      ? [
          ...(me.enabledModules.includes('agenda')
            ? [{ href: '/(dashboard)/agenda', label: 'Agenda' }]
            : []),
          ...(me.enabledModules.includes('contratos')
            ? [{ href: '/(dashboard)/contratos', label: 'Contratos' }]
            : []),
        ]
      : []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Gestor MEI</h1>
              <nav className="ml-8 flex space-x-4">
                {[...navItems, ...moduleNavItems].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{session.user?.email}</span>
              <Link
                href="/(dashboard)/segmento"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Segmento
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
