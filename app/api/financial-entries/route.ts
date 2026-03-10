import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'month'
  
  let startDate = new Date()
  if (period === 'day') {
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7)
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const entries = await prisma.financialEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
      },
      include: {
        client: {
          select: { name: true },
        },
        service: {
          select: { name: true },
        },
      },
      orderBy: { date: 'desc' },
    })
    
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      type: entry.type,
      amount: entry.amount.toNumber(),
      description: entry.description,
      date: entry.date.toISOString(),
      paymentMethod: entry.paymentMethod,
      clientName: entry.client?.name,
      serviceName: entry.service?.name,
    }))
    
    return NextResponse.json(formattedEntries)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar lançamentos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const entry = await prisma.financialEntry.create({
      data: {
        type: body.type,
        amount: body.amount,
        description: body.description,
        date: new Date(body.date),
        paymentMethod: body.paymentMethod,
        userId: user.id,
        clientId: body.clientId || undefined,
        serviceId: body.serviceId || undefined,
      },
    })
    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar lançamento' }, { status: 500 })
  }
}