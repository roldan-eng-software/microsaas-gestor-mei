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
    
    // Create CSV content
    const headers = ['Data', 'Cliente', 'Serviço/Descrição', 'Valor', 'Forma de Pagamento', 'Tipo']
    const rows = entries.map(entry => [
      new Date(entry.date).toLocaleDateString('pt-BR'),
      entry.client?.name || '',
      entry.service?.name || entry.description,
      entry.amount.toNumber().toFixed(2),
      entry.paymentMethod || '',
      entry.type === 'income' ? 'Receita' : 'Despesa',
    ])
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const buffer = await blob.arrayBuffer()
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=lancamentos_${period}_${new Date().toISOString().split('T')[0]}.csv`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao exportar CSV' }, { status: 500 })
  }
}