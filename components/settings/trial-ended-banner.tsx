import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function TrialEndedBanner() {
  return (
    <div className="bg-amber-600 text-white px-4 py-3 text-center text-sm">
      Your Pro trial has ended. Choose a plan to keep access to premium features.
      <Button
        asChild
        variant="secondary"
        size="sm"
        className="ml-3 bg-white text-amber-800 hover:bg-amber-50"
      >
        <Link href="/settings/plan">Choose your plan</Link>
      </Button>
    </div>
  )
}
