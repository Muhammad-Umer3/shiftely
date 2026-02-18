'use client'

import { Sidebar } from '@/components/ui/sidebar'
import { ReactNode } from 'react'

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-stone-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden md:ml-0 pb-16 md:pb-0 text-stone-900">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-stone-100">{children}</main>
      </div>
    </div>
  )
}
