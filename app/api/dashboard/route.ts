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

    const [revenue, expenses, entriesCount, plansCount] = await Promise.all([
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
          type: 'expense',
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.financialEntry.count({
        where: { userId: user.id, date: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.recurringPlan.count({ where: { userId: user.id, status: 'active' } }),
    ])

    const recentEntries = await prisma.financialEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { client: true },
    })

    return NextResponse.json({
      revenue: revenue._sum.amount || 0,
      expenses: expenses._sum.amount || 0,
      entriesCount,
      plansCount,
      recentEntries,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar dashboard' }, { status: 500 })
  }
}
