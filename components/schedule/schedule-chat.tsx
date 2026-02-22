'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { toast } from 'sonner'

type ChatUser = {
  id: string
  name: string | null
  email: string
}

type ChatMessage = {
  id: string
  scheduleId: string
  userId: string | null
  body: string
  type: string
  metadata: { kind?: string; swapId?: string } | null
  createdAt: string
  user: ChatUser | null
}

const POLL_INTERVAL_MS = 8000

export function ScheduleChat({ scheduleId }: { scheduleId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const [processingSwapId, setProcessingSwapId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastSinceRef = useRef<string | null>(null)

  const fetchMessages = async (since?: string) => {
    const url = since
      ? `/api/schedules/${scheduleId}/chat?since=${encodeURIComponent(since)}`
      : `/api/schedules/${scheduleId}/chat?limit=50`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.messages ?? []
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const res = await fetch(`/api/schedules/${scheduleId}/chat?limit=50`)
      if (!mounted) return
      if (!res.ok) {
        setMessages([])
        setLoading(false)
        return
      }
      const json = await res.json()
      const list = Array.isArray(json.messages) ? json.messages : []
      setMessages(list)
      if (list.length > 0) lastSinceRef.current = list[list.length - 1].createdAt
      setLoading(false)
    }
    load()
    const interval = setInterval(async () => {
      const since = lastSinceRef.current
      if (!since || !mounted) return
      const newOnes = await fetchMessages(since)
      if (!mounted || newOnes.length === 0) return
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id))
        const added = newOnes.filter((m) => !existingIds.has(m.id))
        if (added.length === 0) return prev
        const next = [...prev, ...added].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        if (next.length > 0) lastSinceRef.current = next[next.length - 1].createdAt
        return next
      })
    }, POLL_INTERVAL_MS)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [scheduleId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text }),
      })
      const json = await res.json()
      if (res.ok && json.message) {
        setMessages((prev) => {
          const next = [...prev, json.message]
          lastSinceRef.current = json.message.createdAt
          return next
        })
        setInput('')
      } else {
        toast.error(json.message || 'Failed to send message')
      }
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleApprove = async (swapId: string) => {
    setProcessingSwapId(swapId)
    try {
      const res = await fetch(`/api/swaps/${swapId}/approve`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        toast.success('Swap approved')
        const newOnes = await fetchMessages(lastSinceRef.current ?? undefined)
        if (newOnes.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const added = newOnes.filter((m) => !existingIds.has(m.id))
            const next = [...prev, ...added].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
            if (next.length > 0) lastSinceRef.current = next[next.length - 1].createdAt
            return next
          })
        }
      } else {
        toast.error(json.message || 'Failed to approve')
      }
    } catch {
      toast.error('Failed to approve')
    } finally {
      setProcessingSwapId(null)
    }
  }

  const handleReject = async (swapId: string) => {
    setProcessingSwapId(swapId)
    try {
      const res = await fetch(`/api/swaps/${swapId}/reject`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        toast.success('Swap rejected')
        const newOnes = await fetchMessages(lastSinceRef.current ?? undefined)
        if (newOnes.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const added = newOnes.filter((m) => !existingIds.has(m.id))
            const next = [...prev, ...added].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
            if (next.length > 0) lastSinceRef.current = next[next.length - 1].createdAt
            return next
          })
        }
      } else {
        toast.error(json.message || 'Failed to reject')
      }
    } catch {
      toast.error('Failed to reject')
    } finally {
      setProcessingSwapId(null)
    }
  }

  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader>
        <CardTitle className="text-stone-900 text-lg">Schedule chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col rounded-lg border border-stone-200 bg-stone-50/50 min-h-[280px] max-h-[400px]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-6 text-stone-500 text-sm">
              Loading…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-stone-500 text-sm">
              No messages yet. Start the conversation or request a swap to see it here.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m) => (
                <div key={m.id}>
                  {m.type === 'system' ? (
                    <div className="flex flex-col gap-1.5">
                      <div className="text-sm text-stone-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        {m.body}
                      </div>
                      {m.metadata?.kind === 'swap_requested' && m.metadata?.swapId && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600 text-stone-950"
                            onClick={() => handleApprove(m.metadata!.swapId!)}
                            disabled={processingSwapId === m.metadata!.swapId}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-stone-300 text-stone-700"
                            onClick={() => handleReject(m.metadata!.swapId!)}
                            disabled={processingSwapId === m.metadata!.swapId}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <p className="text-xs text-stone-500">
                        {m.user?.name || m.user?.email || 'Someone'} ·{' '}
                        {format(new Date(m.createdAt), 'MMM d, h:mm a')}
                      </p>
                      <p className="text-sm text-stone-900 break-words">{m.body}</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
          <div className="border-t border-stone-200 p-2 flex gap-2">
            <Input
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="flex-1"
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950"
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
