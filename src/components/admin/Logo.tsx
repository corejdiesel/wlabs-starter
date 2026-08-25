/**
 * White-label slot. Swapping these two marks for the client's brand is one of
 * the ten steps in the per-project checklist — keep them as inline SVG so
 * there is no asset to upload or path to break.
 */
export function Logo() {
  return (
    <svg width="150" height="34" viewBox="0 0 150 34" fill="none" aria-label="Site admin">
      <rect width="34" height="34" rx="7" fill="currentColor" opacity="0.12" />
      <path d="M9 12l3.4 10L15 15l2.6 7L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x="44" y="23" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="600" fill="currentColor">
        Studio
      </text>
    </svg>
  )
}

export function Icon() {
  return (
    <svg width="26" height="26" viewBox="0 0 34 34" fill="none" aria-label="Admin">
      <rect width="34" height="34" rx="7" fill="currentColor" opacity="0.12" />
      <path d="M9 12l3.4 10L15 15l2.6 7L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
