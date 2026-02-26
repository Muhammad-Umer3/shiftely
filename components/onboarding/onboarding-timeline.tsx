'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Check, ChevronDown, ChevronRight, ChevronUp, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnboarding } from './onboarding-context'
import { ONBOARDING_STEPS } from './onboarding-steps'
import { cn } from '@/lib/utils/cn'

const TIMELINE_PATHS = ['/schedules', '/employees']

export function OnboardingTimeline() {
  const pathname = usePathname()
  const ctx = useOnboarding()
  const [minimized, setMinimized] = useState(false)

  const show = pathname && TIMELINE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (!ctx || ctx.loading || ctx.completed || !show) return null

  const { currentStep, refetch } = ctx
  const completedCount = currentStep - 1

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-stone-200 bg-white/95 px-4 py-2.5 shadow-lg shadow-stone-200/50 backdrop-blur-sm text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors"
        aria-label="Expand get started steps"
      >
        <ListChecks className="h-4 w-4 text-amber-600 shrink-0" />
        <span className="text-sm font-medium">Get started</span>
        <span className="text-xs text-stone-500">
          {completedCount}/{ONBOARDING_STEPS.length}
        </span>
        <ChevronUp className="h-3.5 w-3.5 text-stone-400" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-72 rounded-xl border border-stone-200 bg-white/95 shadow-lg shadow-stone-200/50 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2 p-3 border-b border-stone-100">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-stone-800">Get started</h3>
          <p className="text-xs text-stone-500 mt-0.5">Complete these steps to set up Shiftely</p>
        </div>
        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="shrink-0 rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          aria-label="Minimize"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <ul className="p-2 space-y-0.5">
        {ONBOARDING_STEPS.map((step, i) => {
          const stepNum = i + 1
          const done = currentStep > stepNum
          const current = currentStep === stepNum
          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center gap-2.5 rounded-lg py-2 px-2.5 text-left transition-colors',
                current && 'bg-amber-100 border border-amber-200',
                !current && 'border border-transparent',
                done && 'text-stone-600'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  done && 'bg-amber-500 text-white',
                  current && 'bg-amber-600 text-white ring-2 ring-amber-300',
                  !done && !current && 'bg-stone-200 text-stone-500'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : stepNum}
              </span>
              <span
                className={cn(
                  'flex-1 min-w-0 text-sm truncate',
                  done && 'line-through decoration-stone-400',
                  current && 'font-semibold text-stone-900',
                  !current && !done && 'text-stone-600'
                )}
              >
                {current && <span className="text-amber-700 font-medium mr-1">Current:</span>}
                {step.title}
              </span>
              {current && (
                <ChevronRight className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              )}
            </li>
          )
        })}
      </ul>
      <div className="p-2 pt-0">
        <Button
          size="sm"
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-medium"
          onClick={() => refetch()}
        >
          {currentStep <= ONBOARDING_STEPS.length ? 'Continue' : 'Review'}
        </Button>
      </div>
    </div>
  )
}
