'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export function StepEmployees({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Invite Your First Team Members</h3>
      <p className="text-sm text-muted-foreground">
        Send invitations to join your organization. They&apos;ll create their account when they accept.
      </p>
      <div className="flex gap-2">
        <Link href="/dashboard/employees/invite">
          <Button>Invite Member</Button>
        </Link>
        <Button variant="outline" onClick={onComplete}>
          I'll add employees later
        </Button>
      </div>
    </div>
  )
}
