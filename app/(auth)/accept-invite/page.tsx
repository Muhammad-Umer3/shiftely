'use client'

import { Suspense, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { Sparkles, UserPlus } from 'lucide-react'

const acceptInviteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [loadingInvite, setLoadingInvite] = useState(true)
  const [invitation, setInvitation] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      toast.error('Invalid invitation link')
      router.push('/login')
      return
    }
    setToken(tokenParam)
    fetchInvitation(tokenParam)
  }, [searchParams, router])

  const fetchInvitation = async (inviteToken: string) => {
    try {
      const response = await fetch(`/api/invitations/${inviteToken}`)
      const data = await response.json()

      if (response.ok) {
        setInvitation(data.invitation)
      } else {
        toast.error(data.message || 'Invalid invitation')
        router.push('/login')
      }
    } catch (error) {
      toast.error('An error occurred')
      router.push('/login')
    } finally {
      setLoadingInvite(false)
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
  })

  const onSubmit = async (data: AcceptInviteFormData) => {
    if (!token) return

    setLoading(true)
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: data.name,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Account created! You can now sign in.')
        router.push('/login?invited=true')
      } else {
        toast.error(result.message || 'Failed to accept invitation')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loadingInvite) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 md:p-10 border-amber-500/20 animate-pulse">
          <div className="h-10 w-32 bg-stone-800 rounded-lg mb-8" />
          <div className="h-12 w-full bg-stone-800 rounded-lg mb-4" />
          <div className="h-12 w-full bg-stone-800 rounded-lg mb-4" />
          <div className="h-12 w-full bg-stone-800 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!invitation) {
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
            <UserPlus className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Accept invitation
          </h1>
          <p className="text-stone-400">
            You&apos;ve been invited to join <span className="text-amber-400 font-medium">{invitation.organization.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              value={invitation.email}
              disabled
              className="h-12 bg-stone-900/80 border-stone-700 text-stone-500 cursor-not-allowed"
            />
            <p className="text-xs text-stone-500">This email will be used for your account</p>
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
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Accept Invitation & Create Account'}
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

function AcceptInviteLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="glass-card rounded-3xl p-8 md:p-10 border-amber-500/20 animate-pulse">
        <div className="h-10 w-32 bg-stone-800 rounded-lg mb-8" />
        <div className="h-12 w-full bg-stone-800 rounded-lg mb-4" />
        <div className="h-12 w-full bg-stone-800 rounded-lg mb-4" />
        <div className="h-12 w-3/4 bg-stone-800 rounded-lg" />
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AcceptInviteLoading />}>
      <AcceptInviteContent />
    </Suspense>
  )
}
