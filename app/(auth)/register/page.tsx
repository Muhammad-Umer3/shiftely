'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || 'Registration failed')
        return
      }

      toast.success('Registration successful! Please check your email to verify your account.')
      router.push('/login?registered=true')
    } catch (error) {
      setError('An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-card rounded-3xl p-8 md:p-10 border-amber-500/20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            <Sparkles className="w-5 h-5 text-stone-950" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Shiftely</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Create your account
          </h1>
          <p className="text-stone-400">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-stone-300">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Smith"
              className="h-12 bg-stone-900/50 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="h-12 bg-stone-900/50 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationName" className="text-stone-300">Organization Name</Label>
            <Input
              id="organizationName"
              type="text"
              placeholder="Acme Inc."
              className="h-12 bg-stone-900/50 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
              {...register('organizationName')}
            />
            {errors.organizationName && (
              <p className="text-sm text-red-400">{errors.organizationName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-stone-900/50 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
            <p className="text-xs text-stone-500">Must be at least 8 characters</p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
