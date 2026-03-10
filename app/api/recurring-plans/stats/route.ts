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

    // Total de planos ativos
    const activePlans = await prisma.recurringPlan.findMany({
      where: {
        userId: user.id,
        status: 'active',
      },
    })

    const totalRecurring = activePlans.reduce((sum, plan) => sum + plan.amount.toNumber(), 0)

    // Planos atrasados (próximo vencimento já passou)
    const now = new Date()
    const overduePlans = activePlans.filter(plan => plan.nextDueDate < now)
    const overdueCount = overduePlans.length

    // Valor previsto para o mês atual
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const expectedThisMonth = activePlans.reduce((sum, plan) => {
      // Se o plano está ativo e o vencimento cai neste mês
      if (
        plan.nextDueDate >= startOfMonth &&
        plan.nextDueDate <= endOfMonth
      ) {
        return sum + plan.amount.toNumber()
      }
      return sum
    }, 0)

    return NextResponse.json({
      totalRecurring,
      overdue: overdueCount,
      expectedThisMonth,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}