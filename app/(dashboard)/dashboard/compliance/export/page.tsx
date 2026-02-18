'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { format, startOfWeek } from 'date-fns'

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(
        `/api/export/payroll?weekStartDate=${weekStart.toISOString()}`
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payroll-${format(weekStart, 'yyyy-MM-dd')}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to export payroll data')
      }
    } catch (error) {
      alert('An error occurred while exporting')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export Payroll</h1>
        <p className="text-muted-foreground">Export employee hours and payroll data to CSV</p>
      </div>

      <div className="max-w-md space-y-4">
        <div className="p-4 border rounded-lg">
          <p className="font-medium mb-2">Week of {format(weekStart, 'MMMM d, yyyy')}</p>
          <p className="text-sm text-muted-foreground">
            Export includes: employee hours, overtime, regular pay, overtime pay, and total pay
          </p>
        </div>

        <Button onClick={handleExport} disabled={isExporting} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Payroll CSV'}
        </Button>
      </div>
    </div>
  )
}
