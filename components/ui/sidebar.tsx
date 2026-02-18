'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { LayoutDashboard, Users, Calendar, Settings, LogOut, BarChart3, AlertCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { PERMISSIONS } from '@/lib/permissions/permissions'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Employees', href: '/dashboard/employees', icon: Users },
  { name: 'Swaps', href: '/dashboard/swaps', icon: Calendar },
  { name: 'Compliance', href: '/dashboard/compliance', icon: AlertCircle },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { hasPermission } = usePermissions()

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Schedules', href: '/dashboard/schedules', icon: Calendar, permission: PERMISSIONS.SCHEDULE_VIEW },
    { name: 'Employees', href: '/dashboard/employees', icon: Users, permission: PERMISSIONS.EMPLOYEE_VIEW },
    { name: 'Swaps', href: '/dashboard/swaps', icon: Calendar, permission: PERMISSIONS.SWAP_VIEW },
    { name: 'Compliance', href: '/dashboard/compliance', icon: AlertCircle, permission: PERMISSIONS.COMPLIANCE_VIEW },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, permission: PERMISSIONS.ANALYTICS_VIEW },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
  ]

  const navigation = allNavigation.filter((item) => !item.permission || hasPermission(item.permission))

  return (
    <>
      <div className="hidden md:flex h-full w-64 flex-col bg-stone-950 border-r border-stone-800">
        <div className="flex h-16 items-center border-b border-stone-800 px-6">
          <h1 className="text-xl font-bold text-white">Shiftely</h1>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-stone-800 p-4">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-950 border-t border-stone-800 flex justify-around items-center h-16 z-50">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 text-xs',
                isActive ? 'text-amber-400' : 'text-stone-400'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
