import { format } from 'date-fns'

/**
 * Slugify a string for use in URLs: lowercase, replace spaces/special with hyphens.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'schedule'
}

/**
 * Generate a schedule slug: "name - week" style, plus short id suffix for uniqueness.
 * e.g. "Front of House" + Jan 13, 2025 + "abc12" -> "front-of-house-jan-13-2025-abc12"
 */
export function generateScheduleSlug(
  name: string | null,
  weekStartDate: Date,
  idSuffix: string
): string {
  const weekPart = format(weekStartDate, 'MMM-d-yyyy')
  const namePart = (name || 'week').trim()
  const base = slugify(`${namePart} - ${weekPart}`)
  const suffix = idSuffix.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase() || 'x'
  return `${base}-${suffix}`
}
