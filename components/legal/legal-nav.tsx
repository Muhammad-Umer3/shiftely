import Link from 'next/link'

export function LegalNav() {
  const linkClass = "hover:text-foreground underline underline-offset-2 cursor-pointer transition-colors text-amber-600 hover:text-amber-500"
  return (
    <nav
      className="relative z-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground border-t pt-6 mt-8"
      aria-label="Legal pages"
    >
      <Link href="/terms" className={linkClass}>
        Terms
      </Link>
      <span aria-hidden className="select-none">·</span>
      <Link href="/privacy" className={linkClass}>
        Privacy
      </Link>
      <span aria-hidden className="select-none">·</span>
      <Link href="/cookies" className={linkClass}>
        Cookies
      </Link>
      <span aria-hidden className="select-none">·</span>
      <Link href="/contact" className={linkClass}>
        Contact
      </Link>
    </nav>
  )
}
