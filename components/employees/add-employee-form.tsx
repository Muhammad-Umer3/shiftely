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

const addEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleType: z.string().optional(),
  defaultHoursPerWeek: z.coerce.number().int().min(1).max(168).optional(),
})

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
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          password: data.password,
          roleType: data.roleType || undefined,
          defaultHoursPerWeek: data.defaultHoursPerWeek ?? undefined,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Employee added successfully!')
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
      <div className="space-y-2">
        <Label htmlFor="name" className="text-stone-700">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-stone-700">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-stone-700">Phone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-stone-700">Initial Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
        <p className="text-xs text-stone-500">
          They can change this when they first log in
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="roleType" className="text-stone-700">Role (optional)</Label>
        <Input
          id="roleType"
          type="text"
          placeholder="e.g. Server, Cook"
          className="border-stone-300 focus:border-amber-500 focus:ring-amber-500/20"
          {...register('roleType')}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="defaultHoursPerWeek" className="text-stone-700">Default hours per week (optional)</Label>
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
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold"
        >
          {loading ? 'Adding...' : 'Add Employee'}
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
