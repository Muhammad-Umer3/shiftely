'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'
import { Sparkles, Mail, CheckCircle2, XCircle } from 'lucide-react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('idle')
    }
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    setStatus('loading')
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()

      if (!response.ok) {
        setStatus('error')
        setMessage(result.message || 'Verification failed')
        toast.error(result.message || 'Verification failed')
        return
      }

      setStatus('success')
      setMessage('Email verified successfully!')
      toast.success('Email verified successfully!')

      setTimeout(() => {
        router.push('/login?verified=true')
      }, 2000)
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred during verification')
      toast.error('An error occurred')
    }
  }

  const resendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.message || 'Failed to resend verification email')
        return
      }

      toast.success('Verification email sent! Check your inbox.')
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const AuthCard = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-md">
      <div className="glass-card rounded-3xl p-8 md:p-10 border-amber-500/20">
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            <Sparkles className="w-5 h-5 text-stone-950" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Shiftely</span>
        </Link>
        {children}
      </div>
    </div>
  )

  if (status === 'loading') {
    return (
      <AuthCard>
        <div className="flex flex-col items-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6 animate-pulse">
            <Mail className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-stone-400">Verifying your email...</p>
        </div>
      </AuthCard>
    )
  }

  if (status === 'success') {
    return (
      <AuthCard>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
          Email Verified!
        </h1>
        <p className="text-stone-400 text-center mb-8">
          Your email has been verified. Redirecting to login...
        </p>
        <Link href="/login">
          <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 transition-all">
            Go to Login
          </Button>
        </Link>
      </AuthCard>
    )
  }

  if (status === 'error') {
    return (
      <AuthCard>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
          Verification Failed
        </h1>
        <p className="text-stone-400 text-center mb-8">
          {message} The verification link may have expired or is invalid.
        </p>
        <div className="space-y-4">
          <Button
            onClick={resendVerification}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 transition-all"
          >
            Resend Verification Email
          </Button>
          <Link href="/login" className="block">
            <Button
              variant="outline"
              className="w-full h-12 text-base border-2 border-stone-700 text-stone-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
          <Mail className="w-8 h-8 text-amber-400" />
        </div>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
        Verify Your Email
      </h1>
      <p className="text-stone-400 text-center mb-8">
        Please check your email for a verification link. If you haven&apos;t received it, you can request a new one.
      </p>
      <div className="space-y-4">
        <Button
          onClick={resendVerification}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 transition-all"
        >
          Resend Verification Email
        </Button>
        <Link href="/login" className="block">
          <Button
            variant="outline"
            className="w-full h-12 text-base border-2 border-stone-700 text-stone-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
          >
            Back to Login
          </Button>
        </Link>
      </div>
    </AuthCard>
  )
}

function VerifyEmailLoading() {
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
