import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'month'

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Calcular datas baseadas no período
    const now = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'week':
        const dayOfWeek = now.getDay()
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        startDate = new Date(now.setDate(diff))
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
    }

    // Buscar lançamentos
    const entries = await prisma.financialEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    })

    // Calcular totais
    const incomeEntries = entries.filter(e => e.type === 'income')
    const expenseEntries = entries.filter(e => e.type === 'expense')

    const totalReceived = incomeEntries.reduce(
      (sum, entry) => sum + entry.amount.toNumber(), 
      0
    )
    const totalExpenses = expenseEntries.reduce(
      (sum, entry) => sum + entry.amount.toNumber(), 
      0
    )
    const netIncome = totalReceived - totalExpenses

    // Estatísticas
    const amounts = entries.map(e => e.amount.toNumber())
    const averageEntry = amounts.length > 0 
      ? amounts.reduce((a, b) => a + b, 0) / amounts.length 
      : 0
    const largestEntry = amounts.length > 0 ? Math.max(...amounts) : 0

    return NextResponse.json({
      period,
      totalReceived,
      totalExpenses,
      netIncome,
      entries: entries.map(entry => ({
        id: entry.id,
        type: entry.type,
        description: entry.description,
        amount: entry.amount.toNumber(),
        date: entry.date.toISOString(),
        clientName: entry.client?.name,
        // paymentMethod: entry.paymentMethod, // Field not in schema
      })),
      summary: {
        totalEntries: entries.length,
        averageEntry,
        largestEntry,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 })
  }
}