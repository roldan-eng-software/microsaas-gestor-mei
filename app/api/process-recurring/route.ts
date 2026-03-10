import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Esta API pode ser chamada por um cron job externo (ex: Vercel Cron Jobs)
// ou via webhook programático

export async function POST(request: NextRequest) {
  try {
    const now = new Date()
    
    // Buscar planos recorrentes ativos que precisam de geração de lançamento
    const plans = await prisma.recurringPlan.findMany({
      where: {
        status: 'active',
        nextDueDate: {
          lte: now,
        },
      },
      include: {
        client: true,
      },
    })

    const results = []
    
    for (const plan of plans) {
      // Criar lançamento financeiro
      const entry = await prisma.financialEntry.create({
        data: {
          type: 'income',
          amount: plan.amount,
          description: `Plano recorrente: ${plan.name}`,
          date: plan.nextDueDate,
          userId: plan.userId,
          clientId: plan.clientId,
          serviceId: plan.serviceId,
          recurringPlanId: plan.id,
        },
      })

      // Criar lembrete de cobrança (interno)
      await prisma.reminder.create({
        data: {
          type: 'internal',
          subject: `Cobrança gerada: ${plan.name}`,
          message: `Lançamento de R$ ${plan.amount.toNumber().toFixed(2)} gerado para ${plan.client.name}`,
          scheduledAt: plan.nextDueDate,
          status: 'sent',
          userId: plan.userId,
          recurringPlanId: plan.id,
          financialEntryId: entry.id,
        },
      })

      // Calcular próxima data de vencimento
      let nextDueDate = new Date(plan.nextDueDate)
      switch (plan.frequency) {
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7)
          break
        case 'biweekly':
          nextDueDate.setDate(nextDueDate.getDate() + 14)
          break
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1)
          if (plan.dayOfMonth) {
            nextDueDate.setDate(Math.min(plan.dayOfMonth, 28))
          }
          break
        case 'quarterly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 3)
          break
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
          break
      }

      // Atualizar próxima data de vencimento do plano
      await prisma.recurringPlan.update({
        where: { id: plan.id },
        data: { nextDueDate },
      })

      results.push({
        planId: plan.id,
        planName: plan.name,
        entryId: entry.id,
        nextDueDate: nextDueDate.toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('Erro ao processar planos recorrentes:', error)
    return NextResponse.json(
      { error: 'Erro ao processar planos recorrentes' },
      { status: 500 }
    )
  }
}