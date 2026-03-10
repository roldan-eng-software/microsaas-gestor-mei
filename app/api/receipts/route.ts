import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const receipts = await prisma.receipt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(receipts)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar recibos' }, { status: 500 })
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
    
    // Buscar lançamento financeiro
    const financialEntry = await prisma.financialEntry.findUnique({
      where: { id: body.financialEntryId },
      include: { client: true },
    })
    
    if (!financialEntry) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 })
    }
    
    // Gerar número sequencial
    const lastReceipt = await prisma.receipt.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    
    let receiptNumber = 1
    if (lastReceipt) {
      const match = lastReceipt.number.match(/REC-(\d+)/)
      if (match) {
        receiptNumber = parseInt(match[1]) + 1
      }
    }
    
    const number = `REC-${receiptNumber.toString().padStart(4, '0')}`
    const shareUrl = `${process.env.NEXTAUTH_URL}/recibo/${number}`
    
    const receipt = await prisma.receipt.create({
      data: {
        number,
        amount: financialEntry.amount,
        description: financialEntry.description,
        date: financialEntry.date,
        clientName: financialEntry.client?.name,
        clientEmail: financialEntry.client?.email,
        clientPhone: financialEntry.client?.phone,
        clientAddress: financialEntry.client?.address,
        issuerName: user.name,
        issuerEmail: user.email,
        shareUrl,
        isPublic: true,
        userId: user.id,
        financialEntryId: financialEntry.id,
      },
    })
    
    return NextResponse.json(receipt)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao gerar recibo' }, { status: 500 })
  }
}