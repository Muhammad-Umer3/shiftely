'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Sparkles } from 'lucide-react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${
      scrolled 
        ? 'bg-stone-950/90 backdrop-blur-xl border-b border-amber-500/10' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-stone-950" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Shiftely
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link 
              href="/#problems" 
              className="text-sm font-medium text-stone-400 hover:text-amber-400 transition-colors relative group"
            >
              Solutions
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              href="/#features" 
              className="text-sm font-medium text-stone-400 hover:text-amber-400 transition-colors relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              href="/#pricing" 
              className="text-sm font-medium text-stone-400 hover:text-amber-400 transition-colors relative group"
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              href="/blog" 
              className="text-sm font-medium text-stone-400 hover:text-amber-400 transition-colors relative group"
            >
              Blog
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-stone-400 hover:text-white hover:bg-stone-800">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all" title="No card required">
                Start free trial
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-stone-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-stone-800 animate-fade-in">
            <Link
              href="/#problems"
              className="block px-4 py-3 text-sm font-medium text-stone-300 hover:text-amber-400 hover:bg-stone-800/50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Solutions
            </Link>
            <Link
              href="/#features"
              className="block px-4 py-3 text-sm font-medium text-stone-300 hover:text-amber-400 hover:bg-stone-800/50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="block px-4 py-3 text-sm font-medium text-stone-300 hover:text-amber-400 hover:bg-stone-800/50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="block px-4 py-3 text-sm font-medium text-stone-300 hover:text-amber-400 hover:bg-stone-800/50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <div className="px-4 pt-4 border-t border-stone-800 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center border-stone-600 text-stone-300 hover:bg-stone-800">
                  Log in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-semibold">
                  Start free trial
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
