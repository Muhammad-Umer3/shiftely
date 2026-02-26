'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type OnboardingContextValue = {
  loading: boolean
  completed: boolean
  currentStep: number
  setCurrentStep: (step: number) => void
  refetch: () => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [currentStep, setCurrentStepState] = useState(1)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/onboarding/status')
      if (!res.ok) return
      const data = await res.json()
      setCompleted(Boolean(data.onboardingCompleted))
      setCurrentStepState(typeof data.onboardingStep === 'number' ? data.onboardingStep : 1)
    } catch {
      setCompleted(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const setCurrentStep = useCallback((step: number) => {
    setCurrentStepState(step)
  }, [])

  const value: OnboardingContextValue = {
    loading,
    completed,
    currentStep: Math.min(5, Math.max(1, currentStep)),
    setCurrentStep,
    refetch: fetchStatus,
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  return ctx
}
