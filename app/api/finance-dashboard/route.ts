import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
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

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59)

    const [received, toReceive, expenses, topClients, topServices, goals] = await Promise.all([
      prisma.financialEntry.aggregate({
        where: {
          userId: user.id,
          type: 'income',
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.financialEntry.aggregate({
        where: {
          userId: user.id,
          type: 'income',
          date: { gte: startOfNextMonth, lte: endOfNextMonth },
        },
        _sum: { amount: true },
      }),
      prisma.financialEntry.aggregate({
        where: {
          userId: user.id,
          type: 'expense',
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.financialEntry.groupBy({
        by: ['clientId'],
        where: { userId: user.id, type: 'income', date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
      prisma.financialEntry.groupBy({
        by: ['serviceId'],
        where: { userId: user.id, type: 'income', date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
        _count: { serviceId: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5,
      }),
      prisma.goal.findMany({
        where: { userId: user.id, status: 'active', period: 'monthly' },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ])

    const totalReceived = Number(received._sum.amount || 0)
    const monthlyGoal = goals[0]?.targetAmount || 0
    const monthlyProgress = monthlyGoal > 0 ? Math.min(100, Math.round((totalReceived / monthlyGoal) * 100)) : 0

    const topClientsWithDetails = await Promise.all(
      topClients.map(async (client) => {
        const clientData = await prisma.client.findUnique({ where: { id: client.clientId! } })
        return {
          name: clientData?.name || 'Desconhecido',
          amount: Number(client._sum.amount || 0),
          percentage: totalReceived > 0 ? Math.round(((Number(client._sum.amount) || 0) / totalReceived) * 100) : 0,
        }
      })
    )

    const topServicesWithDetails = await Promise.all(
      topServices.map(async (service) => {
        const serviceData = await prisma.service.findUnique({ where: { id: service.serviceId! } })
        return {
          name: serviceData?.name || 'Serviço não especificado',
          count: service._count.serviceId,
          total: service._sum.amount || 0,
        }
      })
    )

    return NextResponse.json({
      totalReceived,
      totalToReceive: toReceive._sum.amount || 0,
      totalExpenses: expenses._sum.amount || 0,
      netIncome: totalReceived - (expenses._sum.amount || 0),
      topClients: topClientsWithDetails,
      topServices: topServicesWithDetails,
      monthlyGoal,
      monthlyProgress,
      goals,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar dados financeiros' }, { status: 500 })
  }
}
