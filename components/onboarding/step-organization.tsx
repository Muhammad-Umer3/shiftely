'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  timezone: z.string().min(1, 'Timezone is required'),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

export function StepOrganization({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

  const onSubmit = async (data: OrganizationFormData) => {
    setLoading(true)
    try {
      // Update organization settings
      const response = await fetch('/api/organizations/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Organization updated!')
        onComplete()
      } else {
        toast.error('Failed to update organization')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Organization Setup</h3>
      <p className="text-sm text-muted-foreground">
        Name your business or team. This helps keep things organized.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" {...register('timezone')} readOnly />
          <p className="text-xs text-muted-foreground">
            Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </form>
    </div>
  )
}
