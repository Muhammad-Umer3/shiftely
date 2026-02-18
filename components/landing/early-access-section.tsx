'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, MessageSquare, CheckCircle } from 'lucide-react'

export function EarlyAccessSection() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        setEmail('')
        setMessage('')
      } else {
        setError(result.message || 'Something went wrong')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <section id="early-access" className="py-24 bg-stone-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              You&apos;re on the list!
            </h2>
            <p className="text-lg text-stone-400">
              We&apos;ll be in touch soon. Thanks for sharing your scheduling challenges with us.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="early-access" className="py-24 bg-stone-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
            Early Access
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Get early access to
            <span className="block gradient-text">Shiftely</span>
          </h2>
          <p className="text-lg text-stone-400">
            Join our waitlist and tell us about your scheduling challenges. We&apos;ll reach out when we&apos;re ready for you.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 md:p-10 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="early-access-email" className="text-stone-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="early-access-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-stone-900/50 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="early-access-message" className="text-stone-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                What&apos;s your biggest scheduling challenge?
              </Label>
              <textarea
                id="early-access-message"
                rows={4}
                placeholder="Tell us about your scheduling pain points..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={10}
                className="flex w-full rounded-xl border border-stone-700 bg-stone-900/50 px-4 py-3 text-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 resize-none"
              />
              <p className="text-sm text-stone-500">At least 10 characters</p>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 transition-all"
            >
              {loading ? 'Joining...' : 'Get Early Access'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
