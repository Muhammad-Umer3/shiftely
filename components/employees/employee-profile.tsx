'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmployeeDailyView } from '@/components/employees/employee-daily-view'
import { EmployeeLeavesList } from '@/components/employees/employee-leaves-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type EmployeeWithUser = {
  id: string
  name?: string | null
  phone?: string | null
  user?: {
    id: string
    name: string | null
    email: string
    phone: string | null
  } | null
  roleType: string | null
  hourlyRate: number | null
  defaultHoursPerWeek?: number | null
  shifts?: Array<{
    id: string
    startTime: Date
    endTime: Date
    position: string | null
  }>
}

export function EmployeeProfile({ employee }: { employee: EmployeeWithUser }) {
  const hasUser = !!employee.user
  return (
    <div className="space-y-8">
      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-stone-900">Employee Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {hasUser ? (
            <>
              <div>
                <p className="text-sm font-medium text-stone-600">Email</p>
                <p className="text-lg text-stone-900">{employee.user!.email}</p>
              </div>
              {(employee.user!.phone || employee.phone) && (
                <div>
                  <p className="text-sm font-medium text-stone-600">Phone</p>
                  <p className="text-lg text-stone-900">{employee.user!.phone || employee.phone}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-stone-600">Phone</p>
                <p className="text-lg text-stone-900">{employee.phone ?? '—'}</p>
              </div>
              <div className="space-y-3 pt-1">
                <p className="text-sm text-stone-600">
                  No login yet — they get shift updates via WhatsApp. Send them an invite so they can log in and see their schedule.
                </p>
                <Link href="/employees/invite">
                  <Button variant="outline" size="sm" className="border-stone-300">
                    Send login invite
                  </Button>
                </Link>
              </div>
            </>
          )}
          {employee.roleType && (
            <div>
              <p className="text-sm font-medium text-stone-600">Role</p>
              <p className="text-lg text-stone-900">{employee.roleType}</p>
            </div>
          )}
          {employee.hourlyRate != null && employee.hourlyRate > 0 && (
            <div>
              <p className="text-sm font-medium text-stone-600">Hourly Rate</p>
              <p className="text-lg text-stone-900">${employee.hourlyRate.toString()}/hr</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-stone-600">Default hours per week</p>
            <p className="text-lg text-stone-900">{employee.defaultHoursPerWeek ?? 40}h</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-stone-900">Daily View</CardTitle>
          <CardDescription className="text-stone-600">Shifts and leaves for this employee</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <EmployeeDailyView employeeId={employee.id} />
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-stone-900">Upcoming Days Off</CardTitle>
          <CardDescription className="text-stone-600">Time off that will be considered when scheduling</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <EmployeeLeavesList employeeId={employee.id} />
        </CardContent>
      </Card>

      {employee.shifts && employee.shifts.length > 0 && (
        <Card className="border-stone-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-stone-900">Recent Shifts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {employee.shifts?.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 border border-stone-200 rounded-lg bg-stone-50/50">
                  <div>
                    <p className="font-medium text-stone-900">
                      {new Date(shift.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-stone-600">
                      {new Date(shift.startTime).toLocaleTimeString()} -{' '}
                      {new Date(shift.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-sm text-stone-600">{shift.position || 'Shift'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
