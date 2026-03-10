'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()
  
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
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Gestor MEI</h1>
          <p className="text-gray-600 mb-8">Organização financeira simples para MEIs</p>
          <button
            onClick={() => signIn()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestor MEI</h1>
            <p className="text-gray-600">Organização financeira simples para MEIs</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Sair
            </button>
          </div>
        </header>
        
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Visão Geral Mensal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-600 text-sm">Receitas</p>
              <p className="text-green-700 text-2xl font-bold">R$ 0,00</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-600 text-sm">Despesas</p>
              <p className="text-red-700 text-2xl font-bold">R$ 0,00</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-600 text-sm">Saldo</p>
              <p className="text-blue-700 text-2xl font-bold">R$ 0,00</p>
            </div>
          </div>
        </section>
        
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Lançamentos Recentes</h2>
          <p className="text-gray-500 text-center py-8">Nenhum lançamento cadastrado</p>
        </section>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Gestor MEI - Micro SaaS para MEIs</p>
        </footer>
      </div>
    </main>
  )
}