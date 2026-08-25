import type { Metadata } from 'next'
import Link from 'next/link'
import '@/styles/globals.css'
import { getGlobal } from '@/lib/payload'
import { Container } from '@/components/ui/primitives'

type Nav = { items?: Array<{ label: string; href: string }> }
type Settings = { siteName?: string; tagline?: string }
type FooterData = { text?: string; links?: Array<{ label: string; href: string }> }

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobal<Settings>('site-settings')
  return {
    title: { default: settings?.siteName ?? 'New site', template: `%s — ${settings?.siteName ?? ''}` },
    description: settings?.tagline ?? undefined,
    metadataBase: process.env.NEXT_PUBLIC_SERVER_URL ? new URL(process.env.NEXT_PUBLIC_SERVER_URL) : undefined,
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav, footer] = await Promise.all([
    getGlobal<Settings>('site-settings'),
    getGlobal<Nav>('navigation'),
    getGlobal<FooterData>('footer'),
  ])

  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2"
          style={{ background: 'var(--color-brand)', color: 'var(--color-brand-contrast)' }}
        >
          Skip to content
        </a>

        <header style={{ borderBottom: '1px solid var(--color-line)' }}>
          <Container>
            <div className="flex items-center justify-between py-5">
              <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                {settings?.siteName ?? 'New site'}
              </Link>
              <nav className="flex gap-7 text-sm">
                {(nav?.items ?? []).map((item) => (
                  <Link key={item.href} href={item.href} className="hover:opacity-70">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </Container>
        </header>

        <main id="main">{children}</main>

        <footer style={{ borderTop: '1px solid var(--color-line)' }}>
          <Container>
            <div
              className="flex flex-col gap-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              <p>
                {footer?.text ? `${footer.text} · ` : ''}© {new Date().getFullYear()} {settings?.siteName ?? ''}
              </p>
              <nav className="flex gap-6">
                {(footer?.links ?? []).map((link) => (
                  <Link key={link.href} href={link.href} className="hover:opacity-70">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </Container>
        </footer>
      </body>
    </html>
  )
}
