'use client'

import { useOnboarding } from './onboarding-context'

export function OnboardingGate() {
  const ctx = useOnboarding()
  if (!ctx || ctx.loading || ctx.completed) return null

  return null
}
