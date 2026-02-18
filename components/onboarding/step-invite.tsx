'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

type InviteFormData = z.infer<typeof inviteSchema>

export function StepInvite({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  })

  const onSubmit = async (data: InviteFormData) => {
    if (!data.email) {
      onComplete()
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      if (response.ok) {
        toast.success('Invitation sent!')
        onComplete()
      } else {
        toast.error('Failed to send invitation')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Invite Team Members</h3>
      <p className="text-sm text-muted-foreground">
        Invite team members to join your organization. You can skip this and invite later.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address (Optional)</Label>
          <Input id="email" type="email" {...register('email')} placeholder="colleague@example.com" />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
          <Button type="button" variant="outline" onClick={onComplete}>
            Skip
          </Button>
        </div>
      </form>
    </div>
  )
}
