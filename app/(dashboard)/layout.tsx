import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
