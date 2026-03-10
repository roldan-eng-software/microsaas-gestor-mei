import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Calcular receitas e despesas do mês atual
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const revenueEntries = await prisma.financialEntry.findMany({
      where: {
        userId: user.id,
        type: 'income',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    const expenseEntries = await prisma.financialEntry.findMany({
      where: {
        userId: user.id,
        type: 'expense',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    const totalRevenue = revenueEntries.reduce((sum, entry) => sum + entry.amount.toNumber(), 0)
    const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount.toNumber(), 0)

    // Lançamentos recentes
    const recentEntries = await prisma.financialEntry.findMany({
      where: { userId: user.id },
      include: {
        client: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: 10,
    })

    // Contagens
    const clientsCount = await prisma.client.count({
      where: { userId: user.id },
    })

    const servicesCount = await prisma.service.count({
      where: { userId: user.id },
    })

    const recurringPlansCount = await prisma.recurringPlan.count({
      where: { userId: user.id, status: 'active' },
    })

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      recentEntries: recentEntries.map(entry => ({
        id: entry.id,
        description: entry.description,
        amount: entry.amount.toNumber(),
        date: entry.date.toISOString(),
        clientName: entry.client?.name,
      })),
      clientsCount,
      servicesCount,
      recurringPlansCount,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}