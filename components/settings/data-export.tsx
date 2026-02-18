'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

export function DataExport() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/export-data')
      
      if (!response.ok) {
        toast.error('Failed to export data')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shiftely-data-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('An error occurred while exporting data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>
          Download all your data in JSON format (GDPR compliant)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          You can download all your personal data including schedules, shifts, notifications, and account information.
        </p>
        <Button onClick={handleExport} disabled={loading} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Exporting...' : 'Export Data'}
        </Button>
      </CardContent>
    </Card>
  )
}
