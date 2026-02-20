import { Navbar } from '@/components/landing/navbar'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-hidden bg-stone-950 min-h-screen">
      <Navbar />
      <main className="pt-20">{children}</main>
    </div>
  )
}
