import Link from 'next/link'
import { Navbar } from '@/components/landing/navbar'
import { Button } from '@/components/ui/button'
import { NotFoundSetter } from '@/components/providers/not-found-provider'
import { Home, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen overflow-hidden bg-stone-950 noise-overlay">
      <NotFoundSetter />
      <div className="absolute inset-0 spotlight" />
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl animate-float delay-300" />
      <div className="absolute top-1/2 right-[10%] w-48 h-48 bg-amber-500/5 rounded-full blur-3xl animate-float delay-500" />

      {/* Floating glass cards like hero */}
      <div className="absolute top-32 right-[12%] hidden lg:block animate-float delay-200">
        <div className="glass-card p-4 rounded-2xl">
          <Calendar className="w-8 h-8 text-amber-400" />
        </div>
      </div>
      <div className="absolute top-52 left-[10%] hidden lg:block animate-float delay-500">
        <div className="glass-card p-4 rounded-2xl">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
      </div>
      <div className="absolute bottom-40 right-[15%] hidden lg:block animate-float delay-700">
        <div className="glass-card p-4 rounded-2xl">
          <MapPin className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6 pt-24 pb-24">
        <div className="mx-auto max-w-2xl w-full text-center">
          {/* 404 number */}
          <p className="font-serif text-[10rem] sm:text-[12rem] font-bold leading-none gradient-text animate-fade-in-up select-none">
            404
          </p>

          <div className="glass-card rounded-2xl p-8 sm:p-10 mt-4 animate-fade-in-up delay-100">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <MapPin className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Page not found
            </h1>
            <p className="mt-4 text-stone-400">
              This shift doesn&apos;t exist — the route you&apos;re looking for
              might have been moved or never scheduled.
            </p>

            {/* Primary Home CTA */}
            <div className="mt-8">
              <Link href="/">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-10 py-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all animate-pulse-glow"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Home
                </Button>
              </Link>
            </div>

            {/* Secondary links */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link
                href="/#features"
                className="inline-flex items-center gap-1.5 text-stone-400 hover:text-amber-400 transition-colors"
              >
                Features <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-stone-600">·</span>
              <Link
                href="/#pricing"
                className="text-stone-400 hover:text-amber-400 transition-colors"
              >
                Pricing
              </Link>
              <span className="text-stone-600">·</span>
              <Link
                href="/login"
                className="text-stone-400 hover:text-amber-400 transition-colors"
              >
                Login
              </Link>
              <span className="text-stone-600">·</span>
              <Link
                href="/register"
                className="text-stone-400 hover:text-amber-400 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Bottom quick links strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-200">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-stone-600 text-stone-400 hover:text-amber-400 hover:border-amber-500/30">
                <Home className="mr-1.5 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" size="sm" className="border-stone-600 text-stone-400 hover:text-amber-400 hover:border-amber-500/30">
                Blog
              </Button>
            </Link>
            <Link href="/#testimonials">
              <Button variant="outline" size="sm" className="border-stone-600 text-stone-400 hover:text-amber-400 hover:border-amber-500/30">
                Testimonials
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
