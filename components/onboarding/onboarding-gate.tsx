'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { OnboardingDialog } from './onboarding-dialog'

export function OnboardingGate() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    async function fetchStatus() {
      try {
        const res = await fetch('/api/onboarding/status')
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (cancelled) return
        if (data.onboardingCompleted) {
          setCompleted(true)
          setOpen(false)
          return
        }
        setCurrentStep(typeof data.onboardingStep === 'number' ? data.onboardingStep : 1)
        setOpen(true)
      } catch {
        if (!cancelled) setOpen(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStatus()
    return () => {
      cancelled = true
    }
  }, [])

  // Re-open dialog when user navigates to another dashboard page and onboarding is not complete
  useEffect(() => {
    if (!loading && !completed && pathname) {
      setOpen(true)
    }
  }, [pathname, loading, completed])

  const handleStepComplete = async (nextStep: number) => {
    try {
      const res = await fetch('/api/onboarding/step', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: nextStep }),
      })
      if (res.ok) {
        setCurrentStep(nextStep)
      }
    } catch {
      toast.error('Failed to save progress')
    }
  }

  const handleComplete = async () => {
    try {
      const res = await fetch('/api/onboarding/complete', { method: 'POST' })
      if (res.ok) {
        setCompleted(true)
        setOpen(false)
        toast.success('Onboarding completed!')
        router.refresh()
      } else {
        toast.error('Failed to complete onboarding')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  if (loading || completed) return null

  return (
    <OnboardingDialog
      open={open}
      onOpenChange={setOpen}
      currentStep={currentStep}
      onStepComplete={handleStepComplete}
      onComplete={handleComplete}
    />
  )
}
