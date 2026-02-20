'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StepOrganization } from './step-organization'
import { StepEmployees } from './step-employees'
import { StepSchedule } from './step-schedule'
import { StepInvite } from './step-invite'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const STEPS = [
  { id: 1, title: 'Organization' },
  { id: 2, title: 'Add Employees' },
  { id: 3, title: 'Generate Schedule' },
  { id: 4, title: 'Invite Team' },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const router = useRouter()

  const handleStepComplete = (step: number) => {
    setCompletedSteps([...completedSteps, step])
    if (step < STEPS.length) {
      setCurrentStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Onboarding completed!')
        router.push('/schedules')
      } else {
        toast.error('Failed to complete onboarding')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Shiftely!</CardTitle>
          <CardDescription>
            Add your team, set availability, and let AI generate your first schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="space-y-4">
            {currentStep === 1 && (
              <StepOrganization onComplete={() => handleStepComplete(1)} />
            )}
            {currentStep === 2 && (
              <StepEmployees onComplete={() => handleStepComplete(2)} />
            )}
            {currentStep === 3 && (
              <StepSchedule onComplete={() => handleStepComplete(3)} />
            )}
            {currentStep === 4 && (
              <StepInvite onComplete={() => handleStepComplete(4)} />
            )}
          </div>

          <div className="flex justify-between">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              {currentStep === STEPS.length && (
                <Button onClick={handleComplete}>
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
