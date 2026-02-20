import { redirect } from 'next/navigation'

type PageProps = {
  searchParams?: Promise<{ create?: string }> | { create?: string }
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const params = searchParams ?? {}
  const resolved = typeof (params as Promise<unknown>).then === 'function'
    ? await (params as Promise<{ create?: string }>)
    : (params as { create?: string })
  const create = resolved.create === 'true' ? 'true' : ''
  redirect(`/schedules${create ? '?create=true' : ''}`)
}
