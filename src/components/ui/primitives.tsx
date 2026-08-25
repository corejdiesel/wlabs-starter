import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Themeable primitives. These read design tokens only — no component here or
 * in any block hard-codes a colour, font or size. That constraint is what
 * makes a rebrand a token edit rather than a component hunt.
 */

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full px-6 ${className}`} style={{ maxWidth: 'var(--width-container)' }}>
      {children}
    </div>
  )
}

export function Section({
  children,
  alt = false,
  className = '',
}: {
  children: ReactNode
  alt?: boolean
  className?: string
}) {
  return (
    <section
      className={className}
      style={{
        paddingBlock: 'var(--spacing-section)',
        background: alt ? 'var(--color-surface-alt)' : 'var(--color-surface)',
      }}
    >
      {children}
    </section>
  )
}

export function Heading({
  children,
  level = 2,
  hero = false,
}: {
  children: ReactNode
  level?: 1 | 2 | 3
  hero?: boolean
}) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  return <Tag style={{ fontSize: hero ? 'var(--text-hero)' : 'var(--text-section)' }}>{children}</Tag>
}

export function Prose({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className="flex flex-col gap-4 leading-relaxed"
      style={{ maxWidth: wide ? '100%' : 'var(--width-prose)', color: 'var(--color-ink-muted)' }}
    >
      {children}
    </div>
  )
}

export function Button({ href, children }: { href?: string | null; children: ReactNode }) {
  if (!href || !children) return null

  const className =
    'inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-opacity hover:opacity-85'
  const style = {
    background: 'var(--color-brand)',
    color: 'var(--color-brand-contrast)',
    borderRadius: 'var(--radius-base)',
  }

  // Internal links go through next/link for client-side navigation and
  // prefetching; anything absolute is a plain anchor.
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={className} style={style} rel="noopener noreferrer">
      {children}
    </a>
  )
}
