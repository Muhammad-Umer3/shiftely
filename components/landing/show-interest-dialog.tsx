'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const leadSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  phone: z.string().optional(),
})

type LeadFormData = z.infer<typeof leadSchema>

interface ShowInterestDialogProps {
  source: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShowInterestDialog({
  source,
  open,
  onOpenChange,
}: ShowInterestDialogProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  })

  const onSubmit = async (data: LeadFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          name: data.name || undefined,
          phone: data.phone || undefined,
          source,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("You're on the list!")
        reset()
        onOpenChange(false)
      } else {
        toast.error(result.message || 'Something went wrong')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-stone-700 bg-stone-900 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Show your interest
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            Get notified when we launch new features. We might contact you to be among the first beta users.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="lead-email" className="text-stone-300">
              Email
            </Label>
            <Input
              id="lead-email"
              type="email"
              placeholder="you@company.com"
              className="h-11 border-stone-700 bg-stone-800 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-name" className="text-stone-300">
              Name <span className="text-stone-500">(optional)</span>
            </Label>
            <Input
              id="lead-name"
              type="text"
              placeholder="Your name"
              className="h-11 border-stone-700 bg-stone-800 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
              {...register('name')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-phone" className="text-stone-300">
              Phone <span className="text-stone-500">(optional)</span>
            </Label>
            <Input
              id="lead-phone"
              type="tel"
              placeholder="+1 234 567 8900"
              className="h-11 border-stone-700 bg-stone-800 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
              {...register('phone')}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Notify me'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
