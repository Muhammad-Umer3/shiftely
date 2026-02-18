'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Users, Calendar, Clock, Zap } from 'lucide-react'

type Metrics = {
  schedulesCreated: number
  employeesScheduled: number
  shiftsScheduled: number
  totalHours: number
  timeSaved: number
}

export function AnalyticsDashboard({ metrics }: { metrics: Metrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-900">Schedules Created</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">{metrics.schedulesCreated}</div>
            <p className="text-xs text-stone-600">This month</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-900">Employees</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">{metrics.employeesScheduled}</div>
            <p className="text-xs text-stone-600">Total employees</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-900">Shifts Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">{metrics.shiftsScheduled}</div>
            <p className="text-xs text-stone-600">This month</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-900">Total Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">{metrics.totalHours.toFixed(0)}h</div>
            <p className="text-xs text-stone-600">Scheduled this month</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-900">Time Saved</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900">{metrics.timeSaved}h</div>
            <p className="text-xs text-stone-600">Estimated this month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-900">Performance Overview</CardTitle>
          <CardDescription className="text-stone-600">Key metrics and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-stone-200 rounded-lg bg-stone-50/50">
              <div>
                <p className="font-medium text-stone-900">Average Shifts per Schedule</p>
                <p className="text-sm text-stone-600">
                  {metrics.schedulesCreated > 0
                    ? (metrics.shiftsScheduled / metrics.schedulesCreated).toFixed(1)
                    : 0}{' '}
                  shifts
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-stone-200 rounded-lg bg-stone-50/50">
              <div>
                <p className="font-medium text-stone-900">Average Hours per Employee</p>
                <p className="text-sm text-stone-600">
                  {metrics.employeesScheduled > 0
                    ? (metrics.totalHours / metrics.employeesScheduled).toFixed(1)
                    : 0}{' '}
                  hours
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-stone-200 rounded-lg bg-stone-50/50">
              <div>
                <p className="font-medium text-stone-900">Efficiency Score</p>
                <p className="text-sm text-stone-600">
                  {metrics.timeSaved > 0
                    ? ((metrics.timeSaved / (metrics.timeSaved + metrics.shiftsScheduled * 0.5)) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
