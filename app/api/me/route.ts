import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { featureFlags } from '@/lib/featureFlags'
import { moduleCatalog } from '@/lib/modules/catalog'
import { getMeByEmail } from '@/lib/modules/service'
import { segments } from '@/lib/segments'

export async function GET() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const me = await getMeByEmail(session.user.email)
  if (!me) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    segmentationEnabled: featureFlags.segmentedModules,
    user: {
      id: me.user.id,
      email: me.user.email,
      name: me.user.name,
      segment: me.user.segment,
    },
    enabledModules: me.enabledModules,
    segments,
    moduleCatalog,
  })
}

