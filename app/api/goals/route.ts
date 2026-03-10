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

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(goals)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar metas' }, { status: 500 })
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
    const now = new Date()

    let month, year
    if (body.period === 'monthly') {
      month = now.getMonth() + 1
      year = now.getFullYear()
    }

    const goal = await prisma.goal.create({
      data: {
        name: body.name,
        description: body.description,
        targetAmount: body.targetAmount,
        period: body.period,
        month,
        year,
        startDate: new Date(),
        userId: user.id,
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar meta' }, { status: 500 })
  }
}
