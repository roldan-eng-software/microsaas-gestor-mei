import prisma from '@/lib/prisma'
import { featureFlags } from '@/lib/featureFlags'
import { moduleCatalog, segmentModulePresets, type ModuleKey, isModuleKey } from '@/lib/modules/catalog'
import type { SegmentKey } from '@/lib/segments'

async function ensureModulesExist(moduleKeys: ModuleKey[]) {
  await prisma.$transaction(
    moduleKeys.map((key) =>
      prisma.module.upsert({
        where: { key },
        create: {
          key,
          name: moduleCatalog[key].name,
          description: moduleCatalog[key].description,
        },
        update: {
          name: moduleCatalog[key].name,
          description: moduleCatalog[key].description,
        },
      })
    )
  )
}

export async function getEnabledModulesForUserId(userId: string): Promise<ModuleKey[]> {
  if (!featureFlags.segmentedModules) return []

  const rows = await prisma.userModule.findMany({
    where: { userId, enabled: true },
    select: { moduleKey: true },
  })

  return rows.map((r) => r.moduleKey).filter(isModuleKey)
}

export async function applySegmentPresetToUser(userId: string, segment: SegmentKey): Promise<ModuleKey[]> {
  if (!featureFlags.segmentedModules) return []

  const preset = segmentModulePresets[segment] ?? []
  if (preset.length === 0) return []

  await ensureModulesExist(preset)

  await prisma.$transaction(
    preset.map((moduleKey) =>
      prisma.userModule.upsert({
        where: { userId_moduleKey: { userId, moduleKey } },
        create: { userId, moduleKey, enabled: true },
        update: { enabled: true },
      })
    )
  )

  return preset
}

export async function getMeByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, segment: true, hasPaid: true },
  })

  if (!user) return null

  const enabledModules = await getEnabledModulesForUserId(user.id)
  return { user, enabledModules }
}
