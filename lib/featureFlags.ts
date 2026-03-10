export const featureFlags = {
  segmentedModules:
    process.env.NEXT_PUBLIC_SEGMENTED_MODULES === 'true' ||
    process.env.SEGMENTED_MODULES === 'true',
} as const

