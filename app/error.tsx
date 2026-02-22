'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function isDatabaseConnectionError(error: Error): boolean {
  const msg = error.message?.toLowerCase() ?? ''
  return (
    msg.includes('fetch failed') ||
    msg.includes('cannot fetch data from service') ||
    msg.includes("can't reach database") ||
    msg.includes('connection refused') ||
    msg.includes('connection timed out') ||
    msg.includes('prismaclientknownrequesterror')
  )
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error)
  }, [error])

  const isDbError = isDatabaseConnectionError(error)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">Something went wrong!</CardTitle>
          <CardDescription>
            {isDbError ? (
              <>
                The app could not connect to the database. Check that <code className="rounded bg-muted px-1">.env</code> has a valid{' '}
                <code className="rounded bg-muted px-1">DATABASE_URL</code>, your database server is running, and the host/port are reachable.
              </>
            ) : (
              <>We encountered an unexpected error. Please try again.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-muted rounded text-sm font-mono text-xs overflow-auto">
              {error.message}
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')}>
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
