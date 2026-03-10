import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import prisma from '@/lib/prisma'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
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

    // Gerar PDF
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(20)
    doc.text(`Relatório Financeiro - ${period}`, 14, 22)
    
    // Período
    doc.setFontSize(12)
    doc.text(`Período: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 14, 32)
    
    // Resumo
    doc.setFontSize(14)
    doc.text('Resumo', 14, 45)
    
    const summaryData = [
      ['Total Recebido', `R$ ${totalReceived.toFixed(2)}`],
      ['Total Despesas', `R$ ${totalExpenses.toFixed(2)}`],
      ['Lucro Líquido', `R$ ${netIncome.toFixed(2)}`],
      ['Total de Lançamentos', entries.length.toString()],
    ]
    
    autoTable(doc, {
      startY: 50,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    })
    
    // Lançamentos
    doc.setFontSize(14)
    // @ts-ignore - lastAutoTable is added by jspdf-autotable plugin
    doc.text('Lançamentos', 14, (doc as any).lastAutoTable.finalY + 15)
    
    const entryData = entries.map(entry => [
      entry.date.toLocaleDateString(),
      entry.description,
      entry.client?.name || '-',
      entry.type === 'income' ? 'Receita' : 'Despesa',
      `R$ ${entry.amount.toNumber().toFixed(2)}`,
    ])
    
    autoTable(doc, {
      // @ts-ignore
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Data', 'Descrição', 'Cliente', 'Tipo', 'Valor']],
      body: entryData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    })

    // Converter PDF para buffer
    const pdfBuffer = doc.output('arraybuffer')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-${period}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao gerar relatório PDF' }, { status: 500 })
  }
}
