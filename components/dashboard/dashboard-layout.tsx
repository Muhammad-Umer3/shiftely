'use client'

import { Sidebar } from '@/components/ui/sidebar'
import { NotificationCenter } from '@/components/notifications/notification-center'
import { OnboardingGate } from '@/components/onboarding/onboarding-gate'
import { ReactNode } from 'react'

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-stone-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden md:ml-0 pb-16 md:pb-0 text-stone-900">
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-stone-200 bg-white px-4 md:px-6 gap-2">
          <NotificationCenter />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-stone-100">{children}</main>
      </div>
      <OnboardingGate />
    </div>
  )
}
