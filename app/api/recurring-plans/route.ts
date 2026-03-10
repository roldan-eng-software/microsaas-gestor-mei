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

    const plans = await prisma.recurringPlan.findMany({
      where: { userId: user.id },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      amount: plan.amount.toNumber(),
      frequency: plan.frequency,
      nextDueDate: plan.nextDueDate.toISOString(),
      status: plan.status,
      clientName: plan.client.name,
      serviceName: plan.service?.name,
    }))

    return NextResponse.json(formattedPlans)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    
    // Calcular próxima data de vencimento
    const startDate = new Date(body.startDate)
    let nextDueDate = new Date(startDate)
    
    switch (body.frequency) {
      case 'weekly':
        nextDueDate.setDate(nextDueDate.getDate() + 7)
        break
      case 'biweekly':
        nextDueDate.setDate(nextDueDate.getDate() + 14)
        break
      case 'monthly':
        nextDueDate.setMonth(nextDueDate.getMonth() + 1)
        if (body.dayOfMonth) {
          nextDueDate.setDate(Math.min(body.dayOfMonth, 28))
        }
        break
      case 'quarterly':
        nextDueDate.setMonth(nextDueDate.getMonth() + 3)
        break
      case 'yearly':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
        break
    }

    const plan = await prisma.recurringPlan.create({
      data: {
        name: body.name,
        description: body.description,
        amount: body.amount,
        frequency: body.frequency,
        dayOfMonth: body.dayOfMonth,
        nextDueDate,
        startDate: new Date(body.startDate),
        userId: user.id,
        clientId: body.clientId,
        serviceId: body.serviceId || undefined,
      },
    })

    // Gerar primeiro lançamento se a data de início já passou
    if (new Date(body.startDate) <= new Date()) {
      await prisma.financialEntry.create({
        data: {
          type: 'income',
          amount: body.amount,
          description: body.name,
          date: new Date(body.startDate),
          userId: user.id,
          clientId: body.clientId,
          recurringPlanId: plan.id,
        },
      })
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar plano' }, { status: 500 })
  }
}