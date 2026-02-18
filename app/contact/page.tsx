'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navbar } from '@/components/landing/navbar'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Message sent! We\'ll get back to you soon.')
        reset()
      } else {
        toast.error(result.message || 'Failed to send message')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="fixed inset-0 grid-pattern opacity-30" />
      <Navbar />

      <main className="relative z-10 pt-28 pb-16 px-6">
        <div className="container mx-auto max-w-xl">
          <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-stone-950" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Shiftely</span>
          </Link>

          <div className="glass-card rounded-3xl p-8 md:p-10 border-amber-500/20">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Get in touch
            </h1>
            <p className="text-stone-400 mb-8">
              Have a question or want to learn more? Send us a message and we&apos;ll get back to you.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-stone-300">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
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
                <Label htmlFor="subject" className="text-stone-300">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="What can we help you with?"
                  className="h-12 bg-stone-900/50 border-stone-700 text-white placeholder:text-stone-500 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50"
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="text-sm text-red-400">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-stone-300">Message</Label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Describe your question or query..."
                  className="flex w-full rounded-xl border border-stone-700 bg-stone-900/50 px-4 py-3 text-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 resize-none"
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-sm text-red-400">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 transition-all"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-500">
              <Link href="/" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
