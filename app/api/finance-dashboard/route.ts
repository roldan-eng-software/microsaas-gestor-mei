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

    // Calcular período atual (mês)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    // Total recebido no mês (receitas já pagas)
    const receivedEntries = await prisma.financialEntry.findMany({
      where: {
        userId: user.id,
        type: 'income',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })
    
    const totalReceived = receivedEntries.reduce(
      (sum, entry) => sum + entry.amount.toNumber(), 
      0
    )

    // Total a receber (receitas futuras ou não pagas)
    const futureEntries = await prisma.financialEntry.findMany({
      where: {
        userId: user.id,
        type: 'income',
        date: {
          gt: endOfMonth,
        },
      },
    })
    
    const totalToReceive = futureEntries.reduce(
      (sum, entry) => sum + entry.amount.toNumber(), 
      0
    )

    // Total de despesas no mês
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
    
    const totalExpenses = expenseEntries.reduce(
      (sum, entry) => sum + entry.amount.toNumber(), 
      0
    )

    // Lucro líquido
    const netIncome = totalReceived - totalExpenses

    // Top 5 clientes por valor recebido
    const clientStats = await prisma.financialEntry.groupBy({
      by: ['clientId'],
      where: {
        userId: user.id,
        type: 'income',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        clientId: { not: null },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 5,
    })

    const topClients = await Promise.all(
      clientStats.map(async (stat) => {
        if (!stat.clientId) return null
        const client = await prisma.client.findUnique({
          where: { id: stat.clientId },
        })
        return {
          name: client?.name || 'Cliente',
          amount: stat._sum.amount?.toNumber() || 0,
          percentage: 0,
        }
      })
    )

    // Calcular porcentagens
    const totalClientAmount = topClients.reduce(
      (sum, client) => sum + (client?.amount || 0), 
      0
    )
    const topClientsWithPercentage = topClients
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .map(client => ({
        ...client,
        percentage: totalClientAmount > 0 
          ? (client.amount / totalClientAmount) * 100 
          : 0,
      }))

    // Top serviços mais vendidos
    const serviceStats = await prisma.financialEntry.groupBy({
      by: ['serviceId'],
      where: {
        userId: user.id,
        type: 'income',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        serviceId: { not: null },
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 6,
    })

    const topServices = await Promise.all(
      serviceStats.map(async (stat) => {
        if (!stat.serviceId) return null
        const service = await prisma.service.findUnique({
          where: { id: stat.serviceId },
        })
        return {
          name: service?.name || 'Serviço',
          count: stat._count.id,
          total: stat._sum.amount?.toNumber() || 0,
        }
      })
    )

    // Meta mensal (buscar a meta ativa do mês atual)
    const monthlyGoal = await prisma.goal.findFirst({
      where: {
        userId: user.id,
        period: 'monthly',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        status: 'active',
      },
    })

    const monthlyGoalAmount = monthlyGoal?.targetAmount.toNumber() || 10000
    const monthlyProgress = (totalReceived / monthlyGoalAmount) * 100

    // Todas as metas ativas
    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      totalReceived,
      totalToReceive,
      totalExpenses,
      netIncome,
      topClients: topClientsWithPercentage,
      topServices: topServices.filter((s): s is NonNullable<typeof s> => s !== null),
      monthlyGoal: monthlyGoalAmount,
      monthlyProgress,
      goals: goals.map(goal => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount.toNumber(),
        currentAmount: goal.currentAmount.toNumber(),
        status: goal.status,
      })),
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 500 })
  }
}