import { Navbar } from '@/components/landing/navbar'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-stone-950">
      {/* Background elements - same as landing */}
      <div className="fixed inset-0 spotlight" />
      <div className="fixed inset-0 grid-pattern" />
      <div className="fixed top-32 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl animate-float delay-300 pointer-events-none" />
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-950 to-transparent pointer-events-none" />

      <Navbar />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-20 pb-12">
        {children}
      </main>
    </div>
  )
}
