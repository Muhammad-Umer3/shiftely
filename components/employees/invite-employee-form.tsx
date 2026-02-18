'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type InviteFormData = z.infer<typeof inviteSchema>

export function InviteEmployeeForm({ onSuccess, redirectTo }: { onSuccess?: () => void; redirectTo?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  })

  const onSubmit = async (data: InviteFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Invitation sent successfully!')
        reset()
        onSuccess?.()
        if (redirectTo) {
          router.push(redirectTo)
        }
      } else {
        toast.error(result.message || 'Failed to send invitation')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-stone-700">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="employee@example.com"
          className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
        <p className="text-xs text-stone-500">
          An invitation email will be sent to this address
        </p>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
      >
        {loading ? 'Sending...' : 'Send Invitation'}
      </Button>
    </form>
  )
}
