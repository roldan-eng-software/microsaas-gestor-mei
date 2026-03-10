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

    // Gerar HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Financeiro - ${period}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
        .summary { margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 8px; }
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .summary-item:last-child { margin-bottom: 0; }
        .summary-label { font-weight: bold; }
        .summary-value { color: #059669; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #4f46e5; color: white; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .income { color: #059669; }
        .expense { color: #dc2626; }
    </style>
</head>
<body>
    <h1>Relatório Financeiro - ${period.charAt(0).toUpperCase() + period.slice(1)}</h1>
    <p><strong>Período:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
    
    <div class="summary">
        <h2>Resumo</h2>
        <div class="summary-item">
            <span class="summary-label">Total Recebido:</span>
            <span class="summary-value">R$ ${totalReceived.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Despesas:</span>
            <span class="summary-value expense">R$ ${totalExpenses.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Lucro Líquido:</span>
            <span class="summary-value">R$ ${netIncome.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total de Lançamentos:</span>
            <span class="summary-value">${entries.length}</span>
        </div>
    </div>

    <h2>Lançamentos</h2>
    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>
            ${entries.map(entry => `
                <tr>
                    <td>${entry.date.toLocaleDateString()}</td>
                    <td>${entry.description}</td>
                    <td>${entry.client?.name || '-'}</td>
                    <td class="${entry.type === 'income' ? 'income' : 'expense'}">
                        ${entry.type === 'income' ? 'Receita' : 'Despesa'}
                    </td>
                    <td class="${entry.type === 'income' ? 'income' : 'expense'}">
                        R$ ${entry.amount.toNumber().toFixed(2)}
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
    `

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="relatorio-${period}-${new Date().toISOString().split('T')[0]}.html"`,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao gerar relatório HTML' }, { status: 500 })
  }
}
