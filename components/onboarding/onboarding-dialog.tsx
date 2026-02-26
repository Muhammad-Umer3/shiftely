'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StepEmployees } from './step-employees'
import { StepCreateSchedule } from './step-create-schedule'
import { StepAIFill } from './step-ai-fill'
import { StepFillCalendar } from './step-fill-calendar'
import { StepPublish } from './step-publish'
import { ONBOARDING_STEPS } from './onboarding-steps'

const STEPS = ONBOARDING_STEPS

export function OnboardingDialog({
  open,
  onOpenChange,
  currentStep,
  onStepComplete,
  onComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStep: number
  onStepComplete: (nextStep: number) => void
  onComplete: () => void
}) {
  const progress = (currentStep / STEPS.length) * 100

  const handleStepDone = (step: number) => {
    if (step < STEPS.length) {
      onStepComplete(step + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepComplete(currentStep - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to Shiftely</DialogTitle>
          <DialogDescription>
            Get set up in a few steps: add your team, create a schedule, let AI fill roles, then publish.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>
                Step {currentStep} of {STEPS.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="min-h-[120px]">
            {currentStep === 1 && (
              <StepEmployees onComplete={() => handleStepDone(1)} />
            )}
            {currentStep === 2 && (
              <StepCreateSchedule onComplete={() => handleStepDone(2)} />
            )}
            {currentStep === 3 && (
              <StepAIFill onComplete={() => handleStepDone(3)} />
            )}
            {currentStep === 4 && (
              <StepFillCalendar onComplete={() => handleStepDone(4)} />
            )}
            {currentStep === 5 && (
              <StepPublish
                onComplete={onComplete}
                onCompleteLater={onComplete}
              />
            )}
          </div>

          <div className="flex justify-between pt-2">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            ) : (
              <div />
            )}
            <Button
              variant="ghost"
              className="text-stone-500"
              onClick={() => onOpenChange(false)}
            >
              Remind me later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
