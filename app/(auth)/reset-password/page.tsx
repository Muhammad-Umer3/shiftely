'use client'

import { Suspense, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      toast.error('Invalid reset link')
      router.push('/forgot-password')
      return
    }
    setToken(tokenParam)
  }, [searchParams, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.message || 'Failed to reset password')
        return
      }

      toast.success('Password reset successful! You can now sign in.')
      router.push('/login')
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return null
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-card rounded-3xl p-8 md:p-10 border-amber-500/20">
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            <Sparkles className="w-5 h-5 text-stone-950" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Shiftely</span>
        </Link>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Reset password
          </h1>
          <p className="text-stone-400">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-300">New Password</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-stone-300">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-stone-900/50 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500">
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

function ResetPasswordLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="glass-card rounded-3xl p-8 md:p-10 border-amber-500/20 animate-pulse">
        <div className="h-10 w-32 bg-stone-800 rounded-lg mb-8" />
        <div className="h-8 w-48 bg-stone-800 rounded mb-2" />
        <div className="h-4 w-32 bg-stone-800 rounded" />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
