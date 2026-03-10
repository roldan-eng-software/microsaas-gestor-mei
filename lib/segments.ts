export const segments = [
  { key: 'geral', label: 'Geral', description: 'Fluxo base (sem especializacao).' },
  { key: 'beleza', label: 'Beleza', description: 'Atendimento recorrente e agenda forte.' },
  {
    key: 'manutencao_residencial',
    label: 'Manutencao residencial',
    description: 'Visitas, agendamentos e ordens de servico.',
  },
  { key: 'consultoria', label: 'Consultoria', description: 'Contratos, propostas e follow-up.' },
] as const

export type SegmentKey = (typeof segments)[number]['key']

export function isSegmentKey(value: unknown): value is SegmentKey {
  return typeof value === 'string' && segments.some((s) => s.key === value)
}

