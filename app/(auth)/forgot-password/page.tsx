'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Mail } from 'lucide-react'
import { toast } from 'sonner'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.message || 'Failed to send reset email')
        return
      }

      setIsSubmitted(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
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
              <Mail className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
            Check your email
          </h1>
          <p className="text-stone-400 text-center mb-8">
            We&apos;ve sent a password reset link to your email address. The link will expire in 1 hour.
          </p>

          <Link href="/login" className="block">
            <Button
              variant="outline"
              className="w-full h-12 text-base border-2 border-stone-700 text-stone-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    )
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

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Forgot password?
          </h1>
          <p className="text-stone-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500">
          Remember your password?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
