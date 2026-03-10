import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import prisma from '@/lib/prisma'
import { applySegmentPresetToUser, getEnabledModulesForUserId } from '@/lib/modules/service'
import { isSegmentKey } from '@/lib/segments'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const segment = body?.segment

  if (!isSegmentKey(segment)) {
    return NextResponse.json({ error: 'Segmento inválido' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { segment },
  })

  await applySegmentPresetToUser(user.id, segment)
  const enabledModules = await getEnabledModulesForUserId(user.id)

  return NextResponse.json({ ok: true, segment, enabledModules })
}
