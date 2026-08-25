/**
 * Renders in place of a missing image, so a half-populated site still looks
 * deliberate rather than broken. A client can be handed a finished-looking
 * site before they have supplied a single asset — which is usually what the
 * schedule actually waits on.
 */
export function Placeholder({ ratio = '16 / 9', label }: { ratio?: string; label?: string }) {
  return (
    <div
      aria-hidden="true"
      className="grid w-full place-items-center overflow-hidden"
      style={{
        aspectRatio: ratio,
        background: 'var(--color-surface-alt)',
        border: '1px solid var(--color-line)',
        borderRadius: 'var(--radius-base)',
        color: 'var(--color-ink-muted)',
      }}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      {label ? <span className="mt-2 text-xs tracking-wide uppercase">{label}</span> : null}
    </div>
  )
}
