import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const requiredFields = ['name', 'email', 'password', 'whatsapp', 'city', 'state', 'serviceType']

  const missing = requiredFields.filter((field) => !body[field])
  if (missing.length > 0) {
    return NextResponse.json(
      { error: 'Preencha todos os campos obrigatorios.' },
      { status: 400 }
    )
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) {
    return NextResponse.json(
      { error: 'Este email ja esta cadastrado. Faça o login.' },
      { status: 409 }
    )
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashPassword(body.password),
      whatsapp: body.whatsapp,
      city: body.city,
      state: body.state,
      serviceType: body.serviceType,
      cnpj: body.cnpj || null,
      workflow: body.workflow || null,
      hasPaid: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      whatsapp: true,
      city: true,
      state: true,
      serviceType: true,
      cnpj: true,
      workflow: true,
      hasPaid: true,
    },
  })

  return NextResponse.json({ created: true, profile: user })
}
