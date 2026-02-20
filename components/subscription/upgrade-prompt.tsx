'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowUp } from 'lucide-react'

interface UpgradePromptProps {
  title: string
  description: string
  currentTier?: string
}

export function UpgradePrompt({ title, description, currentTier }: UpgradePromptProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUp className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/settings">
          <Button className="w-full">
            Upgrade Plan
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
