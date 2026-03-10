import type { SegmentKey } from '@/lib/segments'

export const moduleCatalog = {
  agenda: {
    key: 'agenda',
    name: 'Agenda',
    description: 'Agenda simples para atendimentos e visitas.',
    href: '/(dashboard)/agenda',
  },
  contratos: {
    key: 'contratos',
    name: 'Contratos',
    description: 'Modelos e controle simples de contratos.',
    href: '/(dashboard)/contratos',
  },
} as const

export type ModuleKey = keyof typeof moduleCatalog

export function isModuleKey(value: unknown): value is ModuleKey {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(moduleCatalog, value)
}

export const segmentModulePresets: Record<SegmentKey, ModuleKey[]> = {
  geral: [],
  beleza: ['agenda'],
  manutencao_residencial: ['agenda'],
  consultoria: ['contratos'],
}

