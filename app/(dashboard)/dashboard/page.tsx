import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/utils/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-600">Welcome back, {user?.name || 'User'}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-stone-200 bg-white text-stone-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-900">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">0</div>
            <p className="text-xs text-stone-600">Active employees</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 bg-white text-stone-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-900">This Week Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">0</div>
            <p className="text-xs text-stone-600">Scheduled shifts</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 bg-white text-stone-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-900">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">0</div>
            <p className="text-xs text-stone-600">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200 bg-white text-stone-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-900">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">0h</div>
            <p className="text-xs text-stone-600">This month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
