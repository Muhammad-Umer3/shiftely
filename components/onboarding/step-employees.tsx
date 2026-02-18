'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export function StepEmployees({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Add Your First Employees</h3>
      <p className="text-sm text-muted-foreground">
        Add team members to your organization. You can add more later from the Employees page.
      </p>
      <div className="flex gap-2">
        <Link href="/dashboard/employees/new">
          <Button>Add Employee</Button>
        </Link>
        <Button variant="outline" onClick={onComplete}>
          I'll add employees later
        </Button>
      </div>
    </div>
  )
}
