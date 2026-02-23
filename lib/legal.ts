/**
 * Shared constants for legal pages (Terms, Privacy, Cookie Policy).
 * Update LEGAL_LAST_UPDATED when you revise any of these documents.
 */

export const LEGAL_LAST_UPDATED = '2025-02-23'

export const LEGAL = {
  companyName: 'Shiftely',
  supportEmail: 'support@shiftely.com',
  privacyEmail: 'privacy@shiftely.com',
  /** Format for display in UI */
  lastUpdatedFormatted: (() => {
    const [y, m, d] = LEGAL_LAST_UPDATED.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })(),
} as const
