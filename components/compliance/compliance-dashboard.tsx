'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

type ComplianceData = {
  employee: {
    id: string
    name: string | null
  }
  weeklyHours: number
  overtime: {
    weeklyHours: number
    overtimeHours: number
    hasOvertime: boolean
  }
}

export function ComplianceDashboard({ data }: { data: ComplianceData[] }) {
  const totalHours = data.reduce((sum, item) => sum + item.weeklyHours, 0)
  const totalOvertime = data.reduce((sum, item) => sum + item.overtime.overtimeHours, 0)
  const employeesWithOvertime = data.filter((item) => item.overtime.hasOvertime).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Weekly Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Across all employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Overtime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalOvertime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Overtime hours this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overtime Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{employeesWithOvertime}</div>
            <p className="text-xs text-muted-foreground">Employees over 40 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Hours Breakdown</CardTitle>
          <CardDescription>Weekly hours and overtime status per employee</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((item) => (
              <div
                key={item.employee.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.employee.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.weeklyHours.toFixed(1)} hours this week
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {item.overtime.hasOvertime && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {item.overtime.overtimeHours.toFixed(1)}h overtime
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-3 py-1 rounded text-sm ${
                      item.weeklyHours >= 40
                        ? 'bg-red-100 text-red-800'
                        : item.weeklyHours >= 35
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {item.weeklyHours >= 40 ? 'Overtime' : item.weeklyHours >= 35 ? 'Near Limit' : 'Normal'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
