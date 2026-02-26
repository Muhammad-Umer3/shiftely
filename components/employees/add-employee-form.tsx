'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

const addEmployeeSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().optional(),
    password: z.string().optional(),
    roleType: z.string().optional(),
    defaultHoursPerWeek: z.coerce.number().int().min(1).max(168).optional(),
  })
  .refine(
    (data) => {
      const hasEmail = data.email != null && data.email.trim().length > 0
      const hasPassword = data.password != null && data.password.length >= 6
      if (hasEmail && hasPassword) return true
      if (!hasEmail && !hasPassword) return true
      return false
    },
    {
      message: 'Provide both email and password to create a login, or leave both blank to add by phone only.',
      path: ['email'],
    }
  )
  .refine(
    (data) => {
      const email = data.email?.trim() ?? ''
      if (email.length === 0) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    },
    { message: 'Invalid email address', path: ['email'] }
  )

type AddEmployeeFormData = z.infer<typeof addEmployeeSchema>

export function AddEmployeeForm({ onSuccess, redirectTo }: { onSuccess?: () => void; redirectTo?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddEmployeeFormData>({
    resolver: zodResolver(addEmployeeSchema) as Resolver<AddEmployeeFormData>,
    defaultValues: { defaultHoursPerWeek: 40 },
  })

  const onSubmit = async (data: AddEmployeeFormData) => {
    setLoading(true)
    try {
      const withLogin =
        data.email != null &&
        data.email.trim().length > 0 &&
        data.password != null &&
        data.password.length >= 6

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: withLogin ? data.email?.trim() : undefined,
          password: withLogin ? data.password : undefined,
          roleType: data.roleType || undefined,
          defaultHoursPerWeek: data.defaultHoursPerWeek ?? undefined,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(
          withLogin
            ? "Added. We've sent them an email to log in and get their schedule."
            : "Added. They'll get shift updates on WhatsApp. You can send a login invite later from their profile."
        )
        reset()
        onSuccess?.()
        if (redirectTo) {
          router.push(redirectTo)
        }
      } else {
        toast.error(result.message || 'Failed to add employee')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Section 1 — Required */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-stone-700">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Jordan Smith"
            className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-stone-700">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. +1 234 567 8900"
            className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
            {...register('phone')}
          />
          <p className="text-xs text-stone-500">
            We&apos;ll send shift updates and reminders via WhatsApp to this number.
          </p>
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="roleType" className="text-stone-700">
            Role (optional)
          </Label>
          <Input
            id="roleType"
            type="text"
            placeholder="e.g. Server, Cook"
            className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
            {...register('roleType')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultHoursPerWeek" className="text-stone-700">
            Default hours per week (optional)
          </Label>
          <Input
            id="defaultHoursPerWeek"
            type="number"
            min={1}
            max={168}
            placeholder="40"
            className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
            {...register('defaultHoursPerWeek', { valueAsNumber: true })}
          />
          <p className="text-xs text-stone-500">Used for availability bar on the schedule (default 40)</p>
        </div>
      </div>

      {/* Section 2 — Optional: Let them log in */}
      <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-stone-900">Let them log in to the app (optional)</h3>
          <p className="text-xs text-stone-600 mt-0.5">
            They&apos;ll see their schedule, request swaps, and get email updates. You can invite them by email
            later if you skip this.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-stone-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-stone-700">
            Temporary password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
            {...register('password')}
          />
          <p className="text-xs text-stone-500">They can change it when they first log in.</p>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
        >
          {loading ? 'Adding...' : 'Add team member'}
        </Button>
        <Link href="/employees/invite">
          <Button type="button" variant="outline" className="border-stone-300 text-stone-600">
            Invite by email instead
          </Button>
        </Link>
      </div>
    </form>
  )
}
