/**
 * Personal email domains (consumer providers). Registration is restricted to work/organization emails.
 * All entries must be lowercase; getEmailDomain() normalizes before lookup.
 */
const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.de',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'outlook.co.uk',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'mail.com',
  'protonmail.com',
  'proton.me',
  'zoho.com',
  'ymail.com',
  'gmx.com',
  'gmx.net',
  'fastmail.com',
  'tutanota.com',
  'mailfence.com',
  'yandex.com',
  'rambler.ru',
  'inbox.com',
  'rediffmail.com',
  'web.de',
  'orange.fr',
  'free.fr',
  'laposte.net',
  'wp.pl',
  'o2.pl',
  'seznam.cz',
  'libero.it',
  'virgilio.it',
  'terra.com.br',
  'bol.com.br',
  'uol.com.br',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'naver.com',
  'daum.net',
  'hanmail.net',
  'sky.com',
  'btinternet.com',
  'ntlworld.com',
  'comcast.net',
  'verizon.net',
  'att.net',
  'charter.net',
  'cox.net',
  'sbcglobal.net',
  'bellsouth.net',
  'earthlink.net',
])

/**
 * Extract the domain from an email (part after @), lowercased.
 * Returns empty string if the email has no @ or invalid format.
 */
export function getEmailDomain(email: string): string {
  if (!email || typeof email !== 'string') return ''
  const at = email.indexOf('@')
  if (at === -1 || at === email.length - 1) return ''
  return email.slice(at + 1).trim().toLowerCase()
}

/**
 * Returns true if the email's domain is in the personal-email blocklist.
 */
export function isPersonalEmailDomain(email: string): boolean {
  const domain = getEmailDomain(email)
  return domain.length > 0 && PERSONAL_EMAIL_DOMAINS.has(domain)
}

/** Common two-part TLDs: we use the label before these (e.g. acme.co.uk → acme). */
const TWO_PART_TLDS = new Set([
  'co.uk',
  'com.au',
  'co.nz',
  'co.za',
  'co.jp',
  'com.br',
  'com.mx',
  'co.in',
  'com.ar',
  'co.kr',
  'com.sg',
  'com.hk',
  'com.tw',
  'com.my',
  'co.id',
  'com.ph',
  'com.vn',
  'com.eg',
  'co.th',
  'com.pk',
  'org.uk',
  'ac.uk',
  'net.au',
  'gov.uk',
])

/**
 * Derive a display organization name from an email domain.
 * - user@acme.com → "Acme"
 * - user@mail.acme.co.uk → "Acme" (two-part TLD: use label before .co.uk)
 * - user@my-company.com → "My Company"
 * Returns "Organization" if derivation fails (invalid email or empty domain).
 */
export function organizationNameFromEmail(email: string): string {
  const domain = getEmailDomain(email)
  if (!domain) return 'Organization'

  const parts = domain.split('.').filter(Boolean)
  if (parts.length === 0) return 'Organization'

  let label: string
  if (parts.length >= 2 && TWO_PART_TLDS.has(`${parts[parts.length - 2]}.${parts[parts.length - 1]}`)) {
    // e.g. acme.co.uk → use "acme"
    label = parts[parts.length - 3] ?? parts[0] ?? ''
  } else {
    // e.g. acme.com → use "acme"; company.xyz → use "company"
    label = parts[0] ?? ''
  }

  if (!label) return 'Organization'

  // Title-case and replace hyphens with spaces: "my-company" → "My Company"
  const words = label.split('-').map((w) => {
    if (w.length === 0) return w
    return w[0].toUpperCase() + w.slice(1).toLowerCase()
  })
  return words.join(' ').trim() || 'Organization'
}
